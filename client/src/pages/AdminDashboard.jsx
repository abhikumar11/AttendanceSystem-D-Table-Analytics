import {
  useGetAllUsersQuery,
  useGetPendingOvertimeQuery,
} from '../features/apiSlice';
import MyAttendanceSection from '../components/MyAttendanceSection';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const { data: users } = useGetAllUsersQuery();
  const {
    data: pendingOT,
  } = useGetPendingOvertimeQuery();

  const employees = users?.filter((u) => u.role === 'employee') || [];
  const managers = users?.filter((u) => u.role === 'manager') || [];

  const userCount = users?.length || 0;
  const adminCount = users?.filter((u) => u.role === 'admin').length || 0;
  const managerCount = managers.length;
  const employeeCount = employees.length;
  const pendingOTCount = pendingOT?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">System-wide overview of users and attendance</p>
        </div>

        {}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total Users', value: userCount, color: 'text-gray-900' },
            { label: 'Admins', value: adminCount, color: 'text-purple-700' },
            { label: 'Managers', value: managerCount, color: 'text-blue-700' },
            { label: 'Employees', value: employeeCount, color: 'text-green-700' },
            { label: 'Pending OT', value: pendingOTCount, color: pendingOTCount ? 'text-amber-700' : 'text-gray-900' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">My Attendance</h2>
          <MyAttendanceSection />
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
