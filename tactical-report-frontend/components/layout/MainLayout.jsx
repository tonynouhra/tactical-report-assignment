'use client';

import { useState, createContext, useContext } from 'react';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';
import BottomActivityPanel from './BottomActivityPanel';

const SidebarContext = createContext({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebarContext = () => useContext(SidebarContext);

export default function MainLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <LeftSidebar />

        <main
          className={`pt-16 pb-20 min-h-screen transition-all duration-300 ${
            isCollapsed ? 'main-content-collapsed' : 'main-content-expanded'
          }`}
        >
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>

        <BottomActivityPanel />
      </div>
    </SidebarContext.Provider>
  );
}