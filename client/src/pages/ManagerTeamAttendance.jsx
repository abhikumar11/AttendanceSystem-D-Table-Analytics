import { useCallback } from 'react';
import {
  useGetPendingOvertimeQuery,
  useGetTeamAttendanceQuery,
  useValidateAttendanceMutation,
} from '../features/apiSlice';
import AttendanceTable from '../components/AttendanceTable';
import Navbar from '../components/Navbar';
import useAttendanceExcelExport from '../hooks/useAttendanceExcelExport';

const getTeamRecords = (teamAttendance) => (
  Array.isArray(teamAttendance) ? teamAttendance : teamAttendance?.records || []
);

const ManagerTeamAttendance = () => {
  const {
    data: teamAttendance,
    refetch: refetchAttendance,
    isLoading,
    error,
  } = useGetTeamAttendanceQuery();
  const { refetch: refetchOT } = useGetPendingOvertimeQuery();
  const [validateAttendance] = useValidateAttendanceMutation();
  const teamRecords = getTeamRecords(teamAttendance);
  const getEmployee = useCallback((record) => record.employeeId, []);
  const exportAttendance = useAttendanceExcelExport({
    records: teamRecords,
    filename: 'team_attendance.xlsx',
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
          <h1 className="text-xl font-bold text-gray-900">Team Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review and validate team attendance records.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-end mb-4">
            <button
              onClick={exportAttendance}
              disabled={!teamRecords.length}
              className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition"
            >
              Export Excel
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading attendance records...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Failed to load attendance. Please try again.</div>
          ) : (
            <AttendanceTable
              records={teamRecords}
              isManagerOrAdmin={true}
              onValidate={handleValidate}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ManagerTeamAttendance;
