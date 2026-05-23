import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  FileText,
  BarChart2,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Settings,
  ChevronUp,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { hasPermission } from '../../types';
import { avatarUrl } from '../../constants/avatars';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  permission?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  to: '/admin',         icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Users',      to: '/admin/users',    icon: <Users className="w-4 h-4" />,       permission: 'users:read' },
  { label: 'Roles',      to: '/admin/roles',    icon: <ShieldCheck className="w-4 h-4" />, permission: 'roles:assign' },
  { label: 'Content',    to: '/admin/content',  icon: <FileText className="w-4 h-4" />,    permission: 'conversations:read_meta' },
  { label: 'Analytics',  to: '/admin/analytics',icon: <BarChart2 className="w-4 h-4" />,   permission: 'analytics:view' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

const LG = 1024;

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= LG);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= LG) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user, item.permission),
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        flex-shrink-0 bg-gray-900 dark:bg-gray-950
        transition-all duration-300 ease-in-out overflow-hidden
        fixed inset-y-0 left-0 z-50
        lg:relative lg:inset-auto lg:z-auto lg:translate-x-0
        ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-0'}
      `}>
        {/* Inner wrapper keeps w-64 so content doesn't squish during desktop collapse */}
        <div className="flex flex-col h-full w-64">

          {/* Logo */}
          <div className="flex items-center justify-between py-3 px-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Netra Admin</p>
                <p className="text-xs text-gray-400">Control Panel</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-gray-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
            {visibleNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User footer with dropdown */}
          <div className="flex-shrink-0 p-3 border-t border-gray-700" ref={menuRef}>
            {/* Dropdown — opens upward */}
            {menuOpen && (
              <div className="mb-2 bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
                <button
                  onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Back to Chat
                </button>
                <div className="border-t border-gray-700" />
                <button
                  onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}

            {/* Profile trigger */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-gray-800 transition-colors group"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 bg-primary-800">
                {user?.avatar_seed ? (
                  <img src={avatarUrl(user.avatar_seed, user.gender)} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs font-medium text-white">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-medium text-white truncate">{user?.display_name || user?.username}</p>
                <p className="text-xs text-gray-500 truncate">{user?.roles?.map(r => r.name).join(', ')}</p>
              </div>
              <ChevronUp className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${menuOpen ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          </div>

        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex-1">Admin Panel</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
