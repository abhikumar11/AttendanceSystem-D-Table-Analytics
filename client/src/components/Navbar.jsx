import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';
import { apiSlice } from '../features/apiSlice';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate('/');
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    employee: 'bg-green-100 text-green-700',
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const navLinkClass = ({ isActive }) =>
    `text-sm px-3 py-1.5 rounded-md transition ${
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">Attendance System</span>
          </div>

          {}
          {user?.role === 'admin' && (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/admin" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/assign-managers" className={navLinkClass}>
                Assign Managers
              </NavLink>
              <NavLink to="/admin/attendance" className={navLinkClass}>
                System Attendance
              </NavLink>
              <NavLink to="/admin/overtime" className={navLinkClass}>
                Overtime
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                Users
              </NavLink>
            </nav>
          )}

          {user?.role === 'manager' && (
            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/manager" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/manager/attendance" className={navLinkClass}>
                Team Attendance
              </NavLink>
              <NavLink to="/manager/overtime" className={navLinkClass}>
                Overtime
              </NavLink>
              <NavLink to="/manager/team" className={navLinkClass}>
                Team
              </NavLink>
            </nav>
          )}

          {}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                  {user.role}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                    {initials}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
                </div>
              </>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition px-2 py-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
