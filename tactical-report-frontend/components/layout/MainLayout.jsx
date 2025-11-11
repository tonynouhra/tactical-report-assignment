'use client';

import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';
import BottomActivityPanel from './BottomActivityPanel';

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <LeftSidebar />

      {/* Main Content Area */}
      <main className="pt-16 lg:pl-72 pb-20 min-h-screen transition-all duration-300">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      <BottomActivityPanel />
    </div>
  );
}