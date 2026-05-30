import { useCallback, useMemo } from 'react';
import { useGetTeamAttendanceQuery } from '../features/apiSlice';
import AttendanceTable from '../components/AttendanceTable';
import Navbar from '../components/Navbar';
import useAttendanceExcelExport from '../hooks/useAttendanceExcelExport';
import useUserAttendanceSelection from '../hooks/useUserAttendanceSelection';

const getTeamRecords = (teamAttendance) => (
  Array.isArray(teamAttendance) ? teamAttendance : teamAttendance?.records || []
);

const getTeamMembers = (records) => {
  const members = new Map();
  records.forEach((record) => {
    if (record.employeeId?._id) {
      members.set(record.employeeId._id, record.employeeId);
    }
  });
  return [...members.values()];
};

const ManagerTeamMembers = () => {
  const { data: teamAttendance, isLoading, error } = useGetTeamAttendanceQuery();
  const teamRecords = getTeamRecords(teamAttendance);
  const teamMembers = useMemo(() => getTeamMembers(teamRecords), [teamRecords]);
  const {
    clearFilters,
    dateFilter,
    selectedUser,
    selectedUserAttendance,
    selectedUserId,
    selectUser,
    setDateFilter,
    setStatusFilter,
    statusFilter,
  } = useUserAttendanceSelection({ users: teamMembers, attendance: teamRecords });
  const getEmployee = useCallback(() => selectedUser, [selectedUser]);
  const exportAttendance = useAttendanceExcelExport({
    records: selectedUserAttendance,
    filename: `${selectedUser?.name?.replace(/\s+/g, '_') || 'team_member'}_attendance.xlsx`,
    getEmployee,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">Select a team member to view and export their attendance.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Members</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Loading team members...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">Failed to load team members.</div>
          ) : teamMembers.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {teamMembers.map((member) => {
                    const initials = member.name?.split(' ').map((name) => name[0]).join('').toUpperCase().slice(0, 2) || '?';
                    return (
                      <tr
                        key={member._id}
                        onClick={() => selectUser(member._id)}
                        className={`hover:bg-gray-50 transition cursor-pointer ${
                          selectedUserId === member._id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                              {initials}
                            </div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{member.email}</td>
                        <td className="px-4 py-3 text-gray-500 capitalize">{member.role || 'employee'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No team attendance records found.</div>
          )}
        </div>

        {selectedUser && (
          <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">{selectedUser.name} Attendance</h2>
                <p className="text-xs text-gray-400">{selectedUser.email}</p>
              </div>

              <input
                type="date"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="valid">Valid</option>
                <option value="invalid">Invalid</option>
              </select>
              {(dateFilter || statusFilter) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Clear filters
                </button>
              )}
              <button
                onClick={exportAttendance}
                disabled={!selectedUserAttendance.length}
                className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white px-3 py-1.5 rounded-lg transition"
              >
                Export Excel
              </button>
            </div>

            <AttendanceTable
              records={selectedUserAttendance}
              isManagerOrAdmin={true}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ManagerTeamMembers;
