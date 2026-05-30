import { useState } from 'react';
import {
  useAssignManagerMutation,
  useGetAllUsersQuery,
} from '../features/apiSlice';
import Navbar from '../components/Navbar';

const AssignManagers = () => {
  const { data: users, refetch: refetchUsers } = useGetAllUsersQuery();
  const [assignManager] = useAssignManagerMutation();
  const [assigningId, setAssigningId] = useState(null);
  const [selectedManagerByEmployee, setSelectedManagerByEmployee] = useState({});

  const employees = users?.filter((u) => u.role === 'employee') || [];
  const managers = users?.filter((u) => u.role === 'manager') || [];

  const handleAssignManager = async (employeeId) => {
    const managerId = selectedManagerByEmployee[employeeId];

    if (!managerId) {
      alert('Please select a manager');
      return;
    }

    setAssigningId(employeeId);
    try {
      await assignManager({ userId: employeeId, managerId }).unwrap();
      refetchUsers();
      setSelectedManagerByEmployee((current) => ({ ...current, [employeeId]: '' }));
    } catch (err) {
      alert(err.data?.message || 'Failed to assign manager');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Assign Managers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Assign reporting managers to employees.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Employees</h2>
          {employees.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No employees registered yet.</p>
          )}

          {employees.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Assign New Manager</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => {
                    const currentMgr = managers.find((m) => m._id === emp.managerId);
                    return (
                      <tr key={emp._id}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-400">{emp.email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {currentMgr ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700">
                              {currentMgr.name}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None assigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={selectedManagerByEmployee[emp._id] || ''}
                            onChange={(e) => {
                              setSelectedManagerByEmployee((current) => ({
                                ...current,
                                [emp._id]: e.target.value,
                              }));
                            }}
                            className="w-full max-w-xs px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">Select Manager</option>
                            {managers.map((mgr) => (
                              <option key={mgr._id} value={mgr._id}>
                                {mgr.name} ({mgr.email})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleAssignManager(emp._id)}
                            disabled={assigningId === emp._id}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {assigningId === emp._id ? 'Assigning...' : 'Assign'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssignManagers;
