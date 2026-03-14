// src/components/layout/DashboardLayout.tsx

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, Bell, CloudSun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const date = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 h-20 border-b border-border-color bg-bg-primary/80 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-text-secondary hover:bg-white/5 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-text-primary">
                Good morning, {user?.name?.split(' ')[0] || 'Farmer'} 👋
              </h1>
              <p className="text-xs text-text-muted">{date}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-bg-card border border-border-color">
              <CloudSun className="h-5 w-5 text-accent-amber" />
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary">28°C</p>
                <p className="text-[10px] text-text-muted">Nashik, MH</p>
              </div>
            </div>
            
            <button className="relative p-2 text-text-secondary hover:bg-white/5 rounded-lg">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-accent-red rounded-full border-2 border-bg-primary" />
            </button>

            <div className="h-10 w-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green font-bold border border-accent-green/30">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
