const Attendance = require("../models/Attendance");
const User = require("../models/User");
const logger = require("../config/logger");
const {
  calculateHours,
  calculateOvertimeHours,
  isShiftComplete,
  isValidPunchRange,
  normalizeDateOnly,
} = require("../utils/workingHours");

const recalculateDailyAttendance = async ({ employeeId, punchDate, isAdmin }) => {
  const records = await Attendance.find({
    employeeId,
    punchInDate: punchDate,
    punchOutTime: { $ne: null },
  }).sort({ punchInTime: 1 });

  const dailyTotalHours = records.reduce((sum, record) => sum + Number(record.totalHours || 0), 0);
  let cumulativeHours = 0;

  await Promise.all(records.map((record) => {
    const previousOvertime = calculateOvertimeHours(cumulativeHours);
    cumulativeHours += Number(record.totalHours || 0);
    const currentOvertime = calculateOvertimeHours(cumulativeHours);
    const recordOvertime = isAdmin ? 0 : Math.round((currentOvertime - previousOvertime) * 100) / 100;

    record.workStatus = isShiftComplete(dailyTotalHours) ? "completed" : "incomplete";
    record.overtimeHours = recordOvertime;

    if (recordOvertime <= 0 && !["pending", "approved", "rejected"].includes(record.overtimeStatus)) {
      record.overtimeStatus = "none";
    }

    return record.save();
  }));

  return dailyTotalHours;
};

const punchIn = async (req, res) => {
  const { selfie, location } = req.body;

  if (!selfie)
    return res.status(400).json({ message: "Selfie is required" });

  if (
    !location ||
    typeof location.lat !== "number" ||
    typeof location.lng !== "number"
  ) {
    return res.status(400).json({ message: "Valid location is required" });
  }

  try {
    const existing = await Attendance.findOne({
      employeeId: req.user._id,
      punchOutTime: null,
    });

    if (existing)
      return res.status(400).json({
        message: "You already have an open punch. Please punch out first.",
      });

    const isAdmin = req.user.role === "admin";
    const punchInTime = new Date();

    const attendance = await Attendance.create({
      employeeId: req.user._id,
      punchInTime,
      punchInDate: normalizeDateOnly(punchInTime),
      selfie,
      location,
      status: isAdmin ? "valid" : "pending",
      validatedBy: isAdmin ? req.user._id : undefined,
      remarks: isAdmin ? "Auto-approved for admin" : undefined,
    });

    res.status(201).json(attendance);
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack, path: req.path });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const punchOut = async (req, res) => {
  const { selfie } = req.body;

  if (!selfie)
    return res.status(400).json({ message: "Punch out selfie is required" });

  try {
    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      punchOutTime: null,
    });

    if (!attendance)
      return res.status(404).json({ message: "No active punch found" });

    const punchOutTime = new Date();
    if (!isValidPunchRange(attendance.punchInTime, punchOutTime)) {
      return res.status(400).json({
        message: "Punch out date and time cannot be earlier than punch in date and time",
      });
    }

    const totalHours = calculateHours(attendance.punchInTime, punchOutTime);
    const overtimeHours = req.user.role === "admin" ? 0 : calculateOvertimeHours(totalHours);

    attendance.punchOutTime = punchOutTime;
    attendance.punchOutDate = normalizeDateOnly(punchOutTime);
    attendance.punchOutSelfie = selfie;
    attendance.totalHours = totalHours;
    attendance.workStatus = "incomplete";
    attendance.overtimeHours = overtimeHours;
    if (overtimeHours <= 0 && attendance.overtimeStatus !== "pending") {
      attendance.overtimeStatus = "none";
    }
    await attendance.save();
    await recalculateDailyAttendance({
      employeeId: req.user._id,
      punchDate: attendance.punchInDate,
      isAdmin: req.user.role === "admin",
    });

    res.json(attendance);
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack, path: req.path });
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({
      employeeId: req.user._id,
    }).sort({ punchInTime: -1 });

    res.json(records);
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamAttendance = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const team = await User.find({ managerId: req.user._id }).select(
      "_id name email"
    );

    const teamIds = team.map((employee) => employee._id);

    const [records, total] = await Promise.all([
      Attendance.find({ employeeId: { $in: teamIds } })
        .populate("employeeId", "name email role")
        .populate("validatedBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments({ employeeId: { $in: teamIds } }),
    ]);

    res.status(200).json({
      success: true,
      teamCount: team.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      records,
    });
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const validateAttendance = async (req, res) => {
  const { status, remarks } = req.body;

  const VALID_STATUSES = ["valid", "invalid"];
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Status must be "valid" or "invalid"' });
  }

  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          remarks,
          validatedBy: req.user._id,
        },
      },
      { new: true, runValidators: false }
    );

    if (!attendance)
      return res.status(404).json({ message: "Attendance not found" });

    res.json({ message: "Attendance validated", attendance });
  } catch (error) {
    logger.error({ message: error.message, stack: error.stack });
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
  getTeamAttendance,
  validateAttendance,
};
