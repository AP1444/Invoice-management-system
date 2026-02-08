import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-xl font-bold text-indigo-500 flex items-center gap-2 no-underline">
              <span>📋</span> Invoice Manager
            </Link>
            <div className="flex gap-1">
              <Link 
                to="/dashboard" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/invoices" 
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors no-underline ${isActive('/invoices') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                Invoices
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-sm">Welcome, {user?.name || user?.email}</span>
            <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
