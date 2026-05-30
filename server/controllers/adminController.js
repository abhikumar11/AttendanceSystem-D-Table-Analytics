const User=require("../models/User");
const Attendance=require("../models/Attendance");
const logger=require("../config/logger");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSystemAttendance = async (req, res) => {
  try {
    const records = await Attendance.find().populate('employeeId', 'name email').sort({ punchInTime: -1 });
    res.json(records);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

 const assignRole = async (req, res) => {
  const { userId, managerId } = req.body;

  try {
    const employee = await User.findById(userId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.role !== 'employee') {
      return res.status(400).json({ message: 'User is not an employee' });
    }

    const manager = await User.findById(managerId);
    if (!manager || manager.role !== 'manager') {
      return res.status(400).json({ message: 'Invalid manager' });
    }

    employee.managerId = managerId;
    await employee.save();

    res.json({ message: 'Manager assigned successfully', employee });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers, getSystemAttendance, assignRole };