import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  hashPassword,
  verifyPassword,
  signTokenWithSecret,
  verifyTokenWithSecret,
} from './seed.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const SECRET_FILE = path.join(DATA_DIR, 'secret.key');

function getSecret() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SECRET_FILE)) {
    const generated = crypto.randomBytes(48).toString('hex');
    fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
    return generated;
  }
  return fs.readFileSync(SECRET_FILE, 'utf8').trim();
}

export { hashPassword, verifyPassword };

export function signToken(payload, ttlSeconds = 60 * 60 * 24 * 7) {
  return signTokenWithSecret(payload, getSecret(), ttlSeconds);
}

export function verifyToken(token) {
  return verifyTokenWithSecret(token, getSecret());
}
