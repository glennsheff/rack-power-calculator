import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/hardware': 'Hardware Library',
  '/calculator': 'Rack Calculator',
  '/help': 'Help & Guide',
};

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Rack Power Calculator';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f8fafc]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
