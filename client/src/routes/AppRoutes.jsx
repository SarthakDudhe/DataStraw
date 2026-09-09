import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../components/common/Toast';
import Navbar from '../components/layout/Navbar';
import PageContainer from '../components/layout/PageContainer';
import Home from '../pages/Home';
import CreateTicket from '../pages/CreateTicket';
import TicketDetails from '../pages/TicketDetails';
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
          <Navbar />
          <PageContainer>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:ticketId" element={<TicketDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageContainer>
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
