const mongoose = require("mongoose");

const overtimeSchema = new mongoose.Schema(
     {
          employeeId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "User",
               required: true,
          },
          attendanceId: {
               type: mongoose.Schema.Types.ObjectId,
               ref: "Attendance",
               required: true,
          },
          requestedHours: { type: Number, required: true, min: 0.5 },
          reason: { type: String, required: true },
          status: {
               type: String,
               enum: ["pending", "approved", "rejected"],
               default: "pending",
          },
          reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          rejectionReason: { type: String },
     },
     { timestamps: true },
);

module.exports = mongoose.model("Overtime", overtimeSchema);
