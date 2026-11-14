import React from 'react';
import { Mic, FileText, Building2, Radio } from 'lucide-react';

const PILLARS = [
  {
    icon: Building2,
    title: 'Comunicação Organizacional',
    desc: 'Estratégia, alinhamento institucional e construção de imagem com clareza e propósito.',
  },
  {
    icon: FileText,
    title: 'Edição de Texto & Conteúdo',
    desc: 'Rigor editorial, apuração criteriosa e narrativa jornalística adaptada a múltiplos formatos.',
  },
  {
    icon: Mic,
    title: 'Reportagem & Entrevistas',
    desc: 'Olhar atento aos fatos, escuta ativa e condução de entrevistas que aproximam o público da notícia.',
  },
  {
    icon: Radio,
    title: 'Coberturas & Eventos',
    desc: 'Presença em coberturas jornalísticas, projetos especiais e eventos institucionais.',
  },
];

export default function AboutSection({ profile }) {
  const hasAboutPhoto = Boolean(profile?.aboutPhoto);

  return (
    <section id="sobre" className="py-20 lg:py-28 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Editorial Left Header & Text */}
          <div className={hasAboutPhoto ? 'lg:col-span-7 space-y-6' : 'lg:col-span-6 space-y-6'}>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0B192C]">
              <span className="w-8 h-[2px] bg-[#C9A227]" />
              <span>Sobre Mim</span>
            </div>

            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0B192C] leading-tight">
              Jornalismo com propósito, técnica e conexão humana.
            </h2>

            <p className="text-lg font-medium text-[#0B192C]/90 leading-relaxed">
              {profile?.aboutLead ||
                'Comunicação com credibilidade, rigor editorial e proximidade com o público.'}
            </p>

            <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
              {profile?.aboutText ||
                'Jornalista e especialista em Comunicação Organizacional com atuação voltada para a produção de conteúdo informativo, apuração e edição jornalística, reportagens e participação em coberturas e eventos.'}
            </p>

            {hasAboutPhoto && (
              <div className="pt-2">
                <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C9A227]" />
                  <span className="text-xs font-semibold text-[#0B192C] tracking-wide">
                    Fillipe Guedes — {profile?.title || 'Jornalista | Repórter | Comunicação Organizacional'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pillars Grid or Photo + Pillars */}
          <div className={hasAboutPhoto ? 'lg:col-span-5 space-y-6' : 'lg:col-span-6'}>
            {hasAboutPhoto && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xl aspect-[16/10] bg-[#0B192C]">
                <img
                  src={profile.aboutPhoto}
                  alt="Fillipe Guedes em atuação profissional"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="group p-6 rounded-2xl bg-[#F8F9FB] border border-slate-200/80 hover:border-[#C9A227]/60 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#0B192C] text-[#E5C96B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif-editorial text-lg font-bold text-[#0B192C] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
