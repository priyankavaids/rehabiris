import React from 'react';
import { useAppContext } from '../context/AppContext';
import { 
  TrendingUp, 
  Calendar, 
  Award, 
  ChevronRight, 
  Activity, 
  Target, 
  Zap,
  History as HistoryIcon,
  Medal,
  Trophy,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const Progress = () => {
  const { history } = useAppContext();

  // Mock data for the chart if history is empty
  const chartData = history.length > 0 
    ? history.slice(-7).map(h => ({
        name: new Date(h.date).toLocaleDateString('en-US', { weekday: 'short' }),
        accuracy: h.accuracy,
        reps: h.reps
      }))
    : [
        { name: 'Mon', accuracy: 65, reps: 10 },
        { name: 'Tue', accuracy: 72, reps: 12 },
        { name: 'Wed', accuracy: 68, reps: 15 },
        { name: 'Thu', accuracy: 85, reps: 14 },
        { name: 'Fri', accuracy: 78, reps: 18 },
        { name: 'Sat', accuracy: 92, reps: 20 },
        { name: 'Sun', accuracy: 88, reps: 15 },
      ];

  const badges = [
    { id: 1, title: '7-Day Streak', icon: Zap, color: 'text-rehab-teal', bg: 'bg-rehab-teal/10', earned: true },
    { id: 2, title: 'Form Master', icon: Medal, color: 'text-rehab-cyan', bg: 'bg-rehab-cyan/10', earned: true },
    { id: 3, title: 'Strength King', icon: Trophy, color: 'text-rehab-emerald', bg: 'bg-rehab-emerald/10', earned: false },
    { id: 4, title: 'Early Bird', icon: Star, color: 'text-rehab-blue', bg: 'bg-rehab-blue/10', earned: true },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-2xl font-bold text-white font-display">Recovery Progress</h1>
        <p className="text-white/40 text-xs font-medium uppercase tracking-widest">Performance Analytics</p>
      </header>

      {/* Main Chart */}
      <div className="glass rounded-[2.5rem] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rehab-teal/10 text-rehab-teal rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-white font-bold font-display">Accuracy Over Time</h3>
          </div>
          <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-bold text-white/60 uppercase tracking-widest outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                hide 
                domain={[0, 100]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff'
                }}
                itemStyle={{ color: '#14b8a6' }}
              />
              <Area 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#14b8a6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAcc)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-white font-bold font-display">Achievements</h3>
          <button className="text-rehab-teal text-[10px] font-bold uppercase tracking-widest">View All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {badges.map((badge) => (
            <div 
              key={badge.id}
              className={`glass shrink-0 w-32 p-4 rounded-3xl flex flex-col items-center text-center gap-3 transition-all ${!badge.earned && 'opacity-40 grayscale'}`}
            >
              <div className={`w-12 h-12 ${badge.bg} ${badge.color} rounded-2xl flex items-center justify-center`}>
                <badge.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-white leading-tight">{badge.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Session History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-white font-bold font-display">Session History</h3>
          <div className="w-8 h-8 glass rounded-full flex items-center justify-center text-white/40">
            <HistoryIcon size={16} />
          </div>
        </div>
        
        <div className="space-y-3">
          {history.length > 0 ? (
            history.slice().reverse().map((session, idx) => (
              <div key={idx} className="glass p-5 rounded-[2rem] flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-rehab-teal">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{session.exercise}</h4>
                    <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest">
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {session.reps} Reps
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-rehab-emerald font-bold text-sm">{session.accuracy}%</div>
                  <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Accuracy</div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass p-8 rounded-[2rem] text-center space-y-2">
              <p className="text-white/40 text-sm font-medium">No sessions recorded yet.</p>
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">Complete your first exercise to see history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
