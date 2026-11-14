import React, { useState } from 'react';
import { Award, Building, Calendar, PlusCircle, Sparkles, Trophy, X } from 'lucide-react';

export default function AwardsSection({ awards = [], onOpenAdmin }) {
  const [previewImage, setPreviewImage] = useState(null);

  return (
    <section
      id="conquistas"
      className="relative py-20 lg:py-28 bg-[#06101F] text-white overflow-hidden"
    >
      {/* Ambient gold glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(201, 162, 39, 0.35), transparent 55%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#E5C96B]">
              <span className="w-8 h-[2px] bg-[#C9A227]" />
              <span>Premiações, Certificados &amp; Homenagens</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[46px] font-bold text-white leading-tight">
              Conquistas que contam histórias
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Reconhecimentos, prêmios jornalísticos, homenagens institucionais e certificações que marcam uma trajetória dedicada à comunicação ética e transformadora.
            </p>
          </div>

          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-[#C9A227]/35 self-start lg:self-auto">
            <Trophy className="w-5 h-5 text-[#E5C96B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              {awards.length === 0
                ? 'Vitrine Oficial de Reconhecimentos'
                : `${awards.length} ${awards.length === 1 ? 'Conquista Registrada' : 'Conquistas Registradas'}`}
            </span>
          </div>
        </div>

        {awards.length === 0 ? (
          <div className="rounded-3xl bg-gradient-to-br from-[#0F233F]/90 to-[#0B192C] border border-[#C9A227]/35 p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/50 flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8 text-[#E5C96B]" />
            </div>
            <h3 className="font-serif-editorial text-2xl sm:text-3xl font-bold text-white mb-3">
              Espaço Reservado às Premiações e Homenagens Reais
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8">
              Em respeito à autenticidade jornalística, nenhum prêmio ou certificado é simulado. Utilize o Painel Administrativo para cadastrar suas premiações reais, com foto da conquista, instituição responsável, ano e descrição.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
              {[
                { label: 'Prêmios de Jornalismo', sub: 'Destaque visual em dourado e azul-marinho' },
                { label: 'Certificados & Títulos', sub: 'Registro oficial com instituição e ano' },
                { label: 'Homenagens & Honrarias', sub: 'Galeria individual com foto em alta definição' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <p className="text-sm font-semibold text-[#E5C96B]">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C9A227] hover:bg-[#D9B84A] text-[#06101F] font-semibold text-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Conquista no Painel Admin</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {awards.map((award) => {
              const isJournalism =
                /jornal|comunica|imprensa|reportagem/i.test(award.category || '') || award.featured;
              return (
                <article
                  key={award.id}
                  className={`group rounded-2xl overflow-hidden bg-[#0B192C] border transition-all duration-300 flex flex-col hover:-translate-y-1 ${
                    isJournalism
                      ? 'border-[#C9A227]/60 shadow-xl shadow-[#C9A227]/10'
                      : 'border-white/15 hover:border-[#C9A227]/50'
                  }`}
                >
                  {/* Award Photo */}
                  <div className="relative aspect-[16/10] bg-[#0F233F] overflow-hidden">
                    {award.photoUrl ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage({ url: award.photoUrl, title: award.title })}
                        className="w-full h-full block cursor-pointer"
                      >
                        <img
                          src={award.photoUrl}
                          alt={award.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#112642] to-[#06101F]">
                        <div className="w-16 h-16 rounded-full border border-[#C9A227]/60 bg-[#C9A227]/10 flex items-center justify-center">
                          <Trophy className="w-7 h-7 text-[#E5C96B]" />
                        </div>
                      </div>
                    )}

                    {/* Year Badge */}
                    {award.year && (
                      <span className="absolute top-3.5 right-3.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#06101F]/90 border border-[#C9A227]/50 text-xs font-bold text-[#E5C96B] backdrop-blur-sm">
                        <Calendar className="w-3 h-3" />
                        {award.year}
                      </span>
                    )}

                    {/* Category Badge */}
                    <span className="absolute top-3.5 left-3.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#C9A227] text-[#06101F] text-[10px] font-bold uppercase tracking-wider">
                      {isJournalism && <Sparkles className="w-3 h-3" />}
                      {award.category || 'Reconhecimento'}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="font-serif-editorial text-xl font-bold text-white leading-snug group-hover:text-[#E5C96B] transition-colors">
                        {award.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#D9B84A]">
                        <Building className="w-3.5 h-3.5 shrink-0" />
                        <span>{award.institution}</span>
                      </div>
                      {award.description && (
                        <p className="text-sm text-slate-300 leading-relaxed pt-1">
                          {award.description}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for award photo */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl w-full text-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              className="max-h-[82vh] mx-auto rounded-xl object-contain shadow-2xl"
            />
            <p className="mt-4 font-serif-editorial text-lg text-white">{previewImage.title}</p>
          </div>
        </div>
      )}
    </section>
  );
}
