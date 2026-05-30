import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerOvertime from './pages/ManagerOvertime';
import ManagerTeamAttendance from './pages/ManagerTeamAttendance';
import ManagerTeamMembers from './pages/ManagerTeamMembers';
import AdminDashboard from './pages/AdminDashboard';
import AssignManagers from './pages/AssignManagers';
import PendingOvertime from './pages/PendingOvertime';
import SystemAttendance from './pages/SystemAttendance';
import UserManagement from './pages/UserManagement';
import Register from './pages/Register';

const App = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/employee"
          element={user?.role === 'employee' ? <EmployeeDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/manager"
          element={user?.role === 'manager' ? <ManagerDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/manager/attendance"
          element={user?.role === 'manager' ? <ManagerTeamAttendance /> : <Navigate to="/login" />}
        />
        <Route
          path="/manager/overtime"
          element={user?.role === 'manager' ? <ManagerOvertime /> : <Navigate to="/login" />}
        />
        <Route
          path="/manager/team"
          element={user?.role === 'manager' ? <ManagerTeamMembers /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/assign-managers"
          element={user?.role === 'admin' ? <AssignManagers /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/attendance"
          element={user?.role === 'admin' ? <SystemAttendance /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/users"
          element={user?.role === 'admin' ? <UserManagement /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/overtime"
          element={user?.role === 'admin' ? <PendingOvertime /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
