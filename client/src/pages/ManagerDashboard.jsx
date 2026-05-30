import {
  useGetTeamAttendanceQuery,
  useGetPendingOvertimeQuery,
} from '../features/apiSlice';
import MyAttendanceSection from '../components/MyAttendanceSection';
import Navbar from '../components/Navbar';

const ManagerDashboard = () => {
  const {
    data: teamAttendance,
    isLoading: loadingAttendance,
  } = useGetTeamAttendanceQuery();
  const { data: pendingOT } = useGetPendingOvertimeQuery();

  const teamRecords = Array.isArray(teamAttendance)
    ? teamAttendance
    : teamAttendance?.records || [];
  const pendingCount = pendingOT?.length || 0;
  const teamCount = teamRecords.length;
  const teamMemberCount = new Set(
    teamRecords.map((record) => record.employeeId?._id || record.employeeId).filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-sm text-gray-500">Review team attendance and overtime requests</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team Records</p>
            {loadingAttendance ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">{teamCount}</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending OT Requests</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              {pendingCount > 0 && (
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  Needs review
                </span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Team Members</p>
            {loadingAttendance ? (
              <div className="h-8 w-16 bg-gray-100 animate-pulse rounded mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">{teamMemberCount}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">My Attendance</h2>
          <MyAttendanceSection />
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
