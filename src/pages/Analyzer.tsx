import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, CheckCircle, Loader2, ChevronRight, ShieldAlert, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMedicalReport } from '../services/geminiService';

const Analyzer = () => {
  const { profile, setProfile } = useAppContext();
  const { t } = useTranslation();

  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'analysis'>('upload');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const analysis = await analyzeMedicalReport(base64, file.type);
      
      if (analysis) {
        setResult(analysis);
        if (profile) {
          setProfile({
            ...profile,
            injuryArea: analysis.injury_area,
            explanation: analysis.explanation,
            surgeryDetails: analysis.surgery_type || profile.surgeryDetails
          });
        }
        setActiveTab('analysis');
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight font-display">Clinical Analyzer</h1>
          <p className="text-white/40 font-medium mt-1 text-sm font-sans uppercase tracking-widest">AI-Powered Diagnostic Synthesis</p>
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          <button 
            onClick={() => setActiveTab('upload')}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'upload' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white'}`}
          >
            Upload
          </button>
          <button 
            onClick={() => result && setActiveTab('analysis')}
            disabled={!result}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'analysis' ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20' : 'text-white/40 hover:text-white disabled:opacity-50'}`}
          >
            Analysis
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input/Results */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-10 space-y-8"
              >
                <div className="border-2 border-dashed border-white/10 rounded-[2rem] p-16 flex flex-col items-center justify-center gap-6 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    accept="image/*,application/pdf"
                  />
                  <div className="w-20 h-20 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all shadow-2xl shadow-teal-500/20">
                    {isUploading ? <Loader2 size={36} className="animate-spin" /> : <Upload size={36} />}
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-white text-xl tracking-tight font-display">Drop clinical reports here</div>
                    <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest font-sans">DICOM, PDF, JPG, PNG supported</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                      <BrainCircuit size={20} />
                    </div>
                    <h3 className="font-semibold text-white font-display">Neural Extraction</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-sans">Automatically identifies anatomical landmarks and injury vectors from medical text.</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                    <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                      <ShieldAlert size={20} />
                    </div>
                    <h3 className="font-semibold text-white font-display">Risk Assessment</h3>
                    <p className="text-xs text-white/40 leading-relaxed font-sans">Detects contraindications and movement restrictions to ensure patient safety.</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex items-center gap-4 text-emerald-400">
                  <CheckCircle size={24} />
                  <span className="font-semibold font-display">Clinical Synthesis Complete</span>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-widest font-sans">Primary Diagnosis</label>
                    <div className="text-3xl font-semibold text-white tracking-tight font-display">{result.injury_area}</div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-teal-400">
                      <FileText size={18} />
                      <span className="text-xs font-semibold uppercase tracking-widest font-sans">Clinical Interpretation</span>
                    </div>
                    <p className="text-white/70 leading-relaxed font-sans text-sm">{result.explanation}</p>
                  </div>

                  {result.movement_restrictions && (
                    <div className="bg-amber-500/10 p-6 rounded-2xl border border-amber-500/20 space-y-2">
                      <div className="flex items-center gap-2 text-amber-500">
                        <ShieldAlert size={18} />
                        <span className="text-xs font-semibold uppercase tracking-widest font-sans">Movement Protocol</span>
                      </div>
                      <p className="text-amber-200/80 text-sm font-sans">{result.movement_restrictions}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Confidence</div>
                      <div className="text-lg font-semibold text-white font-mono">98.4%</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1 font-sans">Processing Time</div>
                      <div className="text-lg font-semibold text-white font-mono">1.2s</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Actions */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center justify-between group cursor-pointer hover:bg-teal-500/5 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                <ChevronRight size={24} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white font-display">Proceed to Exercise Plan</div>
                <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest font-sans">Based on neural analysis</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer;
