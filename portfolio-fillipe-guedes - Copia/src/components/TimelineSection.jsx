import React, { useState, useEffect } from 'react';
import { Briefcase, Calendar, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';

export default function TimelineSection({ experiences = [] }) {
  const [selectedId, setSelectedId] = useState(experiences[0]?.id || null);

  useEffect(() => {
    if (experiences.length > 0 && !experiences.some((e) => e.id === selectedId)) {
      setSelectedId(experiences[0].id);
    }
  }, [experiences, selectedId]);

  const activeItem = experiences.find((e) => e.id === selectedId) || experiences[0];

  return (
    <section id="trajetoria" className="py-20 lg:py-28 bg-[#F4F6F9] border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0B192C]">
            <span className="w-8 h-[2px] bg-[#C9A227]" />
            <span>Trajetória Profissional</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0B192C] leading-tight">
            Linha do tempo de experiências e atuação na imprensa.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Selecione cada marco abaixo para acompanhar a evolução profissional no jornalismo, na edição televisiva, na reportagem e na comunicação organizacional.
          </p>
        </div>

        {experiences.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500">
            Nenhuma experiência cadastrada no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Interactive Timeline List */}
            <div className="lg:col-span-6 relative">
              {/* Vertical Line */}
              <div className="absolute left-5 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#C9A227] via-slate-300 to-transparent" />

              <div className="space-y-4">
                {experiences.map((item, idx) => {
                  const isActive = item.id === activeItem?.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left relative pl-14 pr-5 py-5 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                        isActive
                          ? 'bg-[#0B192C] text-white border-[#C9A227] shadow-xl shadow-[#0B192C]/15'
                          : 'bg-white text-slate-900 border-slate-200/90 hover:border-[#C9A227]/60 hover:shadow-md'
                      }`}
                    >
                      {/* Timeline Node */}
                      <span
                        className={`absolute left-3 top-6 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#C9A227] border-[#0B192C] ring-4 ring-[#C9A227]/25'
                            : 'bg-white border-slate-400 group-hover:border-[#C9A227]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? 'bg-[#0B192C]' : 'bg-slate-400 group-hover:bg-[#C9A227]'
                          }`}
                        />
                      </span>

                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full ${
                                isActive
                                  ? 'bg-[#C9A227]/20 text-[#E5C96B]'
                                  : 'bg-slate-100 text-[#0B192C]'
                              }`}
                            >
                              {item.category || `Etapa 0${idx + 1}`}
                            </span>
                            {item.period && (
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium ${
                                  isActive ? 'text-slate-300' : 'text-slate-500'
                                }`}
                              >
                                <Calendar className="w-3 h-3 text-[#C9A227]" />
                                {item.period}
                              </span>
                            )}
                          </div>

                          <h3
                            className={`font-serif-editorial text-lg sm:text-xl font-bold ${
                              isActive ? 'text-white' : 'text-[#0B192C]'
                            }`}
                          >
                            {item.role}
                          </h3>
                          <p
                            className={`text-sm font-semibold ${
                              isActive ? 'text-[#E5C96B]' : 'text-slate-600'
                            }`}
                          >
                            {item.organization}
                          </p>
                        </div>

                        <ChevronRight
                          className={`w-5 h-5 shrink-0 mt-1 transition-transform ${
                            isActive
                              ? 'text-[#E5C96B] translate-x-1'
                              : 'text-slate-400 group-hover:text-[#0B192C]'
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Experience Detail Spotlight */}
            {activeItem && (
              <div className="lg:col-span-6 lg:sticky lg:top-28">
                <div className="rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60 overflow-hidden">
                  {/* Top Navy Banner */}
                  <div className="bg-[#0B192C] px-7 py-6 border-b border-[#C9A227]/40">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-[#E5C96B]">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{activeItem.category || 'Experiência Profissional'}</span>
                      </span>
                      {activeItem.highlight && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[10px] font-semibold uppercase tracking-wider text-[#E5C96B]">
                          <Sparkles className="w-3 h-3" />
                          Destaque
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-white leading-snug">
                      {activeItem.role}
                    </h3>
                    <p className="text-base font-medium text-[#E5C96B] mt-1">
                      {activeItem.organization}
                    </p>
                  </div>

                  {/* Body */}
                  <div className="p-7 space-y-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F4F6F9] text-[#0B192C] font-medium border border-slate-200">
                        <Calendar className="w-4 h-4 text-[#C9A227]" />
                        {activeItem.period ? activeItem.period : 'Período configurável no Painel Admin'}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Atuação e Responsabilidades
                      </h4>
                      <p className="text-slate-700 leading-relaxed text-base whitespace-pre-line">
                        {activeItem.description ||
                          'Descrição detalhada disponível para atualização no painel administrativo.'}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0" />
                      <span>
                        Experiência gerenciável e expansível diretamente pelo Painel Administrativo.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
