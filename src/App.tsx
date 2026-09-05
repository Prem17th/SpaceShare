import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SpaceProvider } from './context/SpaceContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { MobileNav } from './components/common/MobileNav';
import { AuthModal } from './components/auth/AuthModal';
import { AIAssistantWidget } from './components/AIAssistantWidget';

import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { SpaceDetailsPage } from './pages/SpaceDetailsPage';
import { HostDashboardPage } from './pages/HostDashboardPage';
import { ListingWizard } from './components/host/ListingWizard';
import { BookingsPage } from './pages/BookingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SafetyPage } from './pages/SafetyPage';
import { AdminPage } from './pages/AdminPage';
import { ChatPage } from './pages/ChatPage';
import { TripPlannerPage } from './pages/TripPlannerPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<Record<string, any>>({});

  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        setPageParams(event.state.params || {});
      } else {
        setCurrentPage('landing');
        setPageParams({});
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state
    window.history.replaceState({ page: 'landing', params: {} }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (page: string, params?: Record<string, any>) => {
    setCurrentPage(page);
    if (params) {
      setPageParams(params);
    } else {
      setPageParams({});
    }
    window.history.pushState({ page, params: params || {} }, '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {currentPage !== 'trip-planner' && <Header onNavigate={handleNavigate} currentPage={currentPage} />}

      <main className="flex-1 animate-fade-in-up">
        {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'search' && <SearchPage onNavigate={handleNavigate} />}
        {currentPage === 'space-details' && (
          <SpaceDetailsPage spaceId={pageParams.spaceId || 'sp_101'} onNavigate={handleNavigate} />
        )}
        {currentPage === 'host' && <HostDashboardPage onNavigate={handleNavigate} />}
        {currentPage === 'host-wizard' && (
          <div className="pt-6">
            <ListingWizard
              onComplete={() => handleNavigate('host')}
              onCancel={() => handleNavigate('host')}
            />
          </div>
        )}
        {currentPage === 'bookings' && <BookingsPage onNavigate={handleNavigate} />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'safety' && <SafetyPage />}
        {currentPage === 'admin' && <AdminPage />}
        {currentPage === 'chat' && <ChatPage />}
        {currentPage === 'saved' && <SearchPage onNavigate={handleNavigate} />}
        {currentPage === 'policy' && <SafetyPage />}
        {currentPage === 'trip-planner' && <TripPlannerPage />}
      </main>

      <AuthModal />
      {currentPage !== 'trip-planner' && (
        <>
          <AIAssistantWidget onNavigate={handleNavigate} />
          <MobileNav currentPage={currentPage} onNavigate={handleNavigate} />
          <Footer onNavigate={handleNavigate} />
        </>
      )}
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SpaceProvider>
          <AppContent />
        </SpaceProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
