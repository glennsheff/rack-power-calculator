import { createHmac, pbkdf2Sync, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE = 'aifi_session';
const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 32;

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error('AUTH_SECRET is missing or too short (need at least 32 chars)');
  }
  return s;
}

function getPasswordHash(): { salt: Buffer; hash: Buffer } {
  const v = process.env.APP_PASSWORD_HASH;
  if (!v) throw new Error('APP_PASSWORD_HASH is not set');
  const [saltHex, hashHex] = v.split(':');
  if (!saltHex || !hashHex) {
    throw new Error('APP_PASSWORD_HASH must be in <salt-hex>:<hash-hex> format');
  }
  return { salt: Buffer.from(saltHex, 'hex'), hash: Buffer.from(hashHex, 'hex') };
}

export function verifyPassword(password: string): boolean {
  if (typeof password !== 'string' || password.length === 0) return false;
  const { salt, hash } = getPasswordHash();
  const computed = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_KEYLEN, 'sha256');
  if (computed.length !== hash.length) return false;
  return timingSafeEqual(computed, hash);
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function createCookieValue(): string {
  const exp = String(Date.now() + SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

function verifyCookieValue(value: string | undefined): boolean {
  if (!value) return false;
  const dotIdx = value.indexOf('.');
  if (dotIdx <= 0) return false;
  const payload = value.slice(0, dotIdx);
  const sig = value.slice(dotIdx + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = sign(payload);
  const sigBuf = Buffer.from(sig, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length || sigBuf.length === 0) return false;
  return timingSafeEqual(sigBuf, expBuf);
}

export function parseCookie(header: string | string[] | undefined, name: string): string | undefined {
  const raw = Array.isArray(header) ? header.join('; ') : header;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) return part.slice(eq + 1).trim();
  }
  return undefined;
}

export function isAuthedFromCookie(cookieHeader: string | string[] | undefined): boolean {
  return verifyCookieValue(parseCookie(cookieHeader, SESSION_COOKIE));
}

export function setSessionCookieHeader(): string {
  const maxAgeSeconds = Math.floor(SESSION_TTL_MS / 1000);
  return `${SESSION_COOKIE}=${createCookieValue()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
