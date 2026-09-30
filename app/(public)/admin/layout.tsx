import { Link, NavLink, Outlet } from 'react-router';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex app-bg">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-gray-200">
          <Link
            to="/"
            className="font-display font-bold text-lg tracking-tight text-black"
          >
            Pulse
          </Link>
        </div>
        <div className="px-5 py-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Admin
          </span>
        </div>
        <nav className="flex-1 p-3 flex flex-col gap-0.5 text-sm font-medium">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/verify-hospitals"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`
            }
          >
            Verify Hospitals
          </NavLink>
          <NavLink
            to="/admin/manage-users"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded transition-colors ${isActive ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}`
            }
          >
            Manage Users
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-1">Signed in as</div>
          <div className="text-sm font-medium text-gray-800">Super Admin</div>
          <Link
            to="/login"
            className="text-xs text-red-600 hover:underline mt-1 block"
          >
            Sign out
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
