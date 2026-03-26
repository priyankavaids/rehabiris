import React from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Bell, Search } from 'lucide-react';
import { motion } from 'motion/react';

const Header = () => {
  const { profile } = useAppContext();

  return (
    <header className="h-20 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-40 font-sans">
      <div className="flex items-center gap-8">
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Search clinical data..." 
            className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm text-white focus:ring-2 focus:ring-teal-500/50 outline-none transition-all w-64 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2.5 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-teal-400 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-slate-950" />
        </motion.button>

        <div className="h-10 w-px bg-white/10 mx-2" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40 font-sans">Patient Account</div>
            <div className="text-sm font-semibold text-white font-display">Patient: {profile?.name || 'Guest'}</div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-11 h-11 bg-teal-500/20 rounded-xl border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10"
          >
            <User size={22} />
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
