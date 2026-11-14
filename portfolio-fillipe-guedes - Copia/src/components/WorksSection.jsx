import React, { useState } from 'react';
import {
  Calendar,
  ExternalLink,
  Newspaper,
  Play,
  PlusCircle,
  Tv,
  X,
} from 'lucide-react';
import { getEmbedVideoUrl } from '../utils/api';

export const WORK_CATEGORIES = [
  'Reportagens',
  'Entrevistas',
  'Matérias publicadas',
  'Vídeos de reportagens',
  'Participações em programas',
  'Links de notícias publicadas',
];

export default function WorksSection({ works = [], onOpenAdmin }) {
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [videoModal, setVideoModal] = useState(null);

  const filtered =
    activeFilter === 'Todos'
      ? works
      : works.filter((item) => item.category === activeFilter);

  return (
    <section id="trabalhos" className="py-20 lg:py-28 bg-[#F4F6F9] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0B192C]">
            <span className="w-8 h-[2px] bg-[#C9A227]" />
            <span>Trabalhos e Produções Jornalísticas</span>
          </div>
          <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0B192C] leading-tight">
            Meu trabalho em destaque
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Reportagens, entrevistas, matérias publicadas, vídeos e participações em programas jornalísticos.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['Todos', ...WORK_CATEGORIES].map((cat) => {
            const active = activeFilter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0B192C] text-[#E5C96B] border border-[#0B192C] shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-[#C9A227] hover:text-[#0B192C]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Cards or Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-10 sm:p-14 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#0B192C] text-[#E5C96B] flex items-center justify-center mx-auto mb-5">
              <Newspaper className="w-7 h-7" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold text-[#0B192C] mb-2">
              {activeFilter === 'Todos'
                ? 'Vitrine pronta para suas publicações reais'
                : `Nenhuma publicação em "${activeFilter}" ainda`}
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
              Publique links de matérias, vídeos de reportagens, entrevistas e participações em programas pelo Painel Administrativo, com imagem de capa, título, descrição e acesso direto ao conteúdo original.
            </p>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#D9B84A] text-[#06101F] text-xs font-bold tracking-wide transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Trabalho no Painel Admin</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((work) => {
              const hasVideo = Boolean(work.videoUrl);
              const hasLink = Boolean(work.linkUrl);
              return (
                <article
                  key={work.id}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C9A227]/60 transition-all duration-300 flex flex-col"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/10] bg-[#0B192C] overflow-hidden">
                    {work.imageUrl ? (
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0B192C] to-[#112642] text-white/80 p-6">
                        {hasVideo ? (
                          <Tv className="w-10 h-10 text-[#E5C96B]" />
                        ) : (
                          <Newspaper className="w-10 h-10 text-[#E5C96B]" />
                        )}
                      </div>
                    )}

                    <span className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full bg-[#06101F]/90 border border-[#C9A227]/45 text-[10px] font-bold uppercase tracking-wider text-[#E5C96B]">
                      {work.category}
                    </span>

                    {hasVideo && (
                      <button
                        type="button"
                        onClick={() => setVideoModal(work)}
                        aria-label={`Assistir vídeo: ${work.title}`}
                        className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#C9A227] hover:bg-[#D9B84A] text-[#06101F] text-xs font-bold shadow-lg cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Assistir</span>
                      </button>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div className="space-y-2.5">
                      {(work.vehicle || work.publishedDate) && (
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                          {work.vehicle && (
                            <span className="text-[#0B192C] uppercase tracking-wider">
                              {work.vehicle}
                            </span>
                          )}
                          {work.publishedDate && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                              {work.publishedDate}
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="font-serif-editorial text-xl font-bold text-[#0B192C] leading-snug group-hover:text-[#0F233F]">
                        {work.title}
                      </h3>

                      {work.description && (
                        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                          {work.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2.5">
                      {hasLink && (
                        <a
                          href={work.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0B192C] hover:bg-[#112642] text-white text-xs font-semibold tracking-wide transition-colors"
                        >
                          <span>Acessar conteúdo original</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#E5C96B]" />
                        </a>
                      )}
                      {hasVideo && !hasLink && (
                        <button
                          type="button"
                          onClick={() => setVideoModal(work)}
                          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#0B192C] hover:bg-[#112642] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-[#E5C96B]" />
                          <span>Acessar conteúdo original</span>
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setVideoModal(null)}
        >
          <div
            className="w-full max-w-4xl bg-[#0B192C] rounded-2xl border border-[#C9A227]/40 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#E5C96B] font-bold">
                  {videoModal.category}
                </p>
                <h3 className="font-serif-editorial text-lg font-bold text-white">
                  {videoModal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModal(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              {getEmbedVideoUrl(videoModal.videoUrl) ? (
                <iframe
                  src={getEmbedVideoUrl(videoModal.videoUrl)}
                  title={videoModal.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={videoModal.videoUrl} controls autoPlay className="w-full h-full" />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
