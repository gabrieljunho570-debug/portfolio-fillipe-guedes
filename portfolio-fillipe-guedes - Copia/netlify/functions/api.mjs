import crypto from 'crypto';
import { getStore } from '@netlify/blobs';
import {
  createInitialData,
  getPublicPortfolio,
  hashPassword,
  verifyPassword,
  signTokenWithSecret,
  verifyTokenWithSecret,
} from '../../server/seed.js';

export const config = {
  path: ['/api/*', '/uploads/*'],
};

const DATA_STORE_NAME = 'fillipe-portfolio-data';
const MEDIA_STORE_NAME = 'fillipe-portfolio-media';
const DB_KEY = 'portfolio.json';
const SECRET_KEY = 'secret.key';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

async function getSecret() {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET;
  }
  const store = getStore(DATA_STORE_NAME);
  let secret = await store.get(SECRET_KEY);
  if (!secret) {
    secret = crypto.randomBytes(48).toString('hex');
    await store.set(SECRET_KEY, secret);
  }
  return secret.trim();
}

async function readDb() {
  const store = getStore(DATA_STORE_NAME);
  const existing = await store.get(DB_KEY, { type: 'json' });
  if (!existing) {
    const initial = createInitialData();
    await store.setJSON(DB_KEY, initial);
    return initial;
  }
  return existing;
}

async function writeDb(data) {
  const store = getStore(DATA_STORE_NAME);
  await store.setJSON(DB_KEY, data);
}

async function removeBlobIfUploaded(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) return;
  const key = url.slice('/uploads/'.length);
  if (!key) return;
  try {
    const mediaStore = getStore(MEDIA_STORE_NAME);
    await mediaStore.delete(key);
  } catch {
    // ignore cleanup errors
  }
}

async function requireAuth(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return null;
  const secret = await getSecret();
  return verifyTokenWithSecret(token, secret);
}

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method.toUpperCase();

    // Serve uploaded media blobs from /uploads/:key
    if (pathname.startsWith('/uploads/') && method === 'GET') {
      const key = decodeURIComponent(pathname.slice('/uploads/'.length));
      if (!key) return new Response('Not found', { status: 404 });
      const mediaStore = getStore(MEDIA_STORE_NAME);
      const entry = await mediaStore.getWithMetadata(key, { type: 'arrayBuffer' });
      if (!entry || !entry.data) {
        return new Response('Media not found', { status: 404 });
      }
      const contentType = entry.metadata?.mimeType || 'application/octet-stream';
      return new Response(entry.data, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Public endpoints
    if (pathname === '/api/health' && method === 'GET') {
      return json({ ok: true, runtime: 'netlify', timestamp: new Date().toISOString() });
    }

    if (pathname === '/api/portfolio' && method === 'GET') {
      const db = await readDb();
      return json(getPublicPortfolio(db));
    }

    if (pathname === '/api/contact' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { name, organization, email, phone, subject, message } = body;
      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return json({ error: 'Nome, e-mail e mensagem são obrigatórios.' }, 400);
      }
      const db = await readDb();
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
      await writeDb(db);
      return json({ ok: true, message: 'Mensagem enviada com sucesso!', id: entry.id }, 201);
    }

    // Auth endpoints
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { username, password } = body;
      const db = await readDb();
      if (
        !username ||
        !password ||
        String(username).trim() !== db.admin.username ||
        !verifyPassword(String(password), db.admin.passwordHash)
      ) {
        return json({ error: 'Usuário ou senha inválidos.' }, 401);
      }
      const secret = await getSecret();
      const token = signTokenWithSecret({ username: db.admin.username, role: 'admin' }, secret);
      return json({ token, user: { username: db.admin.username } });
    }

    // Protected routes below
    const user = await requireAuth(req);
    if (!user) {
      return json({ error: 'Sessão expirada ou não autorizada.' }, 401);
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const db = await readDb();
      return json({ username: db.admin.username });
    }

    if (pathname === '/api/auth/credentials' && method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const { currentPassword, newUsername, newPassword } = body;
      const db = await readDb();
      if (!currentPassword || !verifyPassword(String(currentPassword), db.admin.passwordHash)) {
        return json({ error: 'A senha atual está incorreta.' }, 400);
      }
      if (newUsername && String(newUsername).trim().length >= 3) {
        db.admin.username = String(newUsername).trim();
      }
      if (newPassword) {
        if (String(newPassword).length < 6) {
          return json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' }, 400);
        }
        db.admin.passwordHash = hashPassword(String(newPassword));
      }
      db.admin.updatedAt = new Date().toISOString();
      await writeDb(db);
      const secret = await getSecret();
      const token = signTokenWithSecret({ username: db.admin.username, role: 'admin' }, secret);
      return json({ ok: true, username: db.admin.username, token });
    }

    // Upload media via FormData -> Netlify Blobs
    if (pathname === '/api/admin/upload' && method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return json({ error: 'Nenhum arquivo enviado.' }, 400);
      }
      const mimeType = file.type || 'application/octet-stream';
      if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
        return json({ error: 'Tipo de arquivo não suportado. Envie imagens ou vídeos.' }, 400);
      }
      const buffer = await file.arrayBuffer();
      if (buffer.byteLength > 5 * 1024 * 1024) {
        return json(
          {
            error:
              'Arquivo acima de 5 MB. Na Netlify, envie fotos menores ou use link do YouTube/Vimeo para vídeos longos.',
          },
          400
        );
      }
      const origName = file.name || 'media';
      const dotIdx = origName.lastIndexOf('.');
      const rawExt = dotIdx >= 0 ? origName.slice(dotIdx).toLowerCase() : '';
      const safeExt = /^[a-z0-9.]+$/i.test(rawExt) ? rawExt : '';
      const key = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${safeExt}`;

      const mediaStore = getStore(MEDIA_STORE_NAME);
      await mediaStore.set(key, buffer, {
        metadata: {
          mimeType,
          originalName: origName,
        },
      });

      return json(
        {
          url: `/uploads/${key}`,
          mimeType,
          originalName: origName,
          size: buffer.byteLength,
        },
        201
      );
    }

    // Profile & Socials
    if (pathname === '/api/admin/profile' && method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const db = await readDb();
      const allowedFields = ['name', 'title', 'quote', 'aboutLead', 'aboutText', 'heroPhoto', 'aboutPhoto'];
      const nextProfile = { ...db.profile };
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          if (
            (field === 'heroPhoto' || field === 'aboutPhoto') &&
            db.profile[field] &&
            db.profile[field] !== body[field]
          ) {
            await removeBlobIfUploaded(db.profile[field]);
          }
          nextProfile[field] = String(body[field]).trim();
        }
      }
      db.profile = nextProfile;
      await writeDb(db);
      return json(db.profile);
    }

    if (pathname === '/api/admin/socials' && method === 'PUT') {
      const body = await req.json().catch(() => ({}));
      const db = await readDb();
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
        if (body[field] !== undefined) {
          nextSocials[field] = String(body[field]).trim();
        }
      }
      db.socials = nextSocials;
      await writeDb(db);
      return json(db.socials);
    }

    // Experiences CRUD
    if (pathname === '/api/admin/experiences' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { role, organization, period, category, highlight, description } = body;
      if (!role?.trim() || !organization?.trim()) {
        return json({ error: 'Cargo e empresa/instituição são obrigatórios.' }, 400);
      }
      const db = await readDb();
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
      await writeDb(db);
      return json(item, 201);
    }

    if (pathname.startsWith('/api/admin/experiences/')) {
      const id = pathname.slice('/api/admin/experiences/'.length);
      const db = await readDb();
      if (method === 'PUT') {
        const body = await req.json().catch(() => ({}));
        const idx = (db.experiences || []).findIndex((e) => e.id === id);
        if (idx === -1) return json({ error: 'Experiência não encontrada.' }, 404);
        const current = db.experiences[idx];
        const updated = {
          ...current,
          role: body.role !== undefined ? String(body.role).trim() : current.role,
          organization:
            body.organization !== undefined ? String(body.organization).trim() : current.organization,
          period: body.period !== undefined ? String(body.period).trim() : current.period,
          category: body.category !== undefined ? String(body.category).trim() : current.category,
          highlight: body.highlight !== undefined ? Boolean(body.highlight) : current.highlight,
          description:
            body.description !== undefined ? String(body.description).trim() : current.description,
          order: body.order !== undefined ? Number(body.order) : current.order,
        };
        db.experiences[idx] = updated;
        await writeDb(db);
        return json(updated);
      }
      if (method === 'DELETE') {
        const before = (db.experiences || []).length;
        db.experiences = (db.experiences || []).filter((e) => e.id !== id);
        if (db.experiences.length === before) return json({ error: 'Experiência não encontrada.' }, 404);
        await writeDb(db);
        return json({ ok: true });
      }
    }

    // Awards CRUD
    if (pathname === '/api/admin/awards' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { title, institution, year, category, description, photoUrl, featured } = body;
      if (!title?.trim() || !institution?.trim()) {
        return json({ error: 'Nome do prêmio e instituição são obrigatórios.' }, 400);
      }
      const db = await readDb();
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
      await writeDb(db);
      return json(item, 201);
    }

    if (pathname.startsWith('/api/admin/awards/')) {
      const id = pathname.slice('/api/admin/awards/'.length);
      const db = await readDb();
      if (method === 'PUT') {
        const body = await req.json().catch(() => ({}));
        const idx = (db.awards || []).findIndex((a) => a.id === id);
        if (idx === -1) return json({ error: 'Conquista não encontrada.' }, 404);
        const current = db.awards[idx];
        if (body.photoUrl !== undefined && current.photoUrl && current.photoUrl !== body.photoUrl) {
          await removeBlobIfUploaded(current.photoUrl);
        }
        const updated = {
          ...current,
          title: body.title !== undefined ? String(body.title).trim() : current.title,
          institution:
            body.institution !== undefined ? String(body.institution).trim() : current.institution,
          year: body.year !== undefined ? String(body.year).trim() : current.year,
          category: body.category !== undefined ? String(body.category).trim() : current.category,
          description:
            body.description !== undefined ? String(body.description).trim() : current.description,
          photoUrl: body.photoUrl !== undefined ? String(body.photoUrl).trim() : current.photoUrl,
          featured: body.featured !== undefined ? Boolean(body.featured) : current.featured,
        };
        db.awards[idx] = updated;
        await writeDb(db);
        return json(updated);
      }
      if (method === 'DELETE') {
        const target = (db.awards || []).find((a) => a.id === id);
        if (!target) return json({ error: 'Conquista não encontrada.' }, 404);
        await removeBlobIfUploaded(target.photoUrl);
        db.awards = (db.awards || []).filter((a) => a.id !== id);
        await writeDb(db);
        return json({ ok: true });
      }
    }

    // Gallery CRUD
    if (pathname === '/api/admin/gallery' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { title, category, mediaType, mediaUrl, caption, eventDate } = body;
      if (!title?.trim() || !mediaUrl?.trim()) {
        return json({ error: 'Título e arquivo/link da mídia são obrigatórios.' }, 400);
      }
      const db = await readDb();
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
      await writeDb(db);
      return json(item, 201);
    }

    if (pathname.startsWith('/api/admin/gallery/') && method === 'DELETE') {
      const id = pathname.slice('/api/admin/gallery/'.length);
      const db = await readDb();
      const target = (db.gallery || []).find((g) => g.id === id);
      if (!target) return json({ error: 'Item da galeria não encontrado.' }, 404);
      await removeBlobIfUploaded(target.mediaUrl);
      db.gallery = (db.gallery || []).filter((g) => g.id !== id);
      await writeDb(db);
      return json({ ok: true });
    }

    // Works CRUD
    if (pathname === '/api/admin/works' && method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const { title, category, vehicle, publishedDate, description, imageUrl, linkUrl, videoUrl } = body;
      if (!title?.trim()) {
        return json({ error: 'O título do trabalho é obrigatório.' }, 400);
      }
      const db = await readDb();
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
      await writeDb(db);
      return json(item, 201);
    }

    if (pathname.startsWith('/api/admin/works/')) {
      const id = pathname.slice('/api/admin/works/'.length);
      const db = await readDb();
      if (method === 'PUT') {
        const body = await req.json().catch(() => ({}));
        const idx = (db.works || []).findIndex((w) => w.id === id);
        if (idx === -1) return json({ error: 'Trabalho não encontrado.' }, 404);
        const current = db.works[idx];
        if (body.imageUrl !== undefined && current.imageUrl && current.imageUrl !== body.imageUrl) {
          await removeBlobIfUploaded(current.imageUrl);
        }
        const updated = {
          ...current,
          title: body.title !== undefined ? String(body.title).trim() : current.title,
          category: body.category !== undefined ? String(body.category).trim() : current.category,
          vehicle: body.vehicle !== undefined ? String(body.vehicle).trim() : current.vehicle,
          publishedDate:
            body.publishedDate !== undefined ? String(body.publishedDate).trim() : current.publishedDate,
          description:
            body.description !== undefined ? String(body.description).trim() : current.description,
          imageUrl: body.imageUrl !== undefined ? String(body.imageUrl).trim() : current.imageUrl,
          linkUrl: body.linkUrl !== undefined ? String(body.linkUrl).trim() : current.linkUrl,
          videoUrl: body.videoUrl !== undefined ? String(body.videoUrl).trim() : current.videoUrl,
        };
        db.works[idx] = updated;
        await writeDb(db);
        return json(updated);
      }
      if (method === 'DELETE') {
        const target = (db.works || []).find((w) => w.id === id);
        if (!target) return json({ error: 'Trabalho não encontrado.' }, 404);
        await removeBlobIfUploaded(target.imageUrl);
        await removeBlobIfUploaded(target.videoUrl);
        db.works = (db.works || []).filter((w) => w.id !== id);
        await writeDb(db);
        return json({ ok: true });
      }
    }

    // Messages Management
    if (pathname === '/api/admin/messages' && method === 'GET') {
      const db = await readDb();
      return json(db.messages || []);
    }

    if (pathname.startsWith('/api/admin/messages/')) {
      const id = pathname.slice('/api/admin/messages/'.length);
      const db = await readDb();
      if (method === 'PATCH') {
        const body = await req.json().catch(() => ({}));
        const idx = (db.messages || []).findIndex((m) => m.id === id);
        if (idx === -1) return json({ error: 'Mensagem não encontrada.' }, 404);
        const status = body?.status === 'read' || body?.status === 'replied' ? body.status : 'unread';
        db.messages[idx] = { ...db.messages[idx], status };
        await writeDb(db);
        return json(db.messages[idx]);
      }
      if (method === 'DELETE') {
        const before = (db.messages || []).length;
        db.messages = (db.messages || []).filter((m) => m.id !== id);
        if (db.messages.length === before) return json({ error: 'Mensagem não encontrada.' }, 404);
        await writeDb(db);
        return json({ ok: true });
      }
    }

    return json({ error: 'Rota não encontrada.' }, 404);
  } catch (err) {
    console.error('Netlify API error:', err);
    return json({ error: err?.message || 'Erro interno no servidor.' }, 500);
  }
}
