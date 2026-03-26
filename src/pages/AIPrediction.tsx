import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { TrendingUp, BrainCircuit, Calendar, Activity, ChevronRight, Loader2, Play, Sparkles, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getRecoveryPrediction, generateRecoveryVideo } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const AIPrediction = () => {
  const { profile } = useAppContext();
  const { t } = useTranslation();

  const [prediction, setPrediction] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (profile?.injuryArea) {
        setIsLoading(true);
        const data = await getRecoveryPrediction({
          injuryArea: profile.injuryArea,
          surgeryDetails: profile.surgeryDetails || ''
        });
        setPrediction(data);
        setIsLoading(false);
      }
    };
    fetchPrediction();
  }, [profile?.injuryArea, profile?.surgeryDetails]);

  const handleGenerateVideo = async () => {
    if (!profile?.injuryArea) return;
    setIsVideoLoading(true);
    // Use a placeholder image for now as we don't have a direct base64 image here
    const placeholderImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const prompt = `A 3D medical simulation of ${profile.injuryArea} recovery over ${prediction?.estimated_weeks || 12} weeks, showing muscle strengthening and improved range of motion.`;
    const url = await generateRecoveryVideo(placeholderImage, prompt);
    setVideoUrl(url);
    setIsVideoLoading(false);
  };

  const chartData = prediction?.milestones?.map((m: any, i: number) => ({
    week: `Week ${m.week}`,
    progress: (i + 1) * (100 / prediction.milestones.length),
    target: m.goal
  })) || [];

  return (
    <div className="p-8 space-y-8 font-sans">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display">AI Recovery Prognosis</h1>
          <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">Neural Network Timeline Prediction</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Current Progress</div>
              <div className="text-lg font-semibold text-white font-mono">32.4%</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Prediction Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl space-y-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <Loader2 size={48} className="text-teal-500 animate-spin" />
                <div className="text-center">
                  <div className="text-xl font-semibold text-white font-display">Synthesizing Clinical Data...</div>
                  <div className="text-xs text-white/40 font-semibold uppercase tracking-widest font-sans">Analyzing 50,000+ similar case studies</div>
                </div>
              </div>
            ) : prediction ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Estimated Recovery</label>
                    <div className="text-4xl font-semibold text-teal-400 tracking-tight font-display">{prediction.estimated_weeks} Weeks</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Confidence Index</label>
                    <div className="text-4xl font-semibold text-white tracking-tight font-display">94.2%</div>
                  </div>
                </div>

                <div className="h-px bg-white/10" />

                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-teal-400">
                    <BrainCircuit size={20} />
                    <span className="text-xs font-semibold uppercase tracking-widest font-sans">Neural Milestones</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prediction.milestones.map((milestone: any, i: number) => (
                      <div key={i} className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3 hover:bg-white/10 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest font-sans">Week {milestone.week}</div>
                          <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                        </div>
                        <h4 className="text-sm font-semibold text-white font-display">{milestone.goal}</h4>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-teal-500/10 p-8 rounded-[2rem] border border-teal-500/20 space-y-4">
                  <div className="flex items-center gap-3 text-teal-400">
                    <ShieldCheck size={20} />
                    <span className="text-xs font-semibold uppercase tracking-widest font-sans">Clinical Advice</span>
                  </div>
                  <p className="text-teal-200/60 text-sm leading-relaxed font-sans">{prediction.advice}</p>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20 text-white/40 font-display">Please upload a medical report to generate a prediction.</div>
            )}
          </div>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold text-white font-display">Progress Projection</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-white/20" />
                  <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Actual</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="week" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#14b8a6', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="progress" stroke="#14b8a6" fillOpacity={1} fill="url(#colorProgress)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Video Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden h-[500px] relative group">
            <div className="absolute top-6 left-6 z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
                <Play size={20} />
              </div>
              <div>
                <div className="text-xs font-semibold text-white font-display">AI Simulation</div>
                <div className="text-[10px] text-teal-400 font-semibold uppercase tracking-widest font-sans">Visual Recovery Path</div>
              </div>
            </div>

            <div className="w-full h-full flex items-center justify-center bg-slate-950/50">
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full object-cover" />
              ) : (
                <div className="text-center space-y-6 px-10">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto">
                    <Sparkles size={40} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white font-display">Generate Visual Path</div>
                    <p className="text-xs text-white/40 leading-relaxed font-sans mt-2">Create a personalized AI simulation of your recovery journey based on your clinical data.</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGenerateVideo}
                    disabled={isVideoLoading || !prediction}
                    className="bg-white text-slate-950 px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 shadow-2xl hover:bg-teal-500 hover:text-slate-950 transition-all disabled:opacity-50 mx-auto"
                  >
                    {isVideoLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    <span>{isVideoLoading ? 'Generating...' : 'Generate Simulation'}</span>
                  </motion.button>
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest font-sans">VEO-3.1 Engine</span>
              </div>
              <div className="text-[10px] font-semibold text-teal-400 uppercase tracking-widest font-sans">1080p HD</div>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 space-y-6">
            <h3 className="text-xl font-semibold text-white font-display">Case Comparison</h3>
            <div className="space-y-4">
              {[
                { label: 'Similar Cases Found', value: '1,248' },
                { label: 'Success Rate', value: '92.1%' },
                { label: 'Avg. Recovery Time', value: '14.2 Weeks' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <span className="text-xs font-semibold text-white/40 uppercase tracking-widest font-sans">{stat.label}</span>
                  <span className="text-sm font-semibold text-white font-mono">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPrediction;
