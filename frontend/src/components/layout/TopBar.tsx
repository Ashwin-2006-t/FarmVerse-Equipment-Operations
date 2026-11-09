import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Moon, Sun, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const routeLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/equipment': 'Equipment Registry',
  '/bookings': 'Booking Management',
  '/usage': 'Usage Tracking',
  '/maintenance': 'Maintenance Records',
  '/schedules': 'Maintenance Schedules',
  '/analytics': 'Analytics & Reports',
};

export default function TopBar() {
  const { user, loginAs, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [showUser, setShowUser] = useState(false);

  const pageLabel =
    Object.entries(routeLabels).find(([k]) => location.pathname.startsWith(k))?.[1] || 'Dashboard';

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white">{pageLabel}</h1>
        <p className="text-xs text-gray-400">FarmVerse Nexus · Equipment Operations Module</p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications placeholder */}
        <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
              {user?.name?.charAt(0) ?? 'U'}
            </div>
            <span className="max-w-[100px] truncate">{user?.name ?? user?.username ?? 'User'}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-100 bg-white p-1 shadow-xl dark:border-gray-700 dark:bg-gray-900 z-50">
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100 dark:border-gray-700 mb-1">
                <p className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</p>
                <p>{user?.role?.replace('ROLE_', '')}</p>
              </div>

              {/* Quick role switcher for dev */}
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Switch Role</p>
              {['admin', 'farmer', 'technician'].map((role) => (
                <button
                  key={role}
                  onClick={() => { loginAs(role); setShowUser(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <User className="h-4 w-4" />
                  <span className="capitalize">{role}</span>
                </button>
              ))}

              <div className="mt-1 border-t border-gray-100 pt-1 dark:border-gray-700">
                <button
                  onClick={() => { logout(); setShowUser(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

