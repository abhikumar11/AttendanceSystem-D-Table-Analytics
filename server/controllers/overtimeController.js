const OvertimeRequest = require("../models/Overtime");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const logger = require("../config/logger");

const requestOvertime = async (req, res) => {
  const { attendanceId, requestedHours, reason } = req.body;

  if (req.user.role === 'admin') {
    return res.status(403).json({ message: 'Admins cannot request overtime' });
  }

  if (!Number.isFinite(Number(requestedHours)) || Number(requestedHours) < 0.5) {
    return res.status(400).json({ message: 'Requested hours must be at least 0.5' });
  }

  if (!reason?.trim()) {
    return res.status(400).json({ message: 'Reason is required' });
  }

  try {
    const attendance = await Attendance.findOne({ _id: attendanceId, employeeId: req.user._id });
    if (!attendance) return res.status(404).json({ message: 'Attendance record not found' });

    if (!attendance.punchOutTime) {
      return res.status(400).json({ message: 'You can request overtime only after punch out' });
    }

    const availableOvertimeHours = Number(attendance.overtimeHours || 0);
    if (availableOvertimeHours <= 0) {
      return res.status(400).json({ message: 'Overtime is available only after the daily total exceeds 8 hours' });
    }

    if (Number(requestedHours) > availableOvertimeHours) {
      return res.status(400).json({
        message: `Requested overtime cannot exceed ${availableOvertimeHours.toFixed(2)}h`,
      });
    }

    const existingApprovedRequest = await OvertimeRequest.findOne({
      employeeId: req.user._id,
      attendanceId,
      status: 'approved',
    });
    if (existingApprovedRequest || attendance.overtimeStatus === 'approved') {
      return res.status(400).json({
        message: 'Overtime is already approved for this attendance record.',
      });
    }

    const existingPendingRequest = await OvertimeRequest.findOne({
      employeeId: req.user._id,
      status: 'pending',
    });
    if (existingPendingRequest) {
      return res.status(400).json({
        message: 'You already have a pending overtime request. Please wait until it is approved or rejected.',
      });
    }

    const request = await OvertimeRequest.create({
      employeeId: req.user._id,
      attendanceId,
      requestedHours: Number(requestedHours),
      reason: reason.trim()
    });

    attendance.overtimeHours = Number(requestedHours);
    attendance.overtimeStatus = 'pending';
    await attendance.save();

    res.status(201).json(request);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyOvertime = async (req, res) => {
  try {
    const requests = await OvertimeRequest.find({ employeeId: req.user._id })
      .populate('attendanceId')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingOvertime = async (req, res) => {
  try {
    let query = { status: 'pending' };
    if (req.user.role === 'manager') {
      const team = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = team.map(m => m._id);
      query.employeeId = { $in: teamIds };
    }
    const requests = await OvertimeRequest.find(query).populate('employeeId', 'name email').populate('attendanceId');
    res.json(requests);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


const reviewOvertime = async (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  try {
    const request = await OvertimeRequest.findById(req.params.id)
      .populate('employeeId', 'managerId')
      .populate('attendanceId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (
      req.user.role === 'manager' &&
      String(request.employeeId?.managerId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'You can only review overtime requests from your team' });
    }

    if (request.attendanceId?.status !== 'valid') {
      return res.status(400).json({
        message: 'Approve the standard shift attendance before reviewing overtime',
      });
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    await request.save();

    if (status === 'approved') {
      await Attendance.findByIdAndUpdate(request.attendanceId._id, {
        overtimeHours: request.requestedHours,
        overtimeStatus: 'approved',
      });
    } else if (status === 'rejected') {
      await Attendance.findByIdAndUpdate(request.attendanceId._id, {
        overtimeStatus: 'rejected',
      });
    }

    res.json({ message: `Overtime ${status}`, request });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { requestOvertime, getMyOvertime, getPendingOvertime, reviewOvertime };
