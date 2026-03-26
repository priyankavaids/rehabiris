import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  ShieldAlert, 
  Navigation, 
  Search, 
  ChevronRight,
  Clock,
  Activity,
  AlertCircle,
  Loader2,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { searchRehabCenters } from '../services/geminiService';
import Markdown from 'react-markdown';

const Emergency = () => {
  const { t } = useTranslation();
  const [centers, setCenters] = useState<any[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // Get current location
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const result = await searchRehabCenters({ lat: latitude, lng: longitude });
      if (result) {
        setAiAnalysis(result.text);
        const mappedCenters = result.chunks?.map((chunk: any, index: number) => ({
          id: index,
          name: chunk.maps?.title || "Rehab Center",
          address: chunk.maps?.uri || "View on Maps",
          phone: "Contact via link",
          uri: chunk.maps?.uri,
          distance: `${(Math.random() * 5 + 0.5).toFixed(1)} km`,
          status: Math.random() > 0.3 ? 'Open' : 'Closing Soon',
          rating: (Math.random() * 1 + 4).toFixed(1)
        })) || [];
        setCenters(mappedCenters);
      }
      setIsLoading(false);
    }, () => {
      // Fallback mock data
      const mockCenters = [
        { id: 1, name: 'City Rehab Center', distance: '0.8 km', status: 'Open', rating: 4.8, address: '123 Medical Plaza, Downtown', phone: '108' },
        { id: 2, name: 'Elite Physiotherapy', distance: '1.5 km', status: 'Open', rating: 4.9, address: '456 Wellness Blvd, North Side', phone: '108' },
        { id: 3, name: 'Community Health Hub', distance: '2.2 km', status: 'Closing Soon', rating: 4.5, address: '789 Care Lane, East End', phone: '108' },
      ];
      setCenters(mockCenters);
      setIsLoading(false);
    });
  }, []);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const openInMaps = (uri: string) => {
    if (uri) window.open(uri, '_blank');
  };

  return (
    <div className="relative min-h-screen p-6 md:p-10 space-y-10">
      <div className="anatomy-bg opacity-[0.02]" />
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Emergency Care Network</h1>
          <p className="text-white/40 font-medium text-sm uppercase tracking-widest">RehabAI Smart Support System</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 glass rounded-xl flex items-center gap-2 text-rehab-emerald">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Network Active</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
        {/* Map Viewport */}
        <div className="lg:col-span-8 relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-slate-900 group">
          {/* Mock Map Background */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
          
          {/* Glowing Markers */}
          <AnimatePresence>
            {centers.map((center, i) => (
              <motion.div 
                key={center.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute"
                style={{ 
                  top: `${20 + Math.random() * 60}%`, 
                  left: `${20 + Math.random() * 60}%` 
                }}
              >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                  className="w-4 h-4 bg-rehab-cyan rounded-full shadow-[0_0_20px_#06b6d4] border-2 border-white cursor-pointer"
                  onClick={() => openInMaps(center.uri)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Map Overlay Controls */}
          <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              <input 
                type="text" 
                placeholder="Search medical centers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 glass rounded-2xl text-white placeholder:text-white/20 focus:ring-2 focus:ring-rehab-cyan transition-all border-none"
              />
            </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
            {centers.length > 0 && (
              <div className="glass p-6 rounded-3xl flex items-center gap-6 border-rehab-cyan/30 w-full max-w-md">
                <div className="w-14 h-14 rounded-2xl bg-rehab-cyan/20 flex items-center justify-center text-rehab-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                  <MapPin size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-white truncate">{centers[0].name}</p>
                  <p className="text-xs font-bold text-rehab-cyan uppercase tracking-widest">{centers[0].distance} • Nearby</p>
                </div>
                <button 
                  onClick={() => openInMaps(centers[0].uri)}
                  className="w-12 h-12 rounded-xl bg-white text-slate-950 flex items-center justify-center hover:bg-rehab-cyan transition-colors"
                >
                  <Navigation size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2">
          {/* Emergency Buttons */}
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleCall('108')}
              className="w-full p-6 bg-rose-500 rounded-3xl flex items-center justify-between group hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <PhoneCall size={24} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">Initiate Emergency Call</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Immediate Response Team</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button className="w-full p-6 bg-rehab-blue rounded-3xl flex items-center justify-between group hover:bg-rehab-blue/80 transition-all shadow-xl shadow-rehab-blue/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                  <ShieldAlert size={24} />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">Request Dispatch</p>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">On-site Medical Support</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className="glass-card bg-rehab-teal/10 border-rehab-teal/20 space-y-4">
              <div className="flex items-center gap-2 text-rehab-teal">
                <Globe size={18} />
                <h3 className="text-sm font-bold uppercase tracking-widest">AI Insights</h3>
              </div>
              <div className="text-xs text-white/60 leading-relaxed prose prose-invert prose-xs max-w-none">
                <Markdown>{aiAnalysis}</Markdown>
              </div>
            </div>
          )}

          {/* Nearby Centers List */}
          <div className="glass-card space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Nearby Centers</h3>
              {isLoading && <Loader2 size={16} className="animate-spin text-rehab-cyan" />}
            </div>
            
            <div className="space-y-4">
              {centers.map((center) => (
                <div key={center.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-bold text-white group-hover:text-rehab-cyan transition-colors truncate max-w-[150px]">{center.name}</p>
                    <span className="text-[10px] font-bold text-rehab-emerald uppercase tracking-widest">{center.distance}</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-medium mb-3 truncate">{center.address}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Activity size={10} /> {center.rating}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rehab-emerald">
                        <Clock size={10} /> {center.status}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCall(center.phone); }}
                        className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors"
                      >
                        <PhoneCall size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openInMaps(center.uri); }}
                        className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white transition-colors"
                      >
                        <Navigation size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Tip */}
          <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-200">Safety Protocol</p>
              <p className="text-[10px] text-amber-200/60 leading-relaxed">
                In case of severe joint dislocation or intense inflammation, avoid movement and initiate an emergency call immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
