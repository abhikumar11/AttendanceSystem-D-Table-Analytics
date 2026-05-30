import * as XLSX from 'xlsx';

const ATTENDANCE_HEADERS = [
  'Employee',
  'Email',
  'Punch In Date',
  'Punch In Time',
  'Punch Out Date',
  'Punch Out Time',
  'Total Hours',
  'Work Status',
  'Overtime Hours',
  'Overtime Status',
  'Attendance Status',
  'Remarks',
];

export const formatAttendanceDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
};

export const formatAttendanceTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
};

const toAttendanceRow = (record, employee) => [
  employee?.name || '',
  employee?.email || '',
  formatAttendanceDate(record.punchInDate || record.punchInTime),
  formatAttendanceTime(record.punchInTime),
  record.punchOutTime ? formatAttendanceDate(record.punchOutDate || record.punchOutTime) : '',
  record.punchOutTime ? formatAttendanceTime(record.punchOutTime) : '',
  record.totalHours ?? 0,
  record.workStatus || '',
  record.overtimeHours ?? 0,
  record.overtimeStatus || '',
  record.status || '',
  record.remarks || '',
];

export const exportAttendanceToExcel = ({ records, filename, getEmployee }) => {
  if (!records?.length) {
    return;
  }

  const rows = records.map((record) => toAttendanceRow(record, getEmployee(record)));
  const worksheet = XLSX.utils.aoa_to_sheet([ATTENDANCE_HEADERS, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};
