import React from 'react';
import { ArrowRight, Award, Camera, Mail, Sparkles } from 'lucide-react';

export default function HeroSection({ profile, onOpenAdmin }) {
  const hasPhoto = Boolean(profile?.heroPhoto);

  return (
    <section
      id="inicio"
      className="relative min-h-screen pt-24 pb-16 lg:pt-28 lg:pb-24 bg-[#06101F] text-white overflow-hidden flex items-center"
    >
      {/* Subtle architectural broadcast background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 75% 25%, rgba(201, 162, 39, 0.22), transparent 45%), radial-gradient(circle at 15% 80%, rgba(30, 64, 115, 0.45), transparent 50%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-7 space-y-6 animate-fade-up">
            {/* Editorial Press Tag */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#C9A227]/40 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#D9B84A] animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E5C96B]">
                Portfólio Profissional Oficial
              </span>
            </div>

            {/* Name & Title */}
            <div className="space-y-3">
              <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white leading-[1.05]">
                {profile?.name || 'Fillipe Guedes'}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl font-medium text-[#E5C96B] tracking-wide">
                {profile?.title || 'Jornalista | Repórter | Comunicação Organizacional'}
              </p>
            </div>

            {/* Gold Divider */}
            <div className="w-24 h-[2px] bg-gradient-to-r from-[#C9A227] to-transparent" />

            {/* Impact Quote */}
            <blockquote className="relative pl-5 sm:pl-6 border-l-2 border-[#C9A227] py-1">
              <p className="font-serif-editorial italic text-xl sm:text-2xl lg:text-[26px] text-slate-100 leading-relaxed font-normal">
                “{profile?.quote ||
                  'Comunicar é transformar informação em conhecimento, dar voz às histórias e aproximar pessoas da realidade.'}”
              </p>
            </blockquote>

            {/* Short Introduction */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              {profile?.aboutLead ||
                'Comunicação com credibilidade, rigor editorial e proximidade com o público.'}{' '}
              Conheça sua atuação na comunicação organizacional, edição de texto, reportagens e participação em coberturas jornalísticas e eventos.
            </p>

            {/* 3 Requested CTA Buttons */}
            <div className="pt-2 flex flex-wrap gap-3.5">
              <a
                href="#trajetoria"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#C9A227] hover:bg-[#D9B84A] text-[#06101F] font-semibold text-sm tracking-wide shadow-lg shadow-[#C9A227]/20 transition-all hover:-translate-y-0.5"
              >
                <span>Conheça minha trajetória</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#conquistas"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/8 hover:bg-white/15 border border-[#C9A227]/50 text-white font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5"
              >
                <Award className="w-4 h-4 text-[#E5C96B]" />
                <span>Veja minhas conquistas</span>
              </a>

              <a
                href="#contato"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-transparent hover:bg-white/8 border border-white/25 text-slate-100 font-semibold text-sm tracking-wide transition-all hover:-translate-y-0.5"
              >
                <Mail className="w-4 h-4 text-[#E5C96B]" />
                <span>Entre em contato</span>
              </a>
            </div>

            {/* Authentic Highlights Strip */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#D9B84A] font-semibold">
                  Atuação Editorial
                </p>
                <p className="text-sm text-slate-200 font-medium mt-0.5">
                  TV Antares Piauí &amp; Meio Norte
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#D9B84A] font-semibold">
                  Especialidade
                </p>
                <p className="text-sm text-slate-200 font-medium mt-0.5">
                  Comunicação Organizacional
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#D9B84A] font-semibold">
                  Presença Digital
                </p>
                <p className="text-sm text-slate-200 font-medium mt-0.5">
                  @fillipetv
                </p>
              </div>
            </div>
          </div>

          {/* Right Featured Portrait Column */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Decorative Gold Corner Frames */}
              <div className="absolute -top-3 -left-3 w-16 h-16 border-t-2 border-l-2 border-[#C9A227] rounded-tl-xl pointer-events-none" />
              <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b-2 border-r-2 border-[#C9A227] rounded-br-xl pointer-events-none" />

              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0F233F] to-[#06101F] border border-white/15 shadow-2xl shadow-black/60">
                {hasPhoto ? (
                  <>
                    <img
                      src={profile.heroPhoto}
                      alt={`${profile?.name || 'Fillipe Guedes'} — Jornalista`}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#06101F] via-[#06101F]/60 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                      <div>
                        <p className="font-serif-editorial text-lg font-semibold text-white">
                          {profile?.name || 'Fillipe Guedes'}
                        </p>
                        <p className="text-xs text-[#E5C96B] tracking-wider uppercase">
                          Jornalista • Repórter
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-[#06101F]/80 border border-[#C9A227]/40 text-[10px] uppercase tracking-widest text-[#E5C96B]">
                        Imprensa
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-between p-8 text-center">
                    <div className="w-full flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-slate-400">
                      <span>RETRATO OFICIAL</span>
                      <span className="text-[#D9B84A]">IMPRENSA</span>
                    </div>

                    <div className="flex flex-col items-center space-y-5 my-auto">
                      <div className="w-28 h-28 rounded-full border-2 border-[#C9A227]/60 bg-[#0B192C] flex items-center justify-center shadow-inner">
                        <span className="font-serif-editorial text-4xl font-bold text-white tracking-wider">
                          FG
                        </span>
                      </div>
                      <div className="space-y-2 max-w-xs">
                        <p className="font-serif-editorial text-xl font-semibold text-white">
                          Espaço para Foto Profissional
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Nenhuma imagem artificial é utilizada. Faça o envio da foto oficial real de Fillipe Guedes diretamente pelo Painel Administrativo.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenAdmin}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C9A227]/15 hover:bg-[#C9A227]/25 border border-[#C9A227]/50 text-[#E5C96B] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Enviar foto no Painel Admin</span>
                      </button>
                    </div>

                    <div className="w-full pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>100% autenticidade visual</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
