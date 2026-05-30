import { useCallback } from 'react';
import { exportAttendanceToExcel } from '../utils/attendanceExcel';

const useAttendanceExcelExport = ({ records, filename, getEmployee }) => {
  return useCallback(() => {
    exportAttendanceToExcel({ records, filename, getEmployee });
  }, [filename, getEmployee, records]);
};

export default useAttendanceExcelExport;
