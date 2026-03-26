import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Activity, 
  FileSearch, 
  Calendar, 
  TrendingUp, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAppContext();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileSearch, label: 'Analyzer', path: '/analyzer' },
    { icon: Activity, label: 'Exercise', path: '/exercise' },
    { icon: Calendar, label: 'Scheduler', path: '/scheduler' },
    { icon: TrendingUp, label: 'AI Prediction', path: '/prediction' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('rehab_profile');
    window.location.href = '/login';
  };

  if (!profile && location.pathname === '/login') return null;

  return (
    <motion.div 
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      className="h-screen bg-gradient-to-b from-slate-950 to-slate-900 border-r border-white/5 flex flex-col sticky top-0 z-50 transition-all duration-300 font-sans shadow-2xl"
    >
      {/* Logo Section */}
      <div className="p-8 flex items-center gap-4">
        <div className="min-w-[40px] h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
          <Stethoscope size={24} className="text-slate-950" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-2xl font-semibold text-white tracking-tighter whitespace-nowrap font-display"
            >
              RehabIris
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-8 space-y-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative ${
                isActive 
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-lg shadow-teal-500/5' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-teal-400' : 'group-hover:text-white transition-colors'} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium whitespace-nowrap font-sans text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-teal-500 rounded-r-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"
                />
              )}

              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-[10px] font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[60] border border-white/10 font-sans uppercase tracking-widest">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-white/5 space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all group relative"
        >
          <LogOut size={22} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-medium whitespace-nowrap font-sans text-sm"
              >
                {t('logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-white/10 hover:text-white hover:bg-white/5 transition-all"
        >
          {isCollapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
          {!isCollapsed && <span className="font-semibold text-[10px] uppercase tracking-widest font-sans">Collapse</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
