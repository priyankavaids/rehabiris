import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  TrendingUp, 
  Calendar, 
  Target, 
  Zap, 
  ShieldCheck,
  ArrowUpRight,
  Info,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Dashboard = () => {
  const { profile, milestones, addMilestone, updateMilestone, deleteMilestone } = useAppContext();
  const { t } = useTranslation();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const stats = [
    { label: 'Recovery Progress', value: '62%', icon: TrendingUp, color: 'teal', trend: '+4.2%' },
    { label: 'Avg. Accuracy', value: '88.4%', icon: Target, color: 'indigo', trend: '+1.5%' },
    { label: 'Total Sessions', value: '24', icon: Activity, color: 'amber', trend: '+2' },
    { label: 'Next Milestone', value: '12 Days', icon: Calendar, color: 'rose', trend: 'On Track' },
  ];

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addMilestone(newGoal.trim());
      setNewGoal('');
      setIsAdding(false);
    }
  };

  const handleStartEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditValue(title);
  };

  const handleSaveEdit = (id: string) => {
    if (editValue.trim()) {
      updateMilestone(id, { title: editValue.trim() });
      setEditingId(null);
    }
  };

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const completionPercentage = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="p-8 space-y-10 font-sans">
      {/* Welcome Section */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display">Clinical Overview</h1>
          <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">Diagnostic & Recovery Command Center</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">System Status</div>
              <div className="text-sm font-semibold text-teal-400 font-display">Operational</div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group cursor-pointer shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-white/40'}`}>
                {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : null}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-widest font-sans">{stat.label}</div>
              <div className="text-3xl font-semibold text-white tracking-tight font-display">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive Milestone System */}
      <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-white font-display">Set Your Rehabilitation Goals</h3>
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest font-sans mt-1">Personalized recovery roadmap</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/20"
          >
            <Plus size={16} />
            Add Goal
          </button>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddGoal}
              className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-4"
            >
              <input 
                autoFocus
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., Achieve 90° knee flexion"
                className="flex-1 bg-transparent border-none text-white placeholder:text-white/20 focus:ring-0 font-sans"
              />
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <button 
                  type="submit"
                  className="p-2 bg-teal-500 text-slate-950 rounded-lg hover:bg-teal-400 transition-colors"
                >
                  <Check size={20} />
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {milestones.map((m) => (
              <motion.div 
                layout
                key={m.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`p-6 rounded-3xl border transition-all relative group ${
                  m.completed 
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                    : 'bg-white/5 border-white/10 hover:border-teal-500/30'
                }`}
              >
                <div className="flex flex-col h-full justify-between gap-4">
                  <div className="flex items-start justify-between gap-2">
                    {editingId === m.id ? (
                      <input 
                        autoFocus
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleSaveEdit(m.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(m.id)}
                        className="bg-transparent border-none text-white focus:ring-0 p-0 font-semibold font-display w-full"
                      />
                    ) : (
                      <div className={`font-semibold font-display transition-colors ${m.completed ? 'text-emerald-400 line-through opacity-60' : 'text-white'}`}>
                        {m.title}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleStartEdit(m.id, m.title)}
                        className="p-1.5 text-white/40 hover:text-white transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteMilestone(m.id)}
                        className="p-1.5 text-white/40 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateMilestone(m.id, { completed: !m.completed })}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          m.completed 
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                            : 'border-white/20 text-transparent hover:border-teal-500'
                        }`}
                      >
                        <Check size={14} />
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${m.completed ? 'text-emerald-400' : 'text-white/40'}`}>
                        {m.completed ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    {m.progress !== undefined && !m.completed && (
                      <span className="text-[10px] font-mono text-teal-400">{m.progress}%</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        <div className="pt-8 flex items-center justify-center gap-4">
          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" 
            />
          </div>
          <span className="text-xs font-semibold text-teal-400 font-mono tracking-tighter">
            {completionPercentage}% TOTAL COMPLETION
          </span>
        </div>
      </div>

      {/* Usage Guidelines & Safety Instructions */}
      <div className="bg-white/[0.07] backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-inner">
            <Info size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white font-display">Usage Guidelines & Safety Instructions</h3>
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest font-sans">Essential protocols for safe rehabilitation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-400">
              <Zap size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">How to Use</span>
            </div>
            <p className="text-white/70 leading-relaxed font-sans text-sm">
              To ensure optimal rehabilitation outcomes, position yourself within the camera frame so that your full body is clearly visible. Carefully follow the on-screen exercise demonstrations and perform each movement in a slow, controlled manner. Pay close attention to the real-time AI feedback and adjust your posture and joint alignment accordingly. Consistent daily participation in prescribed sessions is essential to track progress accurately and achieve steady recovery.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertCircle size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Safety Guidelines</span>
            </div>
            <p className="text-white/70 leading-relaxed font-sans text-sm">
              Do not continue any exercise if you experience sharp pain, discomfort, or instability. Avoid overextending joints beyond your natural range of motion, and ensure that your surroundings are safe and free from obstacles. Always perform exercises on a stable, non-slippery surface. It is strongly recommended to consult your physiotherapist before attempting advanced movements or modifying your rehabilitation routine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
