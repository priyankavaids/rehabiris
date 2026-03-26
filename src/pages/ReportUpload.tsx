import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Upload, FileText, CheckCircle, Loader2, ArrowLeft, Info, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { analyzeMedicalReport } from '../services/geminiService';

const ReportUpload = () => {
  const { profile, setProfile } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Convert to base64
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
      }
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight flex items-center gap-4 font-display">
            <FileText size={48} className="text-indigo-500" /> {t('upload_report')}
          </h1>
          <p className="text-white/40 font-medium mt-2 text-sm md:text-base font-sans">AI-powered medical document analysis for personalized rehabilitation</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
        >
          <div className="p-10">
            {!result ? (
              <div className="space-y-10">
                <div className="border-4 border-dashed border-white/10 rounded-[2.5rem] p-16 flex flex-col items-center justify-center gap-6 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer relative group">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    accept="image/*,application/pdf"
                  />
                  <div className="w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-2xl shadow-indigo-500/20">
                    {isUploading ? <Loader2 size={48} className="animate-spin" /> : <Upload size={48} />}
                  </div>
                  <div className="text-center space-y-2">
                    <div className="font-semibold text-white text-2xl tracking-tight font-display">Click or drag to upload</div>
                    <div className="text-[10px] text-white/40 font-semibold uppercase tracking-widest font-sans">Supports PDF, JPG, PNG</div>
                  </div>
                </div>

                <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-xl">
                  <h3 className="text-xl font-medium text-white mb-4 flex items-center gap-3 font-display">
                    <Info size={24} className="text-indigo-500" /> Why upload?
                  </h3>
                  <ul className="text-white/60 space-y-4 font-normal font-sans">
                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Automatic injury area detection</li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Personalized exercise recommendations</li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Accurate recovery timeline prediction</li>
                  </ul>
                </div>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-10"
              >
                <div className="flex items-center gap-5 p-6 bg-emerald-500/10 text-emerald-400 rounded-[2rem] border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shrink-0">
                    <CheckCircle size={28} />
                  </div>
                  <div className="font-semibold text-xl font-display">Analysis Complete!</div>
                </div>

                <div className="space-y-8">
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-2 block font-sans">Injury Area</label>
                    <div className="text-3xl font-semibold text-white tracking-tight font-display">{result.injury_area}</div>
                  </div>
                  
                  <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
                    <label className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-2 block font-sans">Explanation</label>
                    <div className="text-white/70 leading-relaxed font-normal text-lg font-sans">{result.explanation}</div>
                  </div>

                  {result.movement_restrictions && (
                    <div className="bg-amber-500/10 p-8 rounded-[2rem] border border-amber-500/20">
                      <label className="text-[10px] font-semibold text-amber-500/60 uppercase tracking-[0.2em] mb-2 block font-sans">Restrictions</label>
                      <div className="text-amber-200 font-medium font-sans">{result.movement_restrictions}</div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-white text-slate-950 font-semibold py-6 rounded-[2rem] shadow-2xl hover:bg-indigo-600 hover:text-white transition-all text-xl flex items-center justify-center gap-4 group font-display"
                >
                  Go to Dashboard <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportUpload;
