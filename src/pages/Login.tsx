import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Activity } from 'lucide-react';

const Login = () => {
  const { profile, setProfile } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile && profile.name.toLowerCase() === name.toLowerCase()) {
      navigate('/dashboard');
    } else {
      // If no profile or name mismatch, go to profile setup
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 rounded-full blur-[150px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[3rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-8 mb-12">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40"
          >
            <Activity size={48} className="text-white" />
          </motion.div>
          <div>
            <h1 className="text-5xl font-semibold text-white tracking-tighter font-display">RehabIris</h1>
            <p className="text-white/40 font-semibold mt-3 uppercase tracking-[0.2em] text-[10px] font-sans">Welcome Back to Recovery</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 ml-1 font-sans">
              {t('name')}
            </label>
            <input
              type="text"
              required
              placeholder="Enter your name"
              className="w-full bg-white/5 border border-white/10 px-8 py-5 rounded-2xl text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-white/20 text-lg font-sans"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full bg-white text-slate-950 font-semibold py-6 rounded-2xl transition-all shadow-2xl hover:bg-indigo-600 hover:text-white text-xl flex items-center justify-center gap-3 group font-display"
            >
              <LogIn size={24} className="group-hover:-translate-x-1 transition-transform" /> {t('login') || 'Log In'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-6 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-3 text-lg font-display"
            >
              <UserPlus size={24} /> {t('get_started')}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
          <p className="text-white/10 text-[10px] font-semibold uppercase tracking-widest font-sans">
            &copy; 2026 RehabIris AI. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
