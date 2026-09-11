import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';

import Login from '../pages/Login';
import Home from '../pages/Home';
import CreateTicket from '../pages/CreateTicket';
import TicketDetails from '../pages/TicketDetails';
import Analytics from '../pages/Analytics';
import Incidents from '../pages/Incidents';
import KnowledgeCenter from '../pages/KnowledgeCenter';
import CustomerPortal from '../pages/CustomerPortal';
import CustomerTicketView from '../pages/CustomerTicketView';
import NotFound from '../pages/NotFound';
import KeyboardShortcutsModal from '../components/common/KeyboardShortcutsModal';

// Admin / Support Staff Layout Shell
const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f4f7fb] text-slate-900 antialiased font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleMobile={() => setMobileMenuOpen(true)} />
        <div className="flex-1 overflow-y-auto">
          <PageContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:ticketId" element={<TicketDetails />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/knowledge" element={<KnowledgeCenter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageContainer>
        </div>
      </div>
      <KeyboardShortcutsModal />
    </div>
  );
};

// Root index redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'customer') {
    return <Navigate to="/portal" replace />;
  }
  return <AdminLayout />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<Login />} />

            {/* Customer Portal Routes (Protected for Customer & Admin preview) */}
            <Route
              path="/portal"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/portal/tickets/:ticketId"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerTicketView />
                </ProtectedRoute>
              }
            />

            {/* Admin / Employee Support CRM Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RootRedirect />
                </ProtectedRoute>
              }
            />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
