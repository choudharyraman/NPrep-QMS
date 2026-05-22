// src/App.tsx — Auth-protected routes with role-based redirects
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MobileLayout } from './components/layout/MobileLayout';

// Pages
import { LoginView } from './pages/LoginView';
import { HomeView } from './pages/HomeView';
import { MyTicketsView } from './pages/MyTicketsView';
import { TicketDetailView } from './pages/TicketDetailView';
import { QBankView } from './pages/QBankView';
import { TestsView } from './pages/TestsView';
import { FacultyDashboardView } from './pages/FacultyDashboardView';
import { AnalyticsView } from './pages/AnalyticsView';
import { OpsView } from './pages/OpsView';
import { AdminSettingsView } from './pages/AdminSettingsView';

// Placeholder for Videos
const VideosPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full bg-brand-bg px-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mb-4">
      <span className="text-3xl">🎬</span>
    </div>
    <h2 className="text-lg font-bold text-brand-textMain">Videos Coming Soon</h2>
    <p className="text-brand-textMuted text-sm mt-2">Expert lecture videos will be available here.</p>
  </div>
);

// Protected route — redirects to login if not authenticated, checks role
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
  layout?: 'mobile' | 'none';
}> = ({ children, allowedRoles, layout = 'none' }) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate home for their role
    if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
    if (user.role === 'ops') return <Navigate to="/ops" replace />;
    return <Navigate to="/home" replace />;
  }

  if (layout === 'mobile') {
    return <MobileLayout>{children}</MobileLayout>;
  }

  return <>{children}</>;
};

// Root redirect based on user role
const RootRedirect: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (user?.role === 'faculty') return <Navigate to="/faculty" replace />;
  if (user?.role === 'ops') return <Navigate to="/ops" replace />;
  return <Navigate to="/home" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginView />} />

      {/* Root → role-based redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Student Routes (mobile layout) ── */}
      <Route path="/home" element={
        <ProtectedRoute allowedRoles={['student']} layout="mobile">
          <HomeView />
        </ProtectedRoute>
      } />
      <Route path="/my-tickets" element={
        <ProtectedRoute allowedRoles={['student']} layout="mobile">
          <MyTicketsView />
        </ProtectedRoute>
      } />
      <Route path="/my-tickets/:id" element={
        <ProtectedRoute allowedRoles={['student']} layout="mobile">
          <TicketDetailView />
        </ProtectedRoute>
      } />
      <Route path="/qbank" element={
        <ProtectedRoute allowedRoles={['student']} layout="mobile">
          <QBankView />
        </ProtectedRoute>
      } />
      <Route path="/tests" element={
        <ProtectedRoute allowedRoles={['student']} layout="mobile">
          <TestsView />
        </ProtectedRoute>
      } />
      <Route path="/videos" element={
        <ProtectedRoute allowedRoles={['student']} layout="mobile">
          <VideosPlaceholder />
        </ProtectedRoute>
      } />

      {/* ── Faculty Routes (desktop) ── */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty', 'ops']}>
          <FacultyDashboardView />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute allowedRoles={['faculty', 'ops']}>
          <AnalyticsView />
        </ProtectedRoute>
      } />

      {/* ── Ops Routes (desktop) ── */}
      <Route path="/ops" element={
        <ProtectedRoute allowedRoles={['ops']}>
          <OpsView />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ops']}>
          <AdminSettingsView />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
