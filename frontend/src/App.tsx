import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { StudentSubmitView } from './pages/StudentSubmitView';
import { FacultyDashboardView } from './pages/FacultyDashboardView';
import { AdminSettingsView } from './pages/AdminSettingsView';
import { AnalyticsView } from './pages/AnalyticsView';

// Simple Navigation Layout for demo purposes
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <nav className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center gap-4 text-xs font-medium sticky top-0 z-50">
        <Link to="/" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          Student
        </Link>
        <Link to="/faculty" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/faculty' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          Faculty
        </Link>
        <Link to="/admin" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          Admin
        </Link>
        <Link to="/analytics" className={`px-3 py-1.5 rounded-lg transition-colors ${location.pathname === '/analytics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          Analytics
        </Link>
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<StudentSubmitView />} />
          <Route path="/faculty" element={<FacultyDashboardView />} />
          <Route path="/admin" element={<AdminSettingsView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
