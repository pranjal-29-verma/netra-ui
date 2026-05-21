import React, { useState, useEffect, createContext, useContext } from 'react';
import { MessageSquare, Menu, X, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { SettingsModal } from './SettingsModal';

// Context so ConversationList can close the sidebar on mobile after selecting a chat
interface SidebarCtx {
  close: () => void;
  isMobile: boolean;
}
export const SidebarContext = createContext<SidebarCtx>({ close: () => {}, isMobile: false });
export const useSidebar = () => useContext(SidebarContext);

interface ChatLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const MOBILE_BREAKPOINT = 1024; // lg

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children, sidebar }) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= MOBILE_BREAKPOINT);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Track breakpoint changes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      // Auto-open on desktop when resizing up, auto-close on desktop→mobile
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ close: closeSidebar, isMobile }}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            flex-shrink-0 flex flex-col
            bg-white dark:bg-gray-800
            border-r border-gray-200 dark:border-gray-700
            transition-all duration-300 ease-in-out
            ${isMobile
              ? `fixed inset-y-0 left-0 z-50 w-72 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : `relative ${sidebarOpen ? 'w-80' : 'w-0 overflow-hidden border-r-0'}`
            }
          `}
        >
          {/* Sidebar Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Netra Chat</span>
            </div>
            {/* Close button — always visible on mobile, hidden on desktop */}
            <button
              onClick={closeSidebar}
              className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${isMobile ? 'block' : 'hidden'}`}
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto min-h-0">{sidebar}</div>

          {/* Sidebar Footer */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
            {/* User info */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.displayName || user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Settings + Logout row */}
            <div className="flex gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Chat Content */}
          <div className="flex-1 overflow-hidden">{children}</div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};
