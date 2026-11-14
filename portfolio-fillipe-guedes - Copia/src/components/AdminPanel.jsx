import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Award,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  Edit3,
  Globe,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Newspaper,
  Plus,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from 'lucide-react';
import { apiRequest, buildWhatsappUrl, getAuthToken, setAuthToken } from '../utils/api';
import { GALLERY_CATEGORIES } from './GallerySection';
import { WORK_CATEGORIES } from './WorksSection';

const TABS = [
  { id: 'profile', label: 'Perfil & Fotos', icon: User },
  { id: 'experiences', label: 'Trajetória', icon: Briefcase },
  { id: 'awards', label: 'Conquistas', icon: Award },
  { id: 'gallery', label: 'Eventos (Fotos/Vídeos)', icon: ImageIcon },
  { id: 'works', label: 'Trabalhos', icon: Newspaper },
  { id: 'socials', label: 'Redes & WhatsApp', icon: Globe },
  { id: 'messages', label: 'Mensagens', icon: Inbox },
  { id: 'security', label: 'Segurança', icon: KeyRound },
];

async function optimizeImageIfNeeded(file) {
  if (!file || !file.type.startsWith('image/') || file.size <= 1.2 * 1024 * 1024) {
    return file;
  }
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 1920;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const safeName = (file.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
          resolve(new File([blob], safeName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        0.86
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

async function uploadMediaFile(file) {
  const prepared = await optimizeImageIfNeeded(file);
  const formData = new FormData();
  formData.append('file', prepared);
  return apiRequest('/api/admin/upload', {
    method: 'POST',
    body: formData,
  });
}

export default function AdminPanel({ portfolio, onRefreshPortfolio, onClose }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState('profile');
  const [toast, setToast] = useState(null);

  // Local editable states
  const [profileForm, setProfileForm] = useState(portfolio?.profile || {});
  const [socialsForm, setSocialsForm] = useState(portfolio?.socials || {});
  const [messages, setMessages] = useState([]);

  // Experience form state
  const [expEditingId, setExpEditingId] = useState(null);
  const [expForm, setExpForm] = useState({
    role: '',
    organization: '',
    period: '',
    category: 'Jornalismo',
    highlight: false,
    description: '',
  });

  // Award form state
  const [awardEditingId, setAwardEditingId] = useState(null);
  const [awardForm, setAwardForm] = useState({
    title: '',
    institution: '',
    year: '',
    category: 'Jornalismo',
    description: '',
    photoUrl: '',
    featured: true,
  });

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: GALLERY_CATEGORIES[0],
    mediaType: 'image',
    mediaUrl: '',
    caption: '',
    eventDate: '',
  });

  // Works form state
  const [workEditingId, setWorkEditingId] = useState(null);
  const [workForm, setWorkForm] = useState({
    title: '',
    category: WORK_CATEGORIES[0],
    vehicle: '',
    publishedDate: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    videoUrl: '',
  });

  // Security form state
  const [secForm, setSecForm] = useState({
    currentPassword: '',
    newUsername: '',
    newPassword: '',
  });

  const [busy, setBusy] = useState(false);

  const showToast = useCallback((text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    setProfileForm(portfolio?.profile || {});
    setSocialsForm(portfolio?.socials || {});
  }, [portfolio]);

  const loadMessages = useCallback(async () => {
    try {
      const list = await apiRequest('/api/admin/messages');
      setMessages(list);
    } catch {
      // ignore if unauthenticated
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setAuthChecked(true);
      return;
    }
    apiRequest('/api/auth/me')
      .then((me) => {
        setUser(me);
        loadMessages();
      })
      .catch(() => {
        setAuthToken('');
        setUser(null);
      })
      .finally(() => setAuthChecked(true));
  }, [loadMessages]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      setAuthToken(res.token);
      setUser(res.user);
      loadMessages();
    } catch (err) {
      setLoginError(err.message || 'Credenciais inválidas.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setAuthToken('');
    setUser(null);
  };

  // Profile handlers
  const handleUploadProfilePhoto = async (field, file) => {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadMediaFile(file);
      const next = { ...profileForm, [field]: uploaded.url };
      setProfileForm(next);
      await apiRequest('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(next),
      });
      await onRefreshPortfolio();
      showToast('Foto atualizada com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(profileForm),
      });
      await onRefreshPortfolio();
      showToast('Perfil e textos atualizados!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Socials handlers
  const handleSaveSocials = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest('/api/admin/socials', {
        method: 'PUT',
        body: JSON.stringify(socialsForm),
      });
      await onRefreshPortfolio();
      showToast('Links de redes sociais e contato atualizados!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Experience handlers
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (expEditingId) {
        await apiRequest(`/api/admin/experiences/${expEditingId}`, {
          method: 'PUT',
          body: JSON.stringify(expForm),
        });
        showToast('Experiência atualizada!');
      } else {
        await apiRequest('/api/admin/experiences', {
          method: 'POST',
          body: JSON.stringify(expForm),
        });
        showToast('Nova experiência adicionada!');
      }
      setExpEditingId(null);
      setExpForm({
        role: '',
        organization: '',
        period: '',
        category: 'Jornalismo',
        highlight: false,
        description: '',
      });
      await onRefreshPortfolio();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/experiences/${id}`, { method: 'DELETE' });
      await onRefreshPortfolio();
      showToast('Experiência removida.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Award handlers
  const handleSaveAward = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (awardEditingId) {
        await apiRequest(`/api/admin/awards/${awardEditingId}`, {
          method: 'PUT',
          body: JSON.stringify(awardForm),
        });
        showToast('Conquista atualizada!');
      } else {
        await apiRequest('/api/admin/awards', {
          method: 'POST',
          body: JSON.stringify(awardForm),
        });
        showToast('Conquista cadastrada!');
      }
      setAwardEditingId(null);
      setAwardForm({
        title: '',
        institution: '',
        year: '',
        category: 'Jornalismo',
        description: '',
        photoUrl: '',
        featured: true,
      });
      await onRefreshPortfolio();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAward = async (id) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/awards/${id}`, { method: 'DELETE' });
      await onRefreshPortfolio();
      showToast('Conquista removida.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Gallery handlers
  const handleAddGallery = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await apiRequest('/api/admin/gallery', {
        method: 'POST',
        body: JSON.stringify(galleryForm),
      });
      setGalleryForm({
        title: '',
        category: GALLERY_CATEGORIES[0],
        mediaType: 'image',
        mediaUrl: '',
        caption: '',
        eventDate: '',
      });
      await onRefreshPortfolio();
      showToast('Mídia adicionada à galeria!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      await onRefreshPortfolio();
      showToast('Item removido da galeria.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Works handlers
  const handleSaveWork = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (workEditingId) {
        await apiRequest(`/api/admin/works/${workEditingId}`, {
          method: 'PUT',
          body: JSON.stringify(workForm),
        });
        showToast('Trabalho atualizado!');
      } else {
        await apiRequest('/api/admin/works', {
          method: 'POST',
          body: JSON.stringify(workForm),
        });
        showToast('Trabalho publicado!');
      }
      setWorkEditingId(null);
      setWorkForm({
        title: '',
        category: WORK_CATEGORIES[0],
        vehicle: '',
        publishedDate: '',
        description: '',
        imageUrl: '',
        linkUrl: '',
        videoUrl: '',
      });
      await onRefreshPortfolio();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteWork = async (id) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/works/${id}`, { method: 'DELETE' });
      await onRefreshPortfolio();
      showToast('Trabalho removido.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  // Message handlers
  const handleMessageStatus = async (id, status) => {
    try {
      await apiRequest(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadMessages();
      showToast('Status da mensagem atualizado.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await apiRequest(`/api/admin/messages/${id}`, { method: 'DELETE' });
      loadMessages();
      showToast('Mensagem excluída.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Security handler
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await apiRequest('/api/auth/credentials', {
        method: 'PUT',
        body: JSON.stringify(secForm),
      });
      setAuthToken(res.token);
      setUser({ username: res.username });
      setSecForm({ currentPassword: '', newUsername: '', newPassword: '' });
      showToast('Credenciais atualizadas com sucesso!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#06101F] flex items-center justify-center text-white">
        <p className="text-sm text-slate-300">Verificando sessão...</p>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 bg-[#06101F]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <div className="w-full max-w-md bg-[#0B192C] border border-[#C9A227]/45 rounded-3xl p-8 shadow-2xl text-white space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao portfólio</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 border border-[#C9A227]/50 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#E5C96B]" />
            </div>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#E5C96B] font-semibold">
              Área Restrita
            </p>
            <h2 className="font-serif-editorial text-2xl font-bold mt-1">
              Painel Administrativo
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Gerencie fotos, trajetória, conquistas, eventos, reportagens, redes sociais e mensagens recebidas.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Usuário
              </label>
              <input
                type="text"
                required
                value={loginForm.username}
                onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="admin"
                className="w-full px-4 py-3 rounded-xl bg-[#06101F] border border-white/15 focus:border-[#C9A227] outline-none text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={loginForm.password}
                onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#06101F] border border-white/15 focus:border-[#C9A227] outline-none text-sm text-white"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 rounded-xl bg-[#C9A227] hover:bg-[#D9B84A] text-[#06101F] font-bold text-sm transition-colors cursor-pointer"
            >
              {loggingIn ? 'Entrando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
            <strong className="text-[#E5C96B]">Acesso inicial padrão:</strong> usuário{' '}
            <code className="px-1.5 py-0.5 rounded bg-black/40 text-white">admin</code> e senha{' '}
            <code className="px-1.5 py-0.5 rounded bg-black/40 text-white">Fillipe@2026</code>.
            Você pode alterar ambos na aba <em>Segurança</em> após entrar.
          </div>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter((m) => m.status === 'unread').length;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F6F9] flex flex-col overflow-hidden">
      {/* Top Admin Header */}
      <header className="bg-[#06101F] text-white border-b border-[#C9A227]/35 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#E5C96B]" />
            <span className="hidden sm:inline">Ver Portfólio</span>
          </button>
          <div>
            <h1 className="font-serif-editorial text-lg font-bold leading-none">
              Painel Administrativo
            </h1>
            <p className="text-[11px] text-[#E5C96B] mt-0.5">
              Conectado como {user.username}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-400/35 text-red-300 hover:bg-red-500/15 text-xs font-medium cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </header>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-[#0B192C] text-white border border-[#C9A227]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-[#E5C96B]" />
          <span>{toast.text}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Tabs */}
        <aside className="lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shrink-0 overflow-x-auto lg:overflow-y-auto">
          <nav className="flex lg:flex-col p-2 sm:p-3 gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'messages') loadMessages();
                  }}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0B192C] text-[#E5C96B] shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.id === 'messages' && unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#C9A227] text-[#06101F] text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                      Fotos Reais do Profissional
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Envie suas fotos reais em alta qualidade para a página inicial e seção Sobre Mim.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Hero Photo */}
                    <div className="p-4 rounded-xl bg-[#F8F9FB] border border-slate-200 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
                        Foto Principal (Início)
                      </p>
                      <div className="aspect-[4/3] rounded-xl bg-[#0B192C] overflow-hidden flex items-center justify-center">
                        {profileForm.heroPhoto ? (
                          <img
                            src={profileForm.heroPhoto}
                            alt="Foto Principal"
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <Camera className="w-10 h-10 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B192C] hover:bg-[#112642] text-white text-xs font-semibold cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#E5C96B]" />
                          <span>{busy ? 'Enviando...' : 'Enviar Foto'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadProfilePhoto('heroPhoto', e.target.files?.[0])}
                          />
                        </label>
                        {profileForm.heroPhoto && (
                          <button
                            type="button"
                            onClick={async () => {
                              const next = { ...profileForm, heroPhoto: '' };
                              setProfileForm(next);
                              await apiRequest('/api/admin/profile', {
                                method: 'PUT',
                                body: JSON.stringify(next),
                              });
                              onRefreshPortfolio();
                            }}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>

                    {/* About Photo */}
                    <div className="p-4 rounded-xl bg-[#F8F9FB] border border-slate-200 space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#0B192C]">
                        Foto Secundária (Sobre Mim - Opcional)
                      </p>
                      <div className="aspect-[4/3] rounded-xl bg-[#0B192C] overflow-hidden flex items-center justify-center">
                        {profileForm.aboutPhoto ? (
                          <img
                            src={profileForm.aboutPhoto}
                            alt="Foto Sobre Mim"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera className="w-10 h-10 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B192C] hover:bg-[#112642] text-white text-xs font-semibold cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-[#E5C96B]" />
                          <span>{busy ? 'Enviando...' : 'Enviar Foto'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadProfilePhoto('aboutPhoto', e.target.files?.[0])}
                          />
                        </label>
                        {profileForm.aboutPhoto && (
                          <button
                            type="button"
                            onClick={async () => {
                              const next = { ...profileForm, aboutPhoto: '' };
                              setProfileForm(next);
                              await apiRequest('/api/admin/profile', {
                                method: 'PUT',
                                body: JSON.stringify(next),
                              });
                              onRefreshPortfolio();
                            }}
                            className="px-3 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 cursor-pointer"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                    Apresentação e Textos
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={profileForm.name || ''}
                        onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Título Profissional
                      </label>
                      <input
                        type="text"
                        value={profileForm.title || ''}
                        onChange={(e) => setProfileForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Frase de Impacto
                    </label>
                    <textarea
                      rows={2}
                      value={profileForm.quote || ''}
                      onChange={(e) => setProfileForm((p) => ({ ...p, quote: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Subtítulo Sobre Mim
                    </label>
                    <input
                      type="text"
                      value={profileForm.aboutLead || ''}
                      onChange={(e) => setProfileForm((p) => ({ ...p, aboutLead: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Texto Completo de Apresentação
                    </label>
                    <textarea
                      rows={4}
                      value={profileForm.aboutText || ''}
                      onChange={(e) => setProfileForm((p) => ({ ...p, aboutText: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="px-6 py-3 rounded-xl bg-[#0B192C] hover:bg-[#112642] text-white text-sm font-bold cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </form>
              </div>
            )}

            {/* TAB: EXPERIENCES */}
            {activeTab === 'experiences' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveExperience}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                      {expEditingId ? 'Editar Experiência' : 'Adicionar Experiência Profissional'}
                    </h2>
                    {expEditingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setExpEditingId(null);
                          setExpForm({
                            role: '',
                            organization: '',
                            period: '',
                            category: 'Jornalismo',
                            highlight: false,
                            description: '',
                          });
                        }}
                        className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Cancelar edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Cargo / Atuação *
                      </label>
                      <input
                        type="text"
                        required
                        value={expForm.role}
                        onChange={(e) => setExpForm((p) => ({ ...p, role: e.target.value }))}
                        placeholder="Ex: Editor de Texto"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Empresa / Veículo / Instituição *
                      </label>
                      <input
                        type="text"
                        required
                        value={expForm.organization}
                        onChange={(e) => setExpForm((p) => ({ ...p, organization: e.target.value }))}
                        placeholder="Ex: TV Antares Piauí"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Período
                      </label>
                      <input
                        type="text"
                        value={expForm.period}
                        onChange={(e) => setExpForm((p) => ({ ...p, period: e.target.value }))}
                        placeholder="Ex: 2022 – Atual"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Área / Categoria
                      </label>
                      <input
                        type="text"
                        value={expForm.category}
                        onChange={(e) => setExpForm((p) => ({ ...p, category: e.target.value }))}
                        placeholder="Ex: Telejornalismo"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Descrição das Atividades
                    </label>
                    <textarea
                      rows={3}
                      value={expForm.description}
                      onChange={(e) => setExpForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={expForm.highlight}
                      onChange={(e) => setExpForm((p) => ({ ...p, highlight: e.target.checked }))}
                    />
                    <span>Marcar como experiência em destaque</span>
                  </label>

                  <div>
                    <button
                      type="submit"
                      disabled={busy}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] text-white text-sm font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#E5C96B]" />
                      <span>{expEditingId ? 'Atualizar Experiência' : 'Adicionar Experiência'}</span>
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {(portfolio?.experiences || []).map((exp) => (
                    <div
                      key={exp.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-bold text-[#0B192C]">{exp.role}</p>
                        <p className="text-xs font-semibold text-[#A68216]">
                          {exp.organization} {exp.period ? `• ${exp.period}` : ''}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-slate-600 mt-1">{exp.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setExpEditingId(exp.id);
                            setExpForm({
                              role: exp.role,
                              organization: exp.organization,
                              period: exp.period || '',
                              category: exp.category || '',
                              highlight: Boolean(exp.highlight),
                              description: exp.description || '',
                            });
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AWARDS */}
            {activeTab === 'awards' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveAward}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                      {awardEditingId ? 'Editar Conquista' : 'Cadastrar Premiação ou Reconhecimento'}
                    </h2>
                    {awardEditingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setAwardEditingId(null);
                          setAwardForm({
                            title: '',
                            institution: '',
                            year: '',
                            category: 'Jornalismo',
                            description: '',
                            photoUrl: '',
                            featured: true,
                          });
                        }}
                        className="text-xs text-slate-500 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Nome do Prêmio / Certificado *
                      </label>
                      <input
                        type="text"
                        required
                        value={awardForm.title}
                        onChange={(e) => setAwardForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Instituição Responsável *
                      </label>
                      <input
                        type="text"
                        required
                        value={awardForm.institution}
                        onChange={(e) => setAwardForm((p) => ({ ...p, institution: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Ano
                      </label>
                      <input
                        type="text"
                        value={awardForm.year}
                        onChange={(e) => setAwardForm((p) => ({ ...p, year: e.target.value }))}
                        placeholder="Ex: 2025"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Categoria
                      </label>
                      <select
                        value={awardForm.category}
                        onChange={(e) => setAwardForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      >
                        <option value="Jornalismo">Jornalismo</option>
                        <option value="Comunicação">Comunicação</option>
                        <option value="Certificado">Certificado</option>
                        <option value="Homenagem">Homenagem</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Foto da Premiação
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#E5C96B]" />
                        <span>Enviar Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const up = await uploadMediaFile(f);
                            setAwardForm((p) => ({ ...p, photoUrl: up.url }));
                            showToast('Foto da premiação carregada!');
                          }}
                        />
                      </label>
                      {awardForm.photoUrl && (
                        <img
                          src={awardForm.photoUrl}
                          alt="Preview"
                          className="w-16 h-12 rounded-lg object-cover border"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Descrição da Conquista
                    </label>
                    <textarea
                      rows={3}
                      value={awardForm.description}
                      onChange={(e) => setAwardForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A227] text-[#06101F] text-sm font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{awardEditingId ? 'Atualizar Conquista' : 'Cadastrar Conquista'}</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(portfolio?.awards || []).map((aw) => (
                    <div
                      key={aw.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-3"
                    >
                      <div className="flex gap-3">
                        {aw.photoUrl && (
                          <img
                            src={aw.photoUrl}
                            alt={aw.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-[#0B192C] text-sm">{aw.title}</p>
                          <p className="text-xs text-[#A68216] font-semibold">
                            {aw.institution} {aw.year ? `• ${aw.year}` : ''}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{aw.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setAwardEditingId(aw.id);
                            setAwardForm(aw);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAward(aw.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: GALLERY */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddGallery}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                    Adicionar Foto ou Vídeo à Galeria
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Título do Registro *
                      </label>
                      <input
                        type="text"
                        required
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Categoria *
                      </label>
                      <select
                        value={galleryForm.category}
                        onChange={(e) => setGalleryForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      >
                        {GALLERY_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Tipo de Mídia
                      </label>
                      <select
                        value={galleryForm.mediaType}
                        onChange={(e) => setGalleryForm((p) => ({ ...p, mediaType: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      >
                        <option value="image">Foto</option>
                        <option value="video">Vídeo (Arquivo ou YouTube/Vimeo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Data / Local do Evento
                      </label>
                      <input
                        type="text"
                        value={galleryForm.eventDate}
                        onChange={(e) => setGalleryForm((p) => ({ ...p, eventDate: e.target.value }))}
                        placeholder="Ex: Outubro de 2025"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase text-slate-600">
                      Arquivo ou URL da Mídia *
                    </label>
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B192C] text-white text-xs font-semibold cursor-pointer">
                        <Upload className="w-4 h-4 text-[#E5C96B]" />
                        <span>Enviar {galleryForm.mediaType === 'video' ? 'Vídeo' : 'Foto'}</span>
                        <input
                          type="file"
                          accept={galleryForm.mediaType === 'video' ? 'video/*' : 'image/*'}
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setBusy(true);
                            try {
                              const up = await uploadMediaFile(f);
                              setGalleryForm((p) => ({ ...p, mediaUrl: up.url }));
                              showToast('Arquivo enviado!');
                            } catch (err) {
                              showToast(err.message, 'error');
                            } finally {
                              setBusy(false);
                            }
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={galleryForm.mediaUrl}
                        onChange={(e) => setGalleryForm((p) => ({ ...p, mediaUrl: e.target.value }))}
                        placeholder={
                          galleryForm.mediaType === 'video'
                            ? 'Ou cole URL do YouTube/Vimeo'
                            : 'Caminho da foto carregada'
                        }
                        className="flex-1 min-w-[220px] px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Legenda
                    </label>
                    <input
                      type="text"
                      value={galleryForm.caption}
                      onChange={(e) => setGalleryForm((p) => ({ ...p, caption: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy || !galleryForm.mediaUrl}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B192C] disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#E5C96B]" />
                    <span>Publicar na Galeria</span>
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(portfolio?.gallery || []).map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <div className="aspect-[4/3] bg-[#0B192C] relative">
                        {item.mediaType === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center text-[#E5C96B]">
                            <Video className="w-10 h-10" />
                          </div>
                        ) : (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteGallery(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] uppercase font-bold text-[#A68216]">
                          {item.category}
                        </p>
                        <p className="text-sm font-bold text-[#0B192C] truncate">{item.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WORKS */}
            {activeTab === 'works' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveWork}
                  className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                      {workEditingId ? 'Editar Trabalho' : 'Publicar Reportagem / Trabalho'}
                    </h2>
                    {workEditingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setWorkEditingId(null);
                          setWorkForm({
                            title: '',
                            category: WORK_CATEGORIES[0],
                            vehicle: '',
                            publishedDate: '',
                            description: '',
                            imageUrl: '',
                            linkUrl: '',
                            videoUrl: '',
                          });
                        }}
                        className="text-xs text-slate-500 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Título da Publicação *
                      </label>
                      <input
                        type="text"
                        required
                        value={workForm.title}
                        onChange={(e) => setWorkForm((p) => ({ ...p, title: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Formato / Categoria *
                      </label>
                      <select
                        value={workForm.category}
                        onChange={(e) => setWorkForm((p) => ({ ...p, category: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      >
                        {WORK_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Veículo / Programa
                      </label>
                      <input
                        type="text"
                        value={workForm.vehicle}
                        onChange={(e) => setWorkForm((p) => ({ ...p, vehicle: e.target.value }))}
                        placeholder="Ex: TV Antares Piauí / Meio Norte"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Data de Publicação
                      </label>
                      <input
                        type="text"
                        value={workForm.publishedDate}
                        onChange={(e) => setWorkForm((p) => ({ ...p, publishedDate: e.target.value }))}
                        placeholder="Ex: 14/11/2026"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Link do Conteúdo Original
                      </label>
                      <input
                        type="url"
                        value={workForm.linkUrl}
                        onChange={(e) => setWorkForm((p) => ({ ...p, linkUrl: e.target.value }))}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Vídeo da Reportagem (YouTube/Vimeo ou Upload)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={workForm.videoUrl}
                          onChange={(e) => setWorkForm((p) => ({ ...p, videoUrl: e.target.value }))}
                          placeholder="URL ou envie arquivo"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                        />
                        <label className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold cursor-pointer">
                          Upload
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              const up = await uploadMediaFile(f);
                              setWorkForm((p) => ({ ...p, videoUrl: up.url }));
                              showToast('Vídeo carregado!');
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Imagem de Capa
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0B192C] text-white text-xs font-semibold cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#E5C96B]" />
                        <span>Enviar Capa</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            const up = await uploadMediaFile(f);
                            setWorkForm((p) => ({ ...p, imageUrl: up.url }));
                            showToast('Imagem de capa enviada!');
                          }}
                        />
                      </label>
                      {workForm.imageUrl && (
                        <img
                          src={workForm.imageUrl}
                          alt="Capa"
                          className="w-20 h-12 rounded-lg object-cover border"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Descrição / Resumo
                    </label>
                    <textarea
                      rows={3}
                      value={workForm.description}
                      onChange={(e) => setWorkForm((p) => ({ ...p, description: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A227] text-[#06101F] text-sm font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{workEditingId ? 'Atualizar Publicação' : 'Publicar Trabalho'}</span>
                  </button>
                </form>

                <div className="space-y-3">
                  {(portfolio?.works || []).map((w) => (
                    <div
                      key={w.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {w.imageUrl && (
                          <img
                            src={w.imageUrl}
                            alt={w.title}
                            className="w-16 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="text-[10px] font-bold uppercase text-[#A68216]">
                            {w.category} {w.vehicle ? `• ${w.vehicle}` : ''}
                          </p>
                          <p className="font-bold text-sm text-[#0B192C]">{w.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setWorkEditingId(w.id);
                            setWorkForm(w);
                          }}
                          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWork(w.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SOCIALS */}
            {activeTab === 'socials' && (
              <form
                onSubmit={handleSaveSocials}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5"
              >
                <div>
                  <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                    Redes Sociais e Canais de Contato
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Atualize os links oficiais que aparecem no cabeçalho, seção de redes, contato e rodapé.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Instagram (@perfil)
                    </label>
                    <input
                      type="text"
                      value={socialsForm.instagramHandle || ''}
                      onChange={(e) =>
                        setSocialsForm((p) => ({ ...p, instagramHandle: e.target.value }))
                      }
                      placeholder="@fillipetv"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      URL do Instagram
                    </label>
                    <input
                      type="url"
                      value={socialsForm.instagramUrl || ''}
                      onChange={(e) =>
                        setSocialsForm((p) => ({ ...p, instagramUrl: e.target.value }))
                      }
                      placeholder="https://www.instagram.com/fillipetv/"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      URL do Perfil Profissional do LinkedIn
                    </label>
                    <input
                      type="url"
                      value={socialsForm.linkedinUrl || ''}
                      onChange={(e) =>
                        setSocialsForm((p) => ({ ...p, linkedinUrl: e.target.value }))
                      }
                      placeholder="https://www.linkedin.com/in/seu-perfil"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Número do WhatsApp (com DDD)
                    </label>
                    <input
                      type="text"
                      value={socialsForm.whatsappNumber || ''}
                      onChange={(e) =>
                        setSocialsForm((p) => ({ ...p, whatsappNumber: e.target.value }))
                      }
                      placeholder="Ex: 86999999999"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      E-mail Profissional
                    </label>
                    <input
                      type="email"
                      value={socialsForm.email || ''}
                      onChange={(e) => setSocialsForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="contato@exemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Mensagem Inicial do WhatsApp
                    </label>
                    <input
                      type="text"
                      value={socialsForm.whatsappDefaultText || ''}
                      onChange={(e) =>
                        setSocialsForm((p) => ({ ...p, whatsappDefaultText: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Cidade / Estado (Opcional)
                    </label>
                    <input
                      type="text"
                      value={socialsForm.location || ''}
                      onChange={(e) => setSocialsForm((p) => ({ ...p, location: e.target.value }))}
                      placeholder="Ex: Teresina - PI"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-3 rounded-xl bg-[#0B192C] text-white text-sm font-bold cursor-pointer"
                >
                  Salvar Redes e Contato
                </button>
              </form>
            )}

            {/* TAB: MESSAGES */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                    Mensagens Recebidas ({messages.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Solicitações enviadas pelo formulário "Vamos conversar?".
                  </p>
                </div>

                {messages.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-500 text-sm">
                    Nenhuma mensagem recebida ainda.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const waReply = msg.phone ? buildWhatsappUrl(msg.phone, `Olá, ${msg.name}!`) : '';
                      return (
                        <div
                          key={msg.id}
                          className={`bg-white rounded-2xl border p-5 space-y-3 ${
                            msg.status === 'unread'
                              ? 'border-[#C9A227] shadow-md'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#0B192C] text-[#E5C96B] text-[10px] font-bold uppercase">
                                  {msg.subject}
                                </span>
                                {msg.status === 'unread' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    Nova
                                  </span>
                                )}
                              </div>
                              <h3 className="font-bold text-[#0B192C] text-base mt-1.5">
                                {msg.name}{' '}
                                {msg.organization && (
                                  <span className="text-slate-500 font-normal">
                                    — {msg.organization}
                                  </span>
                                )}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {msg.email} {msg.phone ? `• ${msg.phone}` : ''} •{' '}
                                {new Date(msg.createdAt).toLocaleString('pt-BR')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {msg.status === 'unread' && (
                                <button
                                  type="button"
                                  onClick={() => handleMessageStatus(msg.id, 'read')}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Marcar como lida</span>
                                </button>
                              )}
                              {waReply && (
                                <a
                                  href={waReply}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 rounded-lg bg-[#25D366]/15 text-emerald-800 text-xs font-semibold"
                                >
                                  WhatsApp
                                </a>
                              )}
                              <a
                                href={`mailto:${msg.email}`}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
                                title="Responder por E-mail"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-slate-700 bg-[#F8F9FB] p-3.5 rounded-xl border border-slate-100 whitespace-pre-line">
                            {msg.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SECURITY */}
            {activeTab === 'security' && (
              <form
                onSubmit={handleUpdateCredentials}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 max-w-xl"
              >
                <div>
                  <h2 className="font-serif-editorial text-2xl font-bold text-[#0B192C]">
                    Segurança do Painel
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Altere seu usuário e senha de acesso administrativo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Senha Atual *
                  </label>
                  <input
                    type="password"
                    required
                    value={secForm.currentPassword}
                    onChange={(e) =>
                      setSecForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Novo Usuário (opcional)
                  </label>
                  <input
                    type="text"
                    value={secForm.newUsername}
                    onChange={(e) => setSecForm((p) => ({ ...p, newUsername: e.target.value }))}
                    placeholder={user.username}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Nova Senha (mínimo 6 caracteres)
                  </label>
                  <input
                    type="password"
                    value={secForm.newPassword}
                    onChange={(e) => setSecForm((p) => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="px-6 py-3 rounded-xl bg-[#0B192C] text-white text-sm font-bold cursor-pointer"
                >
                  Atualizar Credenciais
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
