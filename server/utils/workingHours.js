const MS_PER_HOUR = 1000 * 60 * 60;
const FULL_SHIFT_HOURS = 8;

const toValidDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const roundToTwo = (value) => {
  return Math.round(value * 100) / 100;
};

const normalizeDateOnly = (value) => {
  const date = toValidDate(value);
  if (!date) return null;

  date.setHours(0, 0, 0, 0);
  return date;
};

const isValidPunchRange = (punchIn, punchOut) => {
  const punchInDate = toValidDate(punchIn);
  const punchOutDate = toValidDate(punchOut);

  if (!punchInDate || !punchOutDate) return false;

  return punchOutDate >= punchInDate;
};

const calculateHours = (punchIn, punchOut) => {
  const punchInDate = toValidDate(punchIn);
  const punchOutDate = toValidDate(punchOut);

  if (!punchInDate || !punchOutDate) return 0;

  const diffMs = punchOutDate - punchInDate;

  if (diffMs <= 0) return 0;

  return roundToTwo(diffMs / MS_PER_HOUR);
};

const isShiftComplete = (hours = 0) => {
  return hours >= FULL_SHIFT_HOURS;
};

const calculateOvertimeHours = (hours = 0) => {
  if (hours <= FULL_SHIFT_HOURS) return 0;

  return roundToTwo(hours - FULL_SHIFT_HOURS);
};

module.exports = {
  FULL_SHIFT_HOURS,
  calculateHours,
  calculateOvertimeHours,
  isShiftComplete,
  isValidPunchRange,
  normalizeDateOnly,
};