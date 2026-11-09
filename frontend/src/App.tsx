import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Spinner from './components/ui/Spinner';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EquipmentPage = lazy(() => import('./pages/EquipmentPage'));
const EquipmentDetailPage = lazy(() => import('./pages/EquipmentDetailPage'));
const BookingsPage = lazy(() => import('./pages/BookingsPage'));
const UsagePage = lazy(() => import('./pages/UsagePage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));
const SchedulesPage = lazy(() => import('./pages/SchedulesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

const PageLoader = () => (
  <div className="flex h-full items-center justify-center min-h-[400px]">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/equipment" element={<EquipmentPage />} />
          <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/usage" element={<UsagePage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

