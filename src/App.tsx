import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Exercise from './pages/Exercise';
import Analyzer from './pages/Analyzer';
import Scheduler from './pages/Scheduler';
import AIPrediction from './pages/AIPrediction';
import Emergency from './pages/Emergency';
import Login from './pages/Login';
import Progress from './pages/Progress';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAppContext();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';
  const showShell = profile && !isAuthPage;

  if (!showShell) return <div className="min-h-screen bg-rehab-dark">{children}</div>;

  return (
    <div className="flex min-h-screen bg-rehab-dark overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rehab-teal/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rehab-blue/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="hidden lg:block">
          <Header />
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Bottom Nav for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { profile } = useAppContext();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={profile ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyzer" element={<Analyzer />} />
        <Route path="/exercise" element={<Exercise />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/prediction" element={<AIPrediction />} />
        <Route path="/emergency" element={<Emergency />} />
      </Routes>
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
