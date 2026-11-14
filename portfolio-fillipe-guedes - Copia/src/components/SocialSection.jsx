import React from 'react';
import { ArrowUpRight, Settings } from 'lucide-react';
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from './SocialIcons';
import { buildWhatsappUrl } from '../utils/api';

export default function SocialSection({ socials, onOpenAdmin }) {
  const instagramUrl = socials?.instagramUrl || 'https://www.instagram.com/fillipetv/';
  const instagramHandle = socials?.instagramHandle || '@fillipetv';
  const linkedinUrl = socials?.linkedinUrl || '';
  const whatsappUrl = buildWhatsappUrl(socials?.whatsappNumber, socials?.whatsappDefaultText);

  return (
    <section id="redes" className="py-20 bg-[#0B192C] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 85% 50%, rgba(201, 162, 39, 0.28), transparent 45%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#E5C96B]">
            <span className="w-6 h-[2px] bg-[#C9A227]" />
            <span>Presença Digital</span>
            <span className="w-6 h-[2px] bg-[#C9A227]" />
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-bold text-white">
            Conecte-se nas redes oficiais
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            Acompanhe coberturas em tempo real, bastidores da imprensa, projetos e atualizações profissionais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Instagram Card */}
          <div className="rounded-2xl bg-[#06101F]/90 border border-white/15 hover:border-[#C9A227]/60 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white flex items-center justify-center shadow-lg">
                <InstagramIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#E5C96B] font-semibold">
                  Instagram Oficial
                </p>
                <h3 className="font-serif-editorial text-2xl font-bold text-white mt-1">
                  {instagramHandle}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Bastidores de gravações, coberturas jornalísticas, eventos e conteúdo diário sobre comunicação.
                </p>
              </div>
            </div>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#C9A227] hover:bg-[#D9B84A] text-[#06101F] font-bold text-sm transition-colors"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Acessar Instagram</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* LinkedIn Card */}
          <div className="rounded-2xl bg-[#06101F]/90 border border-white/15 hover:border-[#C9A227]/60 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-lg">
                <LinkedInIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#E5C96B] font-semibold">
                  Rede Profissional
                </p>
                <h3 className="font-serif-editorial text-2xl font-bold text-white mt-1">
                  LinkedIn
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Trajetória corporativa, artigos, conexões institucionais e projetos em comunicação organizacional.
                </p>
              </div>
            </div>

            {linkedinUrl ? (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#0958a8] text-white font-bold text-sm transition-colors"
              >
                <LinkedInIcon className="w-4 h-4" />
                <span>Conecte-se comigo</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            ) : (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="mt-6 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-[#C9A227]/40 text-[#E5C96B] font-semibold text-xs transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Conecte-se comigo (Configurar link no Admin)</span>
              </button>
            )}
          </div>

          {/* WhatsApp Card */}
          <div className="rounded-2xl bg-[#06101F]/90 border border-white/15 hover:border-[#C9A227]/60 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#25D366] text-[#06101F] flex items-center justify-center shadow-lg">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#E5C96B] font-semibold">
                  Atendimento Direto
                </p>
                <h3 className="font-serif-editorial text-2xl font-bold text-white mt-1">
                  WhatsApp Profissional
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Canal ágil para convites de eventos, entrevistas, assessorias e parcerias estratégicas.
                </p>
              </div>
            </div>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#06101F] font-bold text-sm transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Iniciar conversa</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            ) : (
              <a
                href="#contato"
                className="mt-6 inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 text-white font-semibold text-sm transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                <span>Enviar mensagem abaixo</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
