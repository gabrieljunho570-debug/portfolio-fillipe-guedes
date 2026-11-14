import React, { useState, useEffect } from 'react';
import { Menu, X, Lock } from 'lucide-react';
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from './SocialIcons';
import { buildWhatsappUrl } from '../utils/api';

const NAV_ITEMS = [
  { label: 'INÍCIO', href: '#inicio' },
  { label: 'SOBRE MIM', href: '#sobre' },
  { label: 'TRAJETÓRIA', href: '#trajetoria' },
  { label: 'CONQUISTAS', href: '#conquistas' },
  { label: 'EVENTOS', href: '#eventos' },
  { label: 'TRABALHOS', href: '#trabalhos' },
  { label: 'CONTATO', href: '#contato' },
];

export default function Navbar({ socials, onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('#inicio');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const sections = NAV_ITEMS.map((item) => item.href.slice(1));
      let current = 'inicio';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) current = id;
        }
      }
      setActiveHash(`#${current}`);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsappUrl = buildWhatsappUrl(socials?.whatsappNumber, socials?.whatsappDefaultText);
  const instagramUrl = socials?.instagramUrl || 'https://www.instagram.com/fillipetv/';
  const linkedinUrl = socials?.linkedinUrl || '';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#06101F]/95 backdrop-blur-md border-b border-[#C9A227]/25 shadow-lg shadow-black/20'
          : 'bg-[#06101F]/85 backdrop-blur-sm border-b border-white/10'
      }`}
    >
      {/* Top editorial gold hairline */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#C9A227] to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Brand Signature */}
          <a href="#inicio" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#0B192C] border border-[#C9A227]/60 flex items-center justify-center shadow-inner group-hover:border-[#C9A227] transition-colors">
              <span className="font-serif-editorial font-bold text-base tracking-wider text-white">
                FG
              </span>
            </div>
            <div className="leading-tight">
              <span className="block font-serif-editorial font-bold text-white text-base sm:text-lg tracking-wide">
                FILLIPE GUEDES
              </span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#D9B84A] font-medium">
                Jornalismo & Comunicação
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1" aria-label="Navegação principal">
            {NAV_ITEMS.map((item) => {
              const isActive = activeHash === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-[11px] font-semibold tracking-[0.14em] transition-colors relative ${
                    isActive ? 'text-[#E5C96B]' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-3 right-3 h-[2px] bg-[#C9A227] transition-transform duration-300 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Right Social Icons & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-white/15">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={`Instagram ${socials?.instagramHandle || '@fillipetv'}`}
                className="p-2 rounded-full text-slate-300 hover:text-[#E5C96B] hover:bg-white/5 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>

              {linkedinUrl ? (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="LinkedIn"
                  className="p-2 rounded-full text-slate-300 hover:text-[#E5C96B] hover:bg-white/5 transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
              ) : (
                <a
                  href="#redes"
                  title="LinkedIn (configurar no painel)"
                  className="p-2 rounded-full text-slate-400/70 hover:text-[#E5C96B] hover:bg-white/5 transition-colors"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
              )}

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Conversar no WhatsApp"
                  className="p-2 rounded-full text-slate-300 hover:text-emerald-400 hover:bg-white/5 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              ) : (
                <a
                  href="#contato"
                  title="WhatsApp & Contato"
                  className="p-2 rounded-full text-slate-300 hover:text-[#E5C96B] hover:bg-white/5 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAdmin}
              title="Painel Administrativo"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-200 border border-[#C9A227]/40 hover:border-[#C9A227] hover:bg-[#C9A227]/15 transition-all cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#D9B84A]" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Abrir menu"
              className="xl:hidden p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden bg-[#06101F] border-t border-[#C9A227]/20 px-4 py-5 space-y-2 shadow-2xl">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-xs font-semibold tracking-[0.15em] transition-colors ${
                activeHash === item.href
                  ? 'bg-[#C9A227]/15 text-[#E5C96B] border-l-2 border-[#C9A227]'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              {item.label}
            </a>
          ))}

          <div className="pt-3 mt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-slate-200 text-xs"
              >
                <InstagramIcon className="w-4 h-4 text-[#E5C96B]" />
                <span>Instagram</span>
              </a>
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-slate-200 text-xs"
                >
                  <LinkedInIcon className="w-4 h-4 text-[#E5C96B]" />
                  <span>LinkedIn</span>
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAdmin();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#C9A227]/50 text-[#E5C96B] text-xs font-medium cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Painel Admin</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
