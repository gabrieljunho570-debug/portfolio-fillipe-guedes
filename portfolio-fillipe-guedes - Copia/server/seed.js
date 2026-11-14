import crypto from 'crypto';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, keyHex] = storedHash.split(':');
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derived = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derived.length) return false;
  return crypto.timingSafeEqual(keyBuf, derived);
}

export function signTokenWithSecret(payload, secret, ttlSeconds = 60 * 60 * 24 * 7) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyTokenWithSecret(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!parsed.exp || parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function createInitialData() {
  return {
    admin: {
      username: 'admin',
      passwordHash: hashPassword('Fillipe@2026'),
      updatedAt: new Date().toISOString(),
    },
    profile: {
      name: 'Fillipe Guedes',
      title: 'Jornalista | Repórter | Comunicação Organizacional',
      quote:
        'Comunicar é transformar informação em conhecimento, dar voz às histórias e aproximar pessoas da realidade.',
      aboutLead:
        'Comunicação com credibilidade, rigor editorial e proximidade com o público.',
      aboutText:
        'Jornalista e especialista em Comunicação Organizacional com atuação voltada para a produção de conteúdo informativo, apuração e edição jornalística, reportagens e participação em coberturas e eventos. Este portfólio reúne sua trajetória profissional, conquistas, registros de eventos e produções jornalísticas.',
      heroPhoto: '',
      aboutPhoto: '',
    },
    socials: {
      instagramHandle: '@fillipetv',
      instagramUrl: 'https://www.instagram.com/fillipetv/',
      linkedinUrl: '',
      whatsappNumber: '',
      whatsappDefaultText:
        'Olá, Fillipe! Acessei seu portfólio digital e gostaria de conversar sobre uma oportunidade profissional.',
      email: '',
      location: '',
    },
    experiences: [
      {
        id: crypto.randomUUID(),
        role: 'Especialista em Comunicação Organizacional',
        organization: 'Comunicação Organizacional',
        period: '',
        category: 'Comunicação Estratégica',
        highlight: true,
        description:
          'Atuação estratégica em comunicação organizacional, alinhamento institucional, relacionamento com públicos de interesse e desenvolvimento de narrativas informativas com credibilidade.',
        order: 1,
      },
      {
        id: crypto.randomUUID(),
        role: 'Editor de Texto',
        organization: 'TV Antares Piauí',
        period: '',
        category: 'Telejornalismo',
        highlight: true,
        description:
          'Edição de textos jornalísticos, organização de pautas, revisão editorial e suporte direto à produção e exibição de conteúdos telejornalísticos na TV Antares Piauí.',
        order: 2,
      },
      {
        id: crypto.randomUUID(),
        role: 'Repórter',
        organization: 'Meio Norte',
        period: '',
        category: 'Jornalismo & Reportagem',
        highlight: true,
        description:
          'Apuração jornalística, realização de entrevistas, produção de matérias e cobertura de acontecimentos relevantes para o público no Meio Norte.',
        order: 3,
      },
      {
        id: crypto.randomUUID(),
        role: 'Participação em Projetos, Coberturas Jornalísticas e Eventos',
        organization: 'Coberturas & Projetos Especiais',
        period: '',
        category: 'Eventos & Coberturas',
        highlight: false,
        description:
          'Participação ativa em projetos de comunicação, coberturas jornalísticas especiais e presença em eventos institucionais e profissionais.',
        order: 4,
      },
    ],
    awards: [],
    gallery: [],
    works: [],
    messages: [],
  };
}

export function getPublicPortfolio(db) {
  return {
    profile: db.profile,
    socials: db.socials,
    experiences: [...(db.experiences || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    awards: [...(db.awards || [])].sort((a, b) => String(b.year || '').localeCompare(String(a.year || ''))),
    gallery: [...(db.gallery || [])].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ),
    works: [...(db.works || [])].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ),
  };
}
