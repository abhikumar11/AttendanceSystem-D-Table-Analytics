import { useCallback } from 'react';
import {
  useGetPendingOvertimeQuery,
  useGetSystemAttendanceQuery,
  useValidateAttendanceMutation,
} from '../features/apiSlice';
import AttendanceTable from '../components/AttendanceTable';
import Navbar from '../components/Navbar';
import useAttendanceExcelExport from '../hooks/useAttendanceExcelExport';

const SystemAttendance = () => {
  const { refetch: refetchOT } = useGetPendingOvertimeQuery();
  const { data: systemAttendance, refetch: refetchAttendance } = useGetSystemAttendanceQuery();
  const [validateAttendance] = useValidateAttendanceMutation();
  const getEmployee = useCallback((record) => record.employeeId, []);
  const exportAttendance = useAttendanceExcelExport({
    records: systemAttendance || [],
    filename: 'system_attendance.xlsx',
    getEmployee,
  });

  const handleValidate = async (id, status, remarks) => {
    await validateAttendance({ id, data: { status, remarks } });
    refetchAttendance();
    refetchOT();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">System Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review attendance across the organization.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-end mb-4">
            <button
              onClick={exportAttendance}
              disabled={!systemAttendance?.length}
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition"
            >
              Export Excel
            </button>
          </div>
          <AttendanceTable
            records={systemAttendance || []}
            isManagerOrAdmin={true}
            onValidate={handleValidate}
          />
        </div>
      </main>
    </div>
  );
};

export default SystemAttendance;
