import fs from 'fs';
import path from 'path';
import { createInitialData, getPublicPortfolio } from './seed.js';

export const DATA_DIR = path.resolve(process.cwd(), 'data');
export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'portfolio.json');

export function ensureStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const initial = createInitialData();
    writeDb(initial);
    return initial;
  }
  return readDb();
}

export function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return ensureStorage();
  }
  const raw = fs.readFileSync(DB_FILE, 'utf8');
  return JSON.parse(raw);
}

export function writeDb(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpFile, DB_FILE);
}

export { getPublicPortfolio };
