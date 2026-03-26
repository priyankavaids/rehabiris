import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { User, Calendar, Activity, Save, Globe, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const Profile = () => {
  const { profile, setProfile } = useAppContext();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(profile || {
    name: '',
    age: 25,
    gender: 'Male',
    injuryType: '',
    surgeryDetails: '',
    injuryArea: '',
    explanation: '',
    language: 'en',
    voiceInstructor: 'female',
    phoneNumber: '',
    whatsappReminders: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData as any);
    i18n.changeLanguage(formData.language);
    navigate('/dashboard');
  };

  return (
    <div className="p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
      >
        <div className="bg-teal-500 p-10 text-slate-950 relative">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight font-display">{t('profile')}</h1>
          <p className="opacity-60 mt-2 font-medium text-sm md:text-base font-sans">Setup your personalized recovery plan</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2 font-sans">
                <User size={14} className="text-teal-500" /> {t('name')}
              </label>
              <input
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium font-sans"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2 font-sans">
                <Calendar size={14} className="text-teal-500" /> {t('age')}
              </label>
              <input
                type="number"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium font-sans"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2 font-sans">
                <Activity size={14} className="text-teal-500" /> {t('injury_type')}
              </label>
              <input
                type="text"
                placeholder="e.g. ACL Tear"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium font-sans"
                value={formData.injuryType}
                onChange={(e) => setFormData({...formData, injuryType: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2 font-sans">
                <Globe size={14} className="text-teal-500" /> {t('language')}
              </label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium font-sans appearance-none"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="ta" className="bg-slate-900">தமிழ் (Tamil)</option>
                <option value="hi" className="bg-slate-900">हिन्दी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2 font-sans">
              <Activity size={14} className="text-teal-500" /> {t('surgery_details')}
            </label>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium font-sans h-32 resize-none"
              placeholder="Describe your surgery or injury history..."
              value={formData.surgeryDetails}
              onChange={(e) => setFormData({...formData, surgeryDetails: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40 font-sans">Phone Number</label>
              <input
                type="tel"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium font-sans"
                placeholder="+91 00000 00000"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              />
            </div>
            <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/10">
              <input
                type="checkbox"
                id="whatsapp"
                className="w-6 h-6 rounded-lg bg-white/5 border-white/10 text-teal-500 focus:ring-teal-500"
                checked={formData.whatsappReminders}
                onChange={(e) => setFormData({...formData, whatsappReminders: e.target.checked})}
              />
              <label htmlFor="whatsapp" className="text-sm font-medium text-white/60 cursor-pointer font-sans">
                Enable WhatsApp Reminders
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 text-slate-950 py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-teal-400 shadow-xl shadow-teal-500/20 transition-all font-display"
          >
            <Save size={24} /> {t('save_profile')}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Profile;
