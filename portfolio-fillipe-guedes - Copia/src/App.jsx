import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import TimelineSection from './components/TimelineSection';
import AwardsSection from './components/AwardsSection';
import GallerySection from './components/GallerySection';
import WorksSection from './components/WorksSection';
import SocialSection from './components/SocialSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import { apiRequest } from './utils/api';

export default function App() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(() => window.location.pathname === '/admin');

  const fetchPortfolio = useCallback(async () => {
    try {
      const data = await apiRequest('/api/portfolio');
      setPortfolio(data);
    } catch (err) {
      console.error('Erro ao carregar portfólio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const openAdmin = () => {
    setAdminOpen(true);
    if (window.location.pathname !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
  };

  const closeAdmin = () => {
    setAdminOpen(false);
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  useEffect(() => {
    const onPopState = () => {
      setAdminOpen(window.location.pathname === '/admin');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  if (loading && !portfolio) {
    return (
      <div className="min-h-screen bg-[#06101F] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-14 h-14 rounded-xl bg-[#0B192C] border border-[#C9A227] flex items-center justify-center animate-pulse">
          <span className="font-serif-editorial text-xl font-bold text-white">FG</span>
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-[#E5C96B]">
          Carregando Portfólio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar socials={portfolio?.socials} onOpenAdmin={openAdmin} />

      <main className="flex-1">
        <HeroSection profile={portfolio?.profile} onOpenAdmin={openAdmin} />
        <AboutSection profile={portfolio?.profile} />
        <TimelineSection experiences={portfolio?.experiences || []} />
        <AwardsSection awards={portfolio?.awards || []} onOpenAdmin={openAdmin} />
        <GallerySection gallery={portfolio?.gallery || []} onOpenAdmin={openAdmin} />
        <WorksSection works={portfolio?.works || []} onOpenAdmin={openAdmin} />
        <SocialSection socials={portfolio?.socials} onOpenAdmin={openAdmin} />
        <ContactSection socials={portfolio?.socials} onOpenAdmin={openAdmin} />
      </main>

      <Footer
        profile={portfolio?.profile}
        socials={portfolio?.socials}
        onOpenAdmin={openAdmin}
      />

      {adminOpen && (
        <AdminPanel
          portfolio={portfolio}
          onRefreshPortfolio={fetchPortfolio}
          onClose={closeAdmin}
        />
      )}
    </div>
  );
}
