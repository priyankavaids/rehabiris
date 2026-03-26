import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, ArrowLeft, AlertCircle, Loader2, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { searchRehabCenters } from '../services/geminiService';
import Markdown from 'react-markdown';

const Emergency = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [centers, setCenters] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Get current location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const result = await searchRehabCenters({ lat: latitude, lng: longitude });
      if (result) {
        setAiAnalysis(result.text);
        // Extract basic center info from grounding chunks if available
        const mappedCenters = result.chunks?.map((chunk: any, index: number) => ({
          id: index,
          name: chunk.maps?.title || "Rehab Center",
          address: chunk.maps?.uri || "View on Maps",
          phone: "Contact via link",
          uri: chunk.maps?.uri
        })) || [];
        setCenters(mappedCenters);
      }
      setIsLoading(false);
    }, () => {
      // Fallback to mock data if geolocation fails
      fetch('/api/rehab-centers')
        .then(res => res.json())
        .then(data => {
          setCenters(data);
          setIsLoading(false);
        });
    });
  }, []);

  const handleCall = (phone: string) => {
    if (phone.includes('tel:')) {
      window.location.href = phone;
    } else {
      window.location.href = `tel:${phone}`;
    }
  };

  const openInMaps = (uri: string) => {
    window.open(uri, '_blank');
  };

  return (
    <div className="p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight flex items-center gap-4 font-display">
              <AlertCircle size={48} className="text-red-500 animate-pulse" /> {t('emergency')}
            </h1>
            <p className="text-white/40 font-medium mt-2 text-sm md:text-base font-sans uppercase tracking-widest">Immediate assistance and nearby rehabilitation centers</p>
          </div>
          <button 
            onClick={() => handleCall('108')}
            className="bg-red-600 text-white px-10 py-6 rounded-[2rem] font-semibold text-2xl shadow-2xl shadow-red-600/20 hover:scale-105 transition-all flex items-center gap-4 group font-display"
          >
            <Phone size={32} className="group-hover:rotate-12 transition-transform" /> Call 108
          </button>
        </header>

        <div className="grid grid-cols-1 gap-10">
          <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-medium text-white mb-8 flex items-center gap-3 font-display">
              <Globe size={28} className="text-teal-500" /> {t('nearby_centers')}
            </h2>

            {isLoading && (
              <div className="flex flex-col items-center justify-center p-20 bg-black/40 rounded-[2rem] border border-white/5">
                <Loader2 size={64} className="animate-spin text-teal-500 mb-6" />
                <div className="text-white/40 font-semibold uppercase tracking-widest text-sm font-sans">Searching with AI Grounding...</div>
              </div>
            )}

            <div className="space-y-6">
              {aiAnalysis && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-teal-500/10 p-8 rounded-[2rem] border border-teal-500/20 prose prose-invert max-w-none shadow-2xl font-sans"
                >
                  <Markdown>{aiAnalysis}</Markdown>
                </motion.div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {centers.map((center) => (
                  <motion.div 
                    key={center.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ translateY: -5 }}
                    className="bg-white/5 p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between gap-6 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-start gap-5">
                      <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all">
                        <MapPin size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-medium text-white mb-1 font-display">{center.name}</h3>
                        <p className="text-white/40 text-sm font-normal leading-relaxed font-sans">{center.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {center.phone !== "Contact via link" && (
                        <button 
                          onClick={() => handleCall(center.phone)}
                          className="flex-1 bg-teal-500 text-slate-950 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-400 transition-all shadow-xl shadow-teal-600/20 font-display"
                        >
                          <Phone size={20} /> Call
                        </button>
                      )}
                      {center.uri && (
                        <button 
                          onClick={() => openInMaps(center.uri)}
                          className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10 font-display"
                        >
                          <MapPin size={20} /> View
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Map Placeholder */}
          <div className="h-[500px] bg-black/40 rounded-[3rem] overflow-hidden relative border border-white/10 shadow-2xl group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                <MapPin size={40} className="text-white/20" />
              </div>
              <div className="text-white/20 font-semibold uppercase tracking-[0.3em] text-sm font-sans">Interactive Map View</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
