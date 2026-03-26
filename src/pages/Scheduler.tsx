import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Plus, Activity, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Scheduler = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const events = [
    { id: 1, date: 26, time: '09:00 AM', type: 'Exercise', title: 'Knee Flexion Session', color: 'teal' },
    { id: 2, date: 26, time: '02:30 PM', type: 'Consultation', title: 'Dr. Sarah Mitchell', color: 'indigo' },
    { id: 3, date: 27, time: '10:00 AM', type: 'Exercise', title: 'Lower Body Strength', color: 'teal' },
    { id: 4, date: 28, time: '11:00 AM', type: 'Assessment', title: 'AI Recovery Update', color: 'amber' },
  ];

  return (
    <div className="p-8 space-y-8 font-sans">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display">Rehab Scheduler</h1>
          <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">Personalized Recovery Timeline</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-teal-500 text-slate-950 px-6 py-3 rounded-2xl font-semibold flex items-center gap-3 shadow-lg shadow-teal-500/20"
        >
          <Plus size={20} />
          <span>Add Event</span>
        </motion.button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-semibold text-white font-display">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <div className="flex items-center gap-4">
                <button onClick={prevMonth} className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextMonth} className="p-3 bg-white/5 rounded-xl border border-white/10 text-white/60 hover:text-white transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-4 mb-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-semibold text-white/20 uppercase tracking-widest font-sans">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
              {Array.from({ length: daysInMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => {
                const day = i + 1;
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                const isSelected = day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth();
                const hasEvents = events.some(e => e.date === day);

                return (
                  <motion.button
                    key={day}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                    className={`h-24 rounded-2xl border transition-all relative group flex flex-col items-center justify-center gap-2 ${
                      isSelected 
                        ? 'bg-teal-500 border-teal-400 text-slate-950 shadow-lg shadow-teal-500/20' 
                        : isToday 
                          ? 'bg-white/10 border-white/20 text-white' 
                          : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-xl font-semibold font-display">{day}</span>
                    {hasEvents && !isSelected && (
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 h-full shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-white font-display">Daily Protocol</h3>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div className="space-y-6">
              {events.filter(e => e.date === selectedDate.getDate()).length > 0 ? (
                events.filter(e => e.date === selectedDate.getDate()).map(event => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={event.id} 
                    className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-4 group hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest ${
                        event.color === 'teal' ? 'bg-teal-500/10 text-teal-400' : 
                        event.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : 
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {event.type}
                      </div>
                      <div className="flex items-center gap-2 text-white/40 text-[10px] font-semibold uppercase tracking-widest font-sans">
                        <Clock size={14} />
                        {event.time}
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-white font-display">{event.title}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-white/40">
                          <User size={14} />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-teal-500 border-2 border-slate-950 flex items-center justify-center text-slate-950">
                          <Activity size={14} />
                        </div>
                      </div>
                      <button className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest font-sans hover:text-teal-300 transition-colors">Details</button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-white/10">
                    <CalendarIcon size={32} />
                  </div>
                  <div>
                    <div className="text-white/40 font-semibold font-display">No events scheduled</div>
                    <div className="text-[10px] text-white/20 font-semibold uppercase tracking-widest font-sans">Enjoy your rest day</div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 p-6 bg-teal-500/10 rounded-3xl border border-teal-500/20 space-y-4">
              <div className="flex items-center gap-3 text-teal-400">
                <Bell size={18} />
                <span className="text-xs font-semibold uppercase tracking-widest font-sans">Smart Reminder</span>
              </div>
              <p className="text-teal-200/60 text-xs leading-relaxed font-sans">Your next session starts in 45 minutes. Hydration and warm-up recommended.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;
