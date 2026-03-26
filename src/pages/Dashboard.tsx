import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  Activity, 
  Target, 
  Zap, 
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  BrainCircuit,
  ChevronRight,
  PhoneCall
} from 'lucide-react';
import { motion } from 'motion/react';

const Dashboard = () => {
  const { profile, milestones } = useAppContext();
  const navigate = useNavigate();

  const stats = [
    { label: 'Recovery Score', value: '92%', icon: ShieldCheck, color: 'text-rehab-cyan', glow: 'neon-glow-cyan' },
    { label: 'Avg. Accuracy', value: '88%', icon: Target, color: 'text-rehab-emerald', glow: 'neon-glow-green' },
    { label: 'Strength Index', value: '65', icon: Zap, color: 'text-rehab-blue', glow: 'neon-glow-cyan' },
  ];

  const completedMilestones = milestones.filter(m => m.completed).length;
  const totalMilestones = milestones.length;
  const completionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 75;

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="anatomy-bg" />
      
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Welcome, <span className="text-rehab-cyan text-glow-cyan">{profile?.name || 'Priya'}</span> 👋
          </h1>
          <p className="text-white/40 font-medium text-sm uppercase tracking-[0.2em]">Smart Physiotherapy Assistant</p>
        </div>
        <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-rehab-cyan neon-glow-cyan">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name || 'Priya'}`} 
            alt="Avatar"
            className="w-full h-full object-cover bg-slate-800"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Daily Goal Circular Progress */}
        <div className="lg:col-span-4 glass-card flex flex-col items-center justify-center space-y-6 py-10">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">Daily Goal</h3>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-white/5"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={502.6}
                initial={{ strokeDashoffset: 502.6 }}
                animate={{ strokeDashoffset: 502.6 - (502.6 * completionPercentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-rehab-cyan"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white text-glow-cyan">{completionPercentage}%</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Completed</span>
            </div>
          </div>
          <p className="text-xs text-white/60 text-center px-6 leading-relaxed">
            You're on track! Complete 2 more sessions to reach your daily target.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`glass-card flex flex-col justify-between group ${stat.glow}`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-rehab-emerald flex items-center gap-1 text-[10px] font-bold">
                  <ArrowUpRight size={14} />
                  +2.4%
                </div>
              </div>
              <div className="mt-8 space-y-1">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                <h4 className="text-4xl font-bold text-white tracking-tighter">{stat.value}</h4>
              </div>
            </motion.div>
          ))}

          {/* Large Activity Card */}
          <div className="md:col-span-3 glass-card space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rehab-teal/20 flex items-center justify-center text-rehab-teal">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Neural Movement Analysis</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/history')}
                className="text-xs font-bold text-rehab-cyan uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
              >
                View All <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-rehab-cyan">
                      <BrainCircuit size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Arm Rotation Session</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Completed • 15 mins ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rehab-emerald">94% Accuracy</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">15 Reps</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => navigate('/exercise')}
          className="flex-1 min-w-[200px] glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-rehab-teal transition-all duration-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rehab-teal/20 flex items-center justify-center text-rehab-teal group-hover:bg-white/20 group-hover:text-white transition-all">
              <TrendingUp size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Start New Session</p>
              <p className="text-[10px] text-white/40 group-hover:text-white/60 font-bold uppercase tracking-widest">AI-Guided Exercise</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
        
        <button 
          onClick={() => navigate('/history')}
          className="flex-1 min-w-[200px] glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-rehab-blue transition-all duration-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rehab-blue/20 flex items-center justify-center text-rehab-blue group-hover:bg-white/20 group-hover:text-white transition-all">
              <Activity size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">View Analytics</p>
              <p className="text-[10px] text-white/40 group-hover:text-white/60 font-bold uppercase tracking-widest">Progress Insights</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>

        <button 
          onClick={() => navigate('/emergency')}
          className="flex-1 min-w-[200px] glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-rose-500 transition-all duration-500"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500 group-hover:bg-white/20 group-hover:text-white transition-all">
              <PhoneCall size={24} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-white">Emergency Support</p>
              <p className="text-[10px] text-white/40 group-hover:text-white/60 font-bold uppercase tracking-widest">Nearby Medical Centers</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
