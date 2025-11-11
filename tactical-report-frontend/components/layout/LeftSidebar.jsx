'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPlus, FiClock, FiBarChart2, FiX, FiMenu, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutButton from '@/components/auth/LogoutButton';
import { useSidebarContext } from './MainLayout';

export default function LeftSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isCollapsed, setIsCollapsed, onAddItem, setIsActivityDrawerOpen } = useSidebarContext();

  const navItems = [
    { href: '/', icon: FiHome, label: 'Home' },
    { href: '/items/add', icon: FiPlus, label: 'Create New Item', action: 'addItem' },
    { href: '#', icon: FiClock, label: 'Activity Log', action: 'activityLog' },
  ];

  const handleNavClick = (item, e) => {
    if (item.action === 'addItem' && onAddItem) {
      e.preventDefault();
      onAddItem();
      setIsOpen(false);
    } else if (item.action === 'activityLog') {
      e.preventDefault();
      setIsActivityDrawerOpen(true);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button - Shows above search area */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition"
      >
        <FiMenu size={20} className="text-gray-700" />
      </button>

      {/* Desktop Sidebar - Collapsible */}
      <aside className={`hidden lg:flex fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 shadow-sm flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition shadow-md z-10"
        >
          {isCollapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {!isCollapsed && (
            <div className="mb-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                Navigation
              </h2>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-4 px-4'} py-4 rounded-xl transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <Icon size={22} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'} />
                {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info at Bottom */}
        {!isCollapsed ? (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                A
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-800">Admin</p>
                <p className="text-xs text-gray-500">admin@tactical.com</p>
              </div>
            </div>

            <LogoutButton variant="menu" className="w-full" />
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col items-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
              A
            </div>
            <div className="flex justify-center">
              <LogoutButton variant="icon" className="text-red-600 hover:bg-red-50" />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar - Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <span className="text-xl font-bold text-white">TR</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Tactical Report</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <FiX size={24} className="text-gray-500" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(item, e)}
                      className={`flex items-center space-x-4 px-4 py-4 rounded-xl transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <Icon size={22} className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User Info at Bottom */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-800">Admin</p>
                    <p className="text-xs text-gray-500">admin@tactical.com</p>
                  </div>
                </div>

                <LogoutButton variant="menu" className="w-full" data-logout-button />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}