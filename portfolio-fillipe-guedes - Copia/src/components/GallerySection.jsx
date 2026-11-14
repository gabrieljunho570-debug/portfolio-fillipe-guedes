import React, { useState, useEffect, useCallback } from 'react';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Play,
  PlusCircle,
  Video,
  X,
} from 'lucide-react';
import { getEmbedVideoUrl } from '../utils/api';

export const GALLERY_CATEGORIES = [
  'Eventos institucionais',
  'Coberturas jornalísticas',
  'Entrevistas',
  'Premiações',
  'Bastidores da profissão',
  'Participações especiais',
];

export default function GallerySection({ gallery = [], onOpenAdmin }) {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filtered =
    activeCategory === 'Todos'
      ? gallery
      : gallery.filter((item) => item.category === activeCategory);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, closeLightbox, goPrev, goNext]);

  const activeMedia = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  return (
    <section id="eventos" className="py-20 lg:py-28 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0B192C]">
              <span className="w-8 h-[2px] bg-[#C9A227]" />
              <span>Galeria Visual</span>
            </div>
            <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#0B192C] leading-tight">
              Eventos, coberturas e bastidores da profissão.
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Registros fotográficos e audiovisuais de coberturas jornalísticas, entrevistas, premiações e participações institucionais. Clique em qualquer item para ampliar em tela cheia.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {['Todos', ...GALLERY_CATEGORIES].map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setLightboxIndex(null);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0B192C] text-[#E5C96B] border border-[#0B192C] shadow-md'
                    : 'bg-[#F4F6F9] text-slate-700 border border-slate-200 hover:border-[#C9A227] hover:text-[#0B192C]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid or Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-[#F8F9FB] border border-dashed border-slate-300 p-10 sm:p-14 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#0B192C] text-[#E5C96B] flex items-center justify-center mx-auto mb-5 shadow-md">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="font-serif-editorial text-2xl font-bold text-[#0B192C] mb-2">
              {activeCategory === 'Todos'
                ? 'Galeria pronta para fotos e vídeos reais'
                : `Nenhum registro em "${activeCategory}" ainda`}
            </h3>
            <p className="text-sm text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
              Envie suas fotografias e vídeos reais de eventos institucionais, coberturas, entrevistas, premiações e bastidores diretamente pelo Painel Administrativo.
            </p>
            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B192C] hover:bg-[#112642] text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#E5C96B]" />
              <span>Adicionar Fotos e Vídeos</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, idx) => {
              const isVideo = item.mediaType === 'video';
              const embedUrl = isVideo ? getEmbedVideoUrl(item.mediaUrl) : null;
              return (
                <article
                  key={item.id}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative rounded-2xl overflow-hidden bg-[#0B192C] border border-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-[4/3]"
                >
                  {isVideo ? (
                    embedUrl ? (
                      <div className="w-full h-full bg-[#06101F] flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#C9A227] text-[#06101F] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-6 h-6 ml-0.5" />
                        </div>
                        <p className="text-xs uppercase tracking-widest text-[#E5C96B] font-semibold">
                          Vídeo Externo
                        </p>
                      </div>
                    ) : (
                      <video
                        src={item.mediaUrl}
                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                        muted
                        playsInline
                      />
                    )
                  ) : (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06101F] via-[#06101F]/35 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#06101F]/80 border border-[#C9A227]/45 text-[10px] font-semibold uppercase tracking-wider text-[#E5C96B] backdrop-blur-sm">
                      {item.category}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center group-hover:bg-[#C9A227] group-hover:text-[#06101F] transition-colors">
                      {isVideo ? <Video className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </span>
                  </div>

                  {/* Bottom Caption */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    {item.eventDate && (
                      <p className="text-[11px] font-medium text-[#E5C96B] mb-0.5">
                        {item.eventDate}
                      </p>
                    )}
                    <h3 className="font-serif-editorial text-lg font-bold leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    {item.caption && (
                      <p className="text-xs text-slate-300 mt-1 line-clamp-1">{item.caption}</p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-screen Lightbox */}
      {activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white max-w-6xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-[#C9A227] text-[#06101F] text-xs font-bold uppercase tracking-wider">
                {activeMedia.category}
              </span>
              <span className="text-xs text-slate-400">
                {lightboxIndex + 1} / {filtered.length}
              </span>
            </div>
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Fechar visualização"
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Media Stage */}
          <div
            className="relative flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-4"
            onClick={(e) => e.stopPropagation()}
          >
            {filtered.length > 1 && (
              <button
                type="button"
                onClick={goPrev}
                aria-label="Anterior"
                className="absolute left-0 sm:left-2 z-10 p-3 rounded-full bg-black/60 hover:bg-[#C9A227] text-white hover:text-[#06101F] border border-white/15 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {activeMedia.mediaType === 'video' ? (
              getEmbedVideoUrl(activeMedia.mediaUrl) ? (
                <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
                  <iframe
                    src={getEmbedVideoUrl(activeMedia.mediaUrl)}
                    title={activeMedia.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={activeMedia.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[75vh] max-w-full rounded-xl shadow-2xl"
                />
              )
            ) : (
              <img
                src={activeMedia.mediaUrl}
                alt={activeMedia.title}
                className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl"
              />
            )}

            {filtered.length > 1 && (
              <button
                type="button"
                onClick={goNext}
                aria-label="Próximo"
                className="absolute right-0 sm:right-2 z-10 p-3 rounded-full bg-black/60 hover:bg-[#C9A227] text-white hover:text-[#06101F] border border-white/15 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Caption Footer */}
          <div
            className="max-w-3xl w-full mx-auto text-center text-white space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif-editorial text-xl font-bold">{activeMedia.title}</h3>
            {activeMedia.caption && (
              <p className="text-sm text-slate-300">{activeMedia.caption}</p>
            )}
            {activeMedia.eventDate && (
              <p className="text-xs text-[#E5C96B]">{activeMedia.eventDate}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
