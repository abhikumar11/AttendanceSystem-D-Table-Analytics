import { useCallback } from 'react';
import {
  useGetAllUsersQuery,
  useGetSystemAttendanceQuery,
} from '../features/apiSlice';
import AttendanceTable from '../components/AttendanceTable';
import Navbar from '../components/Navbar';
import useAttendanceExcelExport from '../hooks/useAttendanceExcelExport';
import useUserAttendanceSelection from '../hooks/useUserAttendanceSelection';

const roleStyles = {
  admin: 'bg-purple-100 text-purple-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-green-100 text-green-700',
};

const UserManagement = () => {
  const { data: users = [] } = useGetAllUsersQuery();
  const { data: systemAttendance = [] } = useGetSystemAttendanceQuery();
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
  } = useUserAttendanceSelection({ users, attendance: systemAttendance });
  const getEmployee = useCallback(() => selectedUser, [selectedUser]);
  const exportAttendance = useAttendanceExcelExport({
    records: selectedUserAttendance,
    filename: `${selectedUser?.name?.replace(/\s+/g, '_') || 'user'}_attendance.xlsx`,
    getEmployee,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Review registered users and roles.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">All Users</h2>
          {users?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['User', 'Email', 'Role'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const initials = u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
                    return (
                      <tr
                        key={u._id}
                        onClick={() => selectUser(u._id)}
                        className={`hover:bg-gray-50 transition cursor-pointer ${
                          selectedUserId === u._id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                              {initials}
                            </div>
                            <span className="font-medium text-gray-900">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                              roleStyles[u.role] || 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">No users found.</p>
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
                onChange={(e) => setDateFilter(e.target.value)}
                className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

export default UserManagement;
