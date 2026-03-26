import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Dumbbell, AlertCircle, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: Dumbbell, label: 'Exercise', path: '/exercise' },
    { icon: AlertCircle, label: 'SOS', path: '/emergency' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 glass-dark border-t border-white/10 px-6 pb-2 pt-2 z-50 lg:hidden">
      <div className="flex items-center justify-between h-full max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center gap-1 transition-all duration-300
              ${isActive ? 'text-rehab-teal scale-110' : 'text-white/40 hover:text-white/60'}
            `}
          >
            {({ isActive }) => (
              <>
                <item.icon size={24} className={isActive ? 'text-glow' : ''} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
