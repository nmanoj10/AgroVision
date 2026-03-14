// src/components/layout/Sidebar.tsx

import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  MessageSquare, 
  CloudSun, 
  IndianRupee, 
  Building2, 
  Lightbulb, 
  Settings, 
  ShieldCheck,
  LogOut,
  Leaf
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { clsx } from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Search, label: 'Detect Disease', path: '/detect' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/chat' },
  { icon: CloudSun, label: 'Weather', path: '/weather' },
  { icon: IndianRupee, label: 'Income', path: '/income' },
  { icon: Building2, label: 'Govt Schemes', path: '/schemes' },
  { icon: Lightbulb, label: 'Proposals', path: '/proposals' },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border-color bg-bg-secondary flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-emerald flex items-center justify-center shadow-glow">
          <Leaf className="text-bg-primary h-6 w-6" />
        </div>
        <span className="text-xl font-extrabold tracking-tight text-text-primary">AgroVision</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
              isActive 
                ? "bg-accent-green/10 text-accent-green border-l-4 border-accent-green" 
                : "text-text-muted hover:bg-white/5 hover:text-text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group",
              isActive 
                ? "bg-accent-blue/10 text-accent-blue border-l-4 border-accent-blue" 
                : "text-text-muted hover:bg-white/5 hover:text-text-primary"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-border-color">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-bg-card mb-4">
          <div className="h-10 w-10 rounded-full bg-accent-green/20 flex items-center justify-center text-accent-green font-bold">
            {user?.name?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-text-muted truncate capitalize">{user?.role || 'Farmer'}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-accent-red hover:bg-accent-red/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
