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
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAppContext();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';
  const showShell = profile && !isAuthPage;

  if (!showShell) return <div className="min-h-screen bg-slate-950">{children}</div>;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
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
