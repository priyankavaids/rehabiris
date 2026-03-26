import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface PatientProfile {
  name: string;
  age: number;
  gender: string;
  injuryType: string;
  surgeryDetails: string;
  injuryArea: string;
  explanation: string;
  language: string;
  voiceInstructor: 'male' | 'female';
  phoneNumber?: string;
  whatsappReminders?: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
  date?: string;
}

interface AppContextType {
  profile: PatientProfile | null;
  setProfile: (p: PatientProfile) => void;
  history: any[];
  addHistory: (entry: any) => void;
  milestones: Milestone[];
  addMilestone: (title: string) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<PatientProfile | null>(() => {
    const saved = localStorage.getItem('rehab_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error('Failed to fetch history:', err));
  }, []);

  const addHistory = async (entry: any) => {
    const newEntry = { ...entry, date: new Date().toISOString() };
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      });
      if (res.ok) {
        setHistory(prev => [newEntry, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add history:', err);
    }
  };
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('rehab_milestones');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', title: 'Initial Assessment', completed: true, progress: 100, date: 'Mar 10' },
      { id: '2', title: 'Post-Op Analysis', completed: true, progress: 100, date: 'Mar 15' },
      { id: '3', title: 'Range of Motion Phase', completed: false, progress: 45, date: 'In Progress' },
      { id: '4', title: 'Strength Training', completed: false, progress: 0, date: 'Apr 05' },
    ];
  });

  const setProfile = (p: PatientProfile) => {
    setProfileState(p);
    localStorage.setItem('rehab_profile', JSON.stringify(p));
  };

  const addMilestone = (title: string) => {
    const newMilestone: Milestone = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      completed: false,
      progress: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    const newMilestones = [...milestones, newMilestone];
    setMilestones(newMilestones);
    localStorage.setItem('rehab_milestones', JSON.stringify(newMilestones));
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const newMilestones = milestones.map(m => m.id === id ? { ...m, ...updates } : m);
    setMilestones(newMilestones);
    localStorage.setItem('rehab_milestones', JSON.stringify(newMilestones));
  };

  const deleteMilestone = (id: string) => {
    const newMilestones = milestones.filter(m => m.id !== id);
    setMilestones(newMilestones);
    localStorage.setItem('rehab_milestones', JSON.stringify(newMilestones));
  };

  return (
    <AppContext.Provider value={{ 
      profile, 
      setProfile, 
      history, 
      addHistory,
      milestones,
      addMilestone,
      updateMilestone,
      deleteMilestone
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
