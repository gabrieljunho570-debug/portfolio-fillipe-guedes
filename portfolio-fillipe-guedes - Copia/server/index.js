import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { ensureStorage, readDb, writeDb, getPublicPortfolio, UPLOADS_DIR } from './db.js';
import { verifyPassword, hashPassword, signToken, verifyToken } from './auth.js';

ensureStorage();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_DIST = path.resolve(process.cwd(), 'app_dist');

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = /^[a-z0-9.]+$/i.test(ext) ? ext : '';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 60 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed =
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/');
    if (!allowed) {
      return cb(new Error('Tipo de arquivo não suportado. Envie imagens ou vídeos.'));
    }
    cb(null, true);
  },
});

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'Sessão expirada ou não autorizada.' });
  }
  req.user = payload;
  next();
}

function removeUploadedFileIfLocal(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const filename = path.basename(url);
  const fullPath = path.join(UPLOADS_DIR, filename);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch {
      // ignore cleanup errors
    }
  }
}

// Public endpoints
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('/api/portfolio', (_req, res) => {
  const db = readDb();
  res.json(getPublicPortfolio(db));
});

app.post('/api/contact', (req, res) => {
  const { name, organization, email, phone, subject, message } = req.body || {};
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
  }
  const db = readDb();
  const entry = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    organization: String(organization || '').trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    subject: String(subject || 'Dúvidas e solicitações').trim(),
    message: String(message).trim(),
    status: 'unread',
    createdAt: new Date().toISOString(),
  };
  db.messages = [entry, ...(db.messages || [])];
  writeDb(db);
  res.status(201).json({ ok: true, message: 'Mensagem enviada com sucesso!', id: entry.id });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const db = readDb();
  if (
    !username ||
    !password ||
    String(username).trim() !== db.admin.username ||
    !verifyPassword(String(password), db.admin.passwordHash)
  ) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  }
  const token = signToken({ username: db.admin.username, role: 'admin' });
  res.json({
    token,
    user: { username: db.admin.username },
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const db = readDb();
  res.json({ username: db.admin.username });
});

app.put('/api/auth/credentials', requireAuth, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body || {};
  const db = readDb();
  if (!currentPassword || !verifyPassword(String(currentPassword), db.admin.passwordHash)) {
    return res.status(400).json({ error: 'A senha atual está incorreta.' });
  }
  if (newUsername && String(newUsername).trim().length >= 3) {
    db.admin.username = String(newUsername).trim();
  }
  if (newPassword) {
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }
    db.admin.passwordHash = hashPassword(String(newPassword));
  }
  db.admin.updatedAt = new Date().toISOString();
  writeDb(db);
  const token = signToken({ username: db.admin.username, role: 'admin' });
  res.json({ ok: true, username: db.admin.username, token });
});

// Upload endpoint
app.post('/api/admin/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname,
    size: req.file.size,
  });
});

// Profile & Socials
app.put('/api/admin/profile', requireAuth, (req, res) => {
  const db = readDb();
  const allowedFields = ['name', 'title', 'quote', 'aboutLead', 'aboutText', 'heroPhoto', 'aboutPhoto'];
  const nextProfile = { ...db.profile };
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if ((field === 'heroPhoto' || field === 'aboutPhoto') && db.profile[field] && db.profile[field] !== req.body[field]) {
        removeUploadedFileIfLocal(db.profile[field]);
      }
      nextProfile[field] = String(req.body[field]).trim();
    }
  }
  db.profile = nextProfile;
  writeDb(db);
  res.json(db.profile);
});

app.put('/api/admin/socials', requireAuth, (req, res) => {
  const db = readDb();
  const allowedFields = [
    'instagramHandle',
    'instagramUrl',
    'linkedinUrl',
    'whatsappNumber',
    'whatsappDefaultText',
    'email',
    'location',
  ];
  const nextSocials = { ...db.socials };
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      nextSocials[field] = String(req.body[field]).trim();
    }
  }
  db.socials = nextSocials;
  writeDb(db);
  res.json(db.socials);
});

// Experiences CRUD
app.post('/api/admin/experiences', requireAuth, (req, res) => {
  const { role, organization, period, category, highlight, description } = req.body || {};
  if (!role?.trim() || !organization?.trim()) {
    return res.status(400).json({ error: 'Cargo e empresa/instituição são obrigatórios.' });
  }
  const db = readDb();
  const maxOrder = (db.experiences || []).reduce((max, item) => Math.max(max, item.order || 0), 0);
  const item = {
    id: crypto.randomUUID(),
    role: String(role).trim(),
    organization: String(organization).trim(),
    period: String(period || '').trim(),
    category: String(category || 'Jornalismo').trim(),
    highlight: Boolean(highlight),
    description: String(description || '').trim(),
    order: maxOrder + 1,
  };
  db.experiences = [...(db.experiences || []), item];
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/admin/experiences/:id', requireAuth, (req, res) => {
  const db = readDb();
  const idx = (db.experiences || []).findIndex((e) => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Experiência não encontrada.' });
  const current = db.experiences[idx];
  const updated = {
    ...current,
    role: req.body.role !== undefined ? String(req.body.role).trim() : current.role,
    organization:
      req.body.organization !== undefined ? String(req.body.organization).trim() : current.organization,
    period: req.body.period !== undefined ? String(req.body.period).trim() : current.period,
    category: req.body.category !== undefined ? String(req.body.category).trim() : current.category,
    highlight: req.body.highlight !== undefined ? Boolean(req.body.highlight) : current.highlight,
    description:
      req.body.description !== undefined ? String(req.body.description).trim() : current.description,
    order: req.body.order !== undefined ? Number(req.body.order) : current.order,
  };
  db.experiences[idx] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/experiences/:id', requireAuth, (req, res) => {
  const db = readDb();
  const before = (db.experiences || []).length;
  db.experiences = (db.experiences || []).filter((e) => e.id !== req.params.id);
  if (db.experiences.length === before) return res.status(404).json({ error: 'Experiência não encontrada.' });
  writeDb(db);
  res.json({ ok: true });
});

// Awards CRUD
app.post('/api/admin/awards', requireAuth, (req, res) => {
  const { title, institution, year, category, description, photoUrl, featured } = req.body || {};
  if (!title?.trim() || !institution?.trim()) {
    return res.status(400).json({ error: 'Nome do prêmio e instituição são obrigatórios.' });
  }
  const db = readDb();
  const item = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    institution: String(institution).trim(),
    year: String(year || '').trim(),
    category: String(category || 'Jornalismo').trim(),
    description: String(description || '').trim(),
    photoUrl: String(photoUrl || '').trim(),
    featured: featured !== undefined ? Boolean(featured) : true,
    createdAt: new Date().toISOString(),
  };
  db.awards = [item, ...(db.awards || [])];
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/admin/awards/:id', requireAuth, (req, res) => {
  const db = readDb();
  const idx = (db.awards || []).findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Conquista não encontrada.' });
  const current = db.awards[idx];
  if (req.body.photoUrl !== undefined && current.photoUrl && current.photoUrl !== req.body.photoUrl) {
    removeUploadedFileIfLocal(current.photoUrl);
  }
  const updated = {
    ...current,
    title: req.body.title !== undefined ? String(req.body.title).trim() : current.title,
    institution:
      req.body.institution !== undefined ? String(req.body.institution).trim() : current.institution,
    year: req.body.year !== undefined ? String(req.body.year).trim() : current.year,
    category: req.body.category !== undefined ? String(req.body.category).trim() : current.category,
    description:
      req.body.description !== undefined ? String(req.body.description).trim() : current.description,
    photoUrl: req.body.photoUrl !== undefined ? String(req.body.photoUrl).trim() : current.photoUrl,
    featured: req.body.featured !== undefined ? Boolean(req.body.featured) : current.featured,
  };
  db.awards[idx] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/awards/:id', requireAuth, (req, res) => {
  const db = readDb();
  const target = (db.awards || []).find((a) => a.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Conquista não encontrada.' });
  removeUploadedFileIfLocal(target.photoUrl);
  db.awards = (db.awards || []).filter((a) => a.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

// Gallery CRUD
app.post('/api/admin/gallery', requireAuth, (req, res) => {
  const { title, category, mediaType, mediaUrl, caption, eventDate } = req.body || {};
  if (!title?.trim() || !mediaUrl?.trim()) {
    return res.status(400).json({ error: 'Título e arquivo/link da mídia são obrigatórios.' });
  }
  const db = readDb();
  const item = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    category: String(category || 'Eventos institucionais').trim(),
    mediaType: mediaType === 'video' ? 'video' : 'image',
    mediaUrl: String(mediaUrl).trim(),
    caption: String(caption || '').trim(),
    eventDate: String(eventDate || '').trim(),
    createdAt: new Date().toISOString(),
  };
  db.gallery = [item, ...(db.gallery || [])];
  writeDb(db);
  res.status(201).json(item);
});

app.delete('/api/admin/gallery/:id', requireAuth, (req, res) => {
  const db = readDb();
  const target = (db.gallery || []).find((g) => g.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Item da galeria não encontrado.' });
  removeUploadedFileIfLocal(target.mediaUrl);
  db.gallery = (db.gallery || []).filter((g) => g.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

// Works CRUD
app.post('/api/admin/works', requireAuth, (req, res) => {
  const { title, category, vehicle, publishedDate, description, imageUrl, linkUrl, videoUrl } = req.body || {};
  if (!title?.trim()) {
    return res.status(400).json({ error: 'O título do trabalho é obrigatório.' });
  }
  const db = readDb();
  const item = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    category: String(category || 'Reportagens').trim(),
    vehicle: String(vehicle || '').trim(),
    publishedDate: String(publishedDate || '').trim(),
    description: String(description || '').trim(),
    imageUrl: String(imageUrl || '').trim(),
    linkUrl: String(linkUrl || '').trim(),
    videoUrl: String(videoUrl || '').trim(),
    createdAt: new Date().toISOString(),
  };
  db.works = [item, ...(db.works || [])];
  writeDb(db);
  res.status(201).json(item);
});

app.put('/api/admin/works/:id', requireAuth, (req, res) => {
  const db = readDb();
  const idx = (db.works || []).findIndex((w) => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Trabalho não encontrado.' });
  const current = db.works[idx];
  if (req.body.imageUrl !== undefined && current.imageUrl && current.imageUrl !== req.body.imageUrl) {
    removeUploadedFileIfLocal(current.imageUrl);
  }
  const updated = {
    ...current,
    title: req.body.title !== undefined ? String(req.body.title).trim() : current.title,
    category: req.body.category !== undefined ? String(req.body.category).trim() : current.category,
    vehicle: req.body.vehicle !== undefined ? String(req.body.vehicle).trim() : current.vehicle,
    publishedDate:
      req.body.publishedDate !== undefined ? String(req.body.publishedDate).trim() : current.publishedDate,
    description:
      req.body.description !== undefined ? String(req.body.description).trim() : current.description,
    imageUrl: req.body.imageUrl !== undefined ? String(req.body.imageUrl).trim() : current.imageUrl,
    linkUrl: req.body.linkUrl !== undefined ? String(req.body.linkUrl).trim() : current.linkUrl,
    videoUrl: req.body.videoUrl !== undefined ? String(req.body.videoUrl).trim() : current.videoUrl,
  };
  db.works[idx] = updated;
  writeDb(db);
  res.json(updated);
});

app.delete('/api/admin/works/:id', requireAuth, (req, res) => {
  const db = readDb();
  const target = (db.works || []).find((w) => w.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Trabalho não encontrado.' });
  removeUploadedFileIfLocal(target.imageUrl);
  removeUploadedFileIfLocal(target.videoUrl);
  db.works = (db.works || []).filter((w) => w.id !== req.params.id);
  writeDb(db);
  res.json({ ok: true });
});

// Messages Management
app.get('/api/admin/messages', requireAuth, (_req, res) => {
  const db = readDb();
  res.json(db.messages || []);
});

app.patch('/api/admin/messages/:id', requireAuth, (req, res) => {
  const db = readDb();
  const idx = (db.messages || []).findIndex((m) => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Mensagem não encontrada.' });
  const status = req.body?.status === 'read' || req.body?.status === 'replied' ? req.body.status : 'unread';
  db.messages[idx] = { ...db.messages[idx], status };
  writeDb(db);
  res.json(db.messages[idx]);
});

app.delete('/api/admin/messages/:id', requireAuth, (req, res) => {
  const db = readDb();
  const before = (db.messages || []).length;
  db.messages = (db.messages || []).filter((m) => m.id !== req.params.id);
  if (db.messages.length === before) return res.status(404).json({ error: 'Mensagem não encontrada.' });
  writeDb(db);
  res.json({ ok: true });
});

// Error handler for multer / json
app.use((err, _req, res, _next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Erro ao processar requisição.' });
  }
});

// Serve built React frontend
if (fs.existsSync(APP_DIST)) {
  app.use(express.static(APP_DIST));
  app.get(/^\/(?!api|uploads).*/, (_req, res) => {
    res.sendFile(path.join(APP_DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fillipe Guedes Portfolio server listening on http://0.0.0.0:${PORT}`);
});
