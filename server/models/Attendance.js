const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    punchInTime: { type: Date, required: true },
    punchInDate: { type: Date, required: true },
    punchOutTime: { type: Date },
    punchOutDate: { type: Date },
    totalHours: { type: Number, default: 0 },
    selfie: {
      type: String,
      required: true,
      validate: {
        validator: (v) => typeof v === "string" && v.length > 0,
        message: "Selfie must be a non-empty string",
      },
    },
    punchOutSelfie: {
      type: String,
      validate: {
        validator: (v) => v == null || (typeof v === "string" && v.length > 0),
        message: "Punch out selfie must be a non-empty string",
      },
    },
    location: {
      lat: { type: Number, required: true, min: -90, max: 90 },
      lng: { type: Number, required: true, min: -180, max: 180 },
    },
    status: {
      type: String,
      enum: ["valid", "invalid", "pending"],
      default: "pending",
    },
    workStatus: {
      type: String,
      enum: ["completed", "incomplete", "open"],
      default: "open",
    },
    remarks: { type: String },
    validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    overtimeHours: { type: Number, default: 0 },
    overtimeStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
  },
  { timestamps: true }
);

const normalizeDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
};

attendanceSchema.pre("validate", function setPunchDates() {
  if (this.punchInTime) {
    this.punchInDate = normalizeDateOnly(this.punchInTime);
  }

  if (this.punchOutTime) {
    this.punchOutDate = normalizeDateOnly(this.punchOutTime);
  }

  if (this.punchInTime && this.punchOutTime && this.punchOutTime < this.punchInTime) {
    this.invalidate("punchOutTime", "Punch out date and time cannot be earlier than punch in date and time");
  }
});

module.exports = mongoose.model("Attendance", attendanceSchema);
