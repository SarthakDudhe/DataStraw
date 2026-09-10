import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Home from '../pages/Home';
import CreateTicket from '../pages/CreateTicket';
import TicketDetails from '../pages/TicketDetails';
import Analytics from '../pages/Analytics';
import Incidents from '../pages/Incidents';
import NotFound from '../pages/NotFound';
import KeyboardShortcutsModal from '../components/common/KeyboardShortcutsModal';

const AppLayout = () => {
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageContainer>
        </div>
      </div>
      <KeyboardShortcutsModal />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
