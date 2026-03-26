import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Calendar,
  ChevronRight,
  Clock,
  Target,
  Zap,
  Dumbbell
} from 'lucide-react';
import { motion } from 'motion/react';

const History = () => {
  const { history } = useAppContext();

  const bodyParts = [
    { name: 'Shoulder', icon: Dumbbell, color: 'text-rehab-cyan' },
    { name: 'Wrist', icon: Activity, color: 'text-rehab-emerald' },
    { name: 'Knee', icon: Zap, color: 'text-rehab-blue' },
    { name: 'Neck', icon: Target, color: 'text-rehab-cyan' },
  ];

  // Mock data for charts
  const weeklyReps = [45, 52, 38, 65, 48, 72, 58];
  const accuracyTrends = [82, 85, 84, 88, 87, 91, 89];

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="anatomy-bg" />
      
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Progress & History</h1>
        <p className="text-white/40 font-medium text-sm uppercase tracking-widest">Your recovery journey in data</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Repetition Consistency Chart */}
        <div className="lg:col-span-8 glass-card space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rehab-cyan/20 flex items-center justify-center text-rehab-cyan">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Repetition Consistency</h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Last 7 Days
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {weeklyReps.map((reps, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="relative w-full flex flex-col items-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(reps / 80) * 100}%` }}
                    className="w-full max-w-[40px] bg-rehab-cyan/40 rounded-t-lg group-hover:bg-rehab-cyan transition-all duration-300 relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-rehab-cyan text-slate-950 text-[10px] font-bold px-2 py-1 rounded">
                      {reps}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy Trends */}
        <div className="lg:col-span-4 glass-card space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rehab-emerald/20 flex items-center justify-center text-rehab-emerald">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Accuracy Trends</h3>
          </div>

          <div className="relative h-48 flex items-center justify-center">
            {/* Simple line graph representation */}
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path 
                d="M 0,80 L 15,75 L 30,76 L 45,70 L 60,72 L 75,65 L 100,68" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="3" 
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
              <path 
                d="M 0,80 L 15,75 L 30,76 L 45,70 L 60,72 L 75,65 L 100,68 V 100 H 0 Z" 
                fill="url(#gradient)" 
                opacity="0.1"
              />
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">88%</p>
                <p className="text-[10px] font-bold text-rehab-emerald uppercase tracking-widest">Avg. Accuracy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body Part Focus */}
        <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {bodyParts.map((part, i) => (
            <div key={i} className="glass-card flex items-center gap-4 group cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${part.color} group-hover:scale-110 transition-transform`}>
                <part.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{part.name}</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">12 Sessions</p>
              </div>
            </div>
          ))}
        </div>

        {/* Session History List */}
        <div className="lg:col-span-12 glass-card space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Session History</h3>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-white/40" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">March 2026</span>
            </div>
          </div>

          <div className="space-y-4">
            {history.length > 0 ? history.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-rehab-cyan group-hover:bg-rehab-cyan group-hover:text-slate-950 transition-all">
                    <Activity size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white">{session.exercise}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-12">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">{session.reps} Reps</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Quantity</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${session.accuracy > 85 ? 'text-rehab-emerald' : 'text-amber-400'}`}>{session.accuracy}%</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Accuracy</p>
                  </div>
                  <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
                </div>
              </div>
            )) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto">
                  <Activity size={40} />
                </div>
                <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No sessions recorded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
