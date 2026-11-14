import React from 'react';
import { Lock } from 'lucide-react';
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from './SocialIcons';
import { buildWhatsappUrl } from '../utils/api';

export default function Footer({ profile, socials, onOpenAdmin }) {
  const year = new Date().getFullYear();
  const instagramUrl = socials?.instagramUrl || 'https://www.instagram.com/fillipetv/';
  const linkedinUrl = socials?.linkedinUrl || '';
  const whatsappUrl = buildWhatsappUrl(socials?.whatsappNumber, socials?.whatsappDefaultText);

  return (
    <footer className="bg-[#06101F] text-slate-300 border-t border-[#C9A227]/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0B192C] border border-[#C9A227]/60 flex items-center justify-center">
                <span className="font-serif-editorial font-bold text-base text-white">FG</span>
              </div>
              <div>
                <p className="font-serif-editorial font-bold text-white text-lg">
                  {profile?.name || 'Fillipe Guedes'}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#E5C96B]">
                  {profile?.title || 'Jornalista | Repórter | Comunicação Organizacional'}
                </p>
              </div>
            </div>
            <p className="font-serif-editorial italic text-sm text-slate-300 leading-relaxed max-w-md">
              “{profile?.quote ||
                'Comunicar é transformar informação em conhecimento, dar voz às histórias e aproximar pessoas da realidade.'}”
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C96B]">
              Navegação
            </p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-medium">
              <a href="#inicio" className="hover:text-white transition-colors">Início</a>
              <a href="#sobre" className="hover:text-white transition-colors">Sobre Mim</a>
              <a href="#trajetoria" className="hover:text-white transition-colors">Trajetória</a>
              <a href="#conquistas" className="hover:text-white transition-colors">Conquistas</a>
              <a href="#eventos" className="hover:text-white transition-colors">Eventos</a>
              <a href="#trabalhos" className="hover:text-white transition-colors">Trabalhos</a>
              <a href="#contato" className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>

          {/* Socials & Admin */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C96B]">
              Canais Oficiais
            </p>
            <div className="flex items-center gap-2.5">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2.5 rounded-xl bg-white/5 hover:bg-[#C9A227] hover:text-[#06101F] border border-white/10 transition-all"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#0A66C2] hover:text-white border border-white/10 transition-all"
                >
                  <LinkedInIcon className="w-4 h-4" />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-[#25D366] hover:text-[#06101F] border border-white/10 transition-all"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#E5C96B] transition-colors cursor-pointer pt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acesso ao Painel Administrativo</span>
            </button>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {year} Fillipe Guedes. Todos os direitos reservados.</p>
          <p>Portfólio Digital Profissional</p>
        </div>
      </div>
    </footer>
  );
}
