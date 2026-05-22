import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MobileLayout } from './components/layout/MobileLayout';
import { QBankView } from './pages/QBankView';
import { TestsView } from './pages/TestsView';
import { FacultyDashboardView } from './pages/FacultyDashboardView';
import { AdminSettingsView } from './pages/AdminSettingsView';
import { AnalyticsView } from './pages/AnalyticsView';

// Temporary placeholder for unimplemented tabs
const PlaceholderView: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center h-full">
    <h2 className="text-xl font-bold text-brand-textMuted">{title} Coming Soon</h2>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Student Mobile Routes (wrapped in MobileLayout) */}
        <Route path="/" element={<MobileLayout><PlaceholderView title="Home" /></MobileLayout>} />
        <Route path="/qbank" element={<MobileLayout><QBankView /></MobileLayout>} />
        <Route path="/tests" element={<MobileLayout><TestsView /></MobileLayout>} />
        <Route path="/videos" element={<MobileLayout><PlaceholderView title="Videos" /></MobileLayout>} />
        <Route path="/buy" element={<MobileLayout><PlaceholderView title="Store" /></MobileLayout>} />
        
        {/* Internal Ops Routes (No bottom nav) */}
        <Route path="/faculty" element={<FacultyDashboardView />} />
        <Route path="/admin" element={<AdminSettingsView />} />
        <Route path="/analytics" element={<AnalyticsView />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/qbank" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
