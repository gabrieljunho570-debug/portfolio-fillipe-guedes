import React, { useState } from 'react';
import { CheckCircle2, Mail, MapPin, Send, Settings } from 'lucide-react';
import { WhatsAppIcon } from './SocialIcons';
import { apiRequest, buildWhatsappUrl } from '../utils/api';

const CONTACT_TOPICS = [
  'Convites para eventos',
  'Parcerias profissionais',
  'Projetos de comunicação',
  'Entrevistas e participações',
  'Dúvidas e solicitações',
];

export default function ContactSection({ socials, onOpenAdmin }) {
  const [form, setForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    subject: CONTACT_TOPICS[0],
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const whatsappUrl = buildWhatsappUrl(socials?.whatsappNumber, socials?.whatsappDefaultText);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      await apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setFeedback({
        type: 'success',
        text: 'Mensagem enviada com sucesso! Fillipe receberá sua solicitação no Painel Administrativo.',
      });
      setForm({
        name: '',
        organization: '',
        email: '',
        phone: '',
        subject: CONTACT_TOPICS[0],
        message: '',
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Não foi possível enviar a mensagem. Tente novamente.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contato" className="py-20 lg:py-28 bg-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Info & Direct Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0B192C]">
                <span className="w-8 h-[2px] bg-[#C9A227]" />
                <span>Contato e Parcerias</span>
              </div>
              <h2 className="font-serif-editorial text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#0B192C] leading-tight">
                Vamos conversar?
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Canal exclusivo para empresas, instituições, organizadores de eventos, agências de comunicação e veículos de imprensa. Selecione o motivo do contato e envie sua proposta ou solicitação.
              </p>
            </div>

            {/* 5 Topic Options */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0B192C]">
                Finalidades de Contato
              </p>
              <div className="flex flex-wrap gap-2">
                {CONTACT_TOPICS.map((topic) => {
                  const selected = form.subject === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, subject: topic }))}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#0B192C] text-[#E5C96B] border border-[#0B192C] shadow-sm'
                          : 'bg-[#F4F6F9] text-slate-700 border border-slate-200 hover:border-[#C9A227]'
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direct WhatsApp Box */}
            <div className="rounded-2xl bg-[#0B192C] text-white p-6 sm:p-7 border border-[#C9A227]/40 space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#25D366] text-[#06101F] flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-[#E5C96B] font-semibold">
                    Atendimento Rápido
                  </p>
                  <h3 className="font-serif-editorial text-xl font-bold">
                    Conversar pelo WhatsApp
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Para convites urgentes, pautas de última hora ou alinhamentos imediatos, inicie uma conversa direta pelo WhatsApp.
              </p>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-[#06101F] font-bold text-sm transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Iniciar conversa pelo WhatsApp</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-[#C9A227]/45 text-[#E5C96B] font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurar número de WhatsApp no Painel Admin</span>
                </button>
              )}
            </div>

            {/* Optional Email / Location when configured */}
            {(socials?.email || socials?.location) && (
              <div className="space-y-3 pt-2">
                {socials.email && (
                  <a
                    href={`mailto:${socials.email}`}
                    className="flex items-center gap-3 text-sm text-slate-700 hover:text-[#0B192C] font-medium"
                  >
                    <Mail className="w-4 h-4 text-[#C9A227]" />
                    <span>{socials.email}</span>
                  </a>
                )}
                {socials.location && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-[#C9A227]" />
                    <span>{socials.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl bg-[#F8F9FB] border border-slate-200 p-6 sm:p-9 shadow-lg space-y-5"
            >
              <div className="border-b border-slate-200 pb-4">
                <h3 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                  Envie sua mensagem
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Preencha os campos abaixo e retornaremos o mais breve possível.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#0B192C] focus:ring-2 focus:ring-[#C9A227]/30 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Empresa ou instituição
                  </label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
                    placeholder="Nome da empresa, órgão ou veículo"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#0B192C] focus:ring-2 focus:ring-[#C9A227]/30 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#0B192C] focus:ring-2 focus:ring-[#C9A227]/30 outline-none text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#0B192C] focus:ring-2 focus:ring-[#C9A227]/30 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Assunto *
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#0B192C] focus:ring-2 focus:ring-[#C9A227]/30 outline-none text-sm transition-all"
                >
                  {CONTACT_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mensagem *
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Descreva os detalhes do evento, projeto, entrevista ou parceria..."
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-[#0B192C] focus:ring-2 focus:ring-[#C9A227]/30 outline-none text-sm transition-all resize-y"
                />
              </div>

              {feedback && (
                <div
                  className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
                    feedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#0B192C] hover:bg-[#112642] disabled:opacity-60 text-white font-bold text-sm tracking-wide shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#E5C96B]" />
                <span>{submitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
