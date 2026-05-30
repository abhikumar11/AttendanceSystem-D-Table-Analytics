const Attendance = require("../models/Attendance");
const User = require("../models/User");
const logger = require("../config/logger");
const { calculateHours } = require("../utils/workingHours");

const getDailyReport = async (req, res) => {
  const { date } = req.query;
  const targetDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

  try {
    let filter = {
      $or: [
        { punchInDate: startOfDay },
        { punchInDate: { $exists: false }, punchInTime: { $gte: startOfDay, $lte: endOfDay } },
      ],
    };
    if (req.user.role === 'employee') {
      filter.employeeId = req.user._id;
    } else if (req.user.role === 'manager') {
      const team = await User.find({ managerId: req.user._id }).select('_id');
      filter.employeeId = { $in: team.map(m => m._id) };
    }

    const records = await Attendance.find(filter).populate('employeeId', 'name email role');
    const report = records.map(rec => {
      const storedHours = rec.totalHours == null ? NaN : Number(rec.totalHours);
      const workingHours = rec.punchOutTime
        ? (Number.isFinite(storedHours)
            ? storedHours
            : calculateHours(rec.punchInTime, rec.punchOutTime))
        : null;

      return {
        name: rec.employeeId.name,
        email: rec.employeeId.email,
        punchIn: rec.punchInTime,
        punchOut: rec.punchOutTime,
        selfie: rec.selfie,
        punchOutSelfie: rec.punchOutSelfie,
        location: rec.location,
        workingHours,
        status: rec.status,
        remarks: rec.remarks
      };
    });

    res.json(report);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { getDailyReport };
