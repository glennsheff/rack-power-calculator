import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HardwareProvider } from './context/HardwareContext';
import { RackProvider } from './context/RackContext';
import { ToastProvider } from './components/ui/Toast';
import { PasswordGate } from './components/layout/PasswordGate';
import { AppShell } from './components/layout/AppShell';
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const HardwarePage = lazy(() => import('./pages/HardwarePage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-aifi-gray border-t-aifi-blue rounded-full animate-spin" />
    </div>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-aifi-black flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-white/20 border-t-aifi-blue rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordGate />;
  }

  return (
    <HardwareProvider>
      <RackProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route
              path="hardware"
              element={
                <Suspense fallback={<PageLoader />}>
                  <HardwarePage />
                </Suspense>
              }
            />
            <Route
              path="calculator"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CalculatorPage />
                </Suspense>
              }
            />
            <Route
              path="help"
              element={
                <Suspense fallback={<PageLoader />}>
                  <HelpPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </RackProvider>
    </HardwareProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ToastProvider>
      <Analytics />
    </BrowserRouter>
  );
}
