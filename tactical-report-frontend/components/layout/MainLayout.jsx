'use client';

import { useState, createContext, useContext } from 'react';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';
import BottomActivityPanel from './BottomActivityPanel';
import ActivityDrawer from './ActivityDrawer';

const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: () => {},
  onAddItem: null,
  isActivityDrawerOpen: false,
  setIsActivityDrawerOpen: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export default function MainLayout({ children, onAddItem }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      setIsCollapsed,
      onAddItem,
      isActivityDrawerOpen,
      setIsActivityDrawerOpen
    }}>
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <LeftSidebar />

        <main
          className={`pt-20 pb-20 min-h-screen transition-all duration-300 ${
            isCollapsed ? 'main-content-collapsed' : 'main-content-expanded'
          }`}
        >
          {children}
        </main>

        <BottomActivityPanel />
        <ActivityDrawer
          isOpen={isActivityDrawerOpen}
          onClose={() => setIsActivityDrawerOpen(false)}
        />
      </div>
    </SidebarContext.Provider>
  );
}