import MyAttendanceSection from '../components/MyAttendanceSection';
import Navbar from '../components/Navbar';

const EmployeeDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your punch-ins and working hours</p>
        </div>

        <MyAttendanceSection />
      </main>
    </div>
  );
};

export default EmployeeDashboard;
