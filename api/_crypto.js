/**
 * api/_crypto.js
 *
 * Private shared cryptographic helpers for the GA4 dashboard OAuth flow.
 * Vercel does NOT expose files whose names begin with _ as HTTP endpoints.
 *
 * Used by:
 *   auth-start.js    — hmac256 (HMAC-bound state, F3)
 *   auth-callback.js — encryptToken + hmac256
 *   analytics.js     — decryptToken (Phase 2)
 */

'use strict';

const crypto = require('crypto');

const AES_ALGO  = 'aes-256-gcm';
const IV_BYTES  = 12;   // 96-bit IV — recommended for AES-GCM
const TAG_BYTES = 16;   // GCM default authentication-tag length (128 bits)

// ── Key validation ──────────────────────────────────────────────────────────

/**
 * Parse and validate a 32-byte AES key stored as a 64-char hex string.
 * Throws with a descriptive message on misconfiguration so problems surface
 * at startup rather than silently at decryption time.
 *
 * @param {string} keyHex  TOKEN_ENCRYPTION_KEY environment variable value
 * @returns {Buffer}        32-byte key buffer
 */
function parseKeyBuffer(keyHex) {
  if (
    typeof keyHex !== 'string' ||
    keyHex.length !== 64 ||
    !/^[0-9a-fA-F]{64}$/.test(keyHex)
  ) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be a 64-character lowercase hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(keyHex, 'hex');
}

// ── AES-256-GCM encryption / decryption ────────────────────────────────────

/**
 * Encrypt a plaintext string with AES-256-GCM using a fresh random IV.
 *
 * Returns a cookie-safe string:
 *   <iv_hex>:<ciphertext_hex>:<authtag_hex>
 *
 * All three segments are hex — no special characters, no padding ambiguity.
 * The GCM auth tag provides both confidentiality and integrity; a tampered
 * ciphertext will throw on decryption.
 *
 * @param {string} plaintext   Value to encrypt (e.g. Google refresh token)
 * @param {string} keyHex      TOKEN_ENCRYPTION_KEY (64-char hex)
 * @returns {string}
 */
function encryptToken(plaintext, keyHex) {
  const key    = parseKeyBuffer(keyHex);
  const iv     = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(AES_ALGO, key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag(); // 16-byte GCM tag

  return [
    iv.toString('hex'),
    ciphertext.toString('hex'),
    authTag.toString('hex'),
  ].join(':');
}

/**
 * Decrypt a value produced by encryptToken.
 *
 * The GCM auth tag is verified automatically by Node's crypto module.
 * Any tampering with IV, ciphertext or auth tag causes an explicit throw
 * ('Unsupported state or unable to authenticate data'), which the caller
 * must handle — never silently ignore.
 *
 * @param {string} encoded  "<iv_hex>:<ciphertext_hex>:<authtag_hex>"
 * @param {string} keyHex   TOKEN_ENCRYPTION_KEY (64-char hex)
 * @returns {string}        Original plaintext
 */
function decryptToken(encoded, keyHex) {
  const parts = (encoded || '').split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted token: expected <iv>:<ct>:<tag>.');
  }

  const [ivHex, ctHex, tagHex] = parts;
  const key     = parseKeyBuffer(keyHex);
  const iv      = Buffer.from(ivHex,  'hex');
  const ct      = Buffer.from(ctHex,  'hex');
  const authTag = Buffer.from(tagHex, 'hex');

  if (iv.length !== IV_BYTES) {
    throw new Error(`Invalid IV length: expected ${IV_BYTES}, got ${iv.length}.`);
  }
  if (authTag.length !== TAG_BYTES) {
    throw new Error(`Invalid auth-tag length: expected ${TAG_BYTES}, got ${authTag.length}.`);
  }

  const decipher = crypto.createDecipheriv(AES_ALGO, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(ct),
    decipher.final(),     // throws if auth tag doesn't match
  ]).toString('utf8');
}

// ── HMAC helper ─────────────────────────────────────────────────────────────

/**
 * Compute HMAC-SHA256 of value keyed by secret.
 * Returns a 64-character lowercase hex string.
 *
 * @param {string} value
 * @param {string} secret  SESSION_SECRET
 * @returns {string}
 */
function hmac256(value, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('hex');
}

// ── Session payload helpers with explicit expiry ───────────────────────────

const SESSION_TTL_SECONDS = 2592000; // 30 days
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;

/**
 * Creates a structured session payload with explicit issuance and expiry timestamps.
 * @param {string} token        Google refresh token
 * @param {number} [customTtlMs] Optional custom TTL in ms
 * @returns {{ token: string, iat: number, exp: number }}
 */
function createSessionPayload(token, customTtlMs) {
  const now = Date.now();
  const ttl = typeof customTtlMs === 'number' ? customTtlMs : SESSION_TTL_MS;
  return {
    token,
    iat: now,
    exp: now + ttl
  };
}

/**
 * Encrypts a structured session object using AES-256-GCM.
 * @param {{ token: string, iat?: number, exp?: number } | string} payload
 * @param {string} keyHex
 * @returns {string}
 */
function encryptSession(payload, keyHex) {
  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return encryptToken(raw, keyHex);
}

/**
 * Decrypts a session token and cryptographically validates its expiration timestamp.
 * Throws on tampering, invalid formatting, or if Date.now() > exp.
 * @param {string} encoded
 * @param {string} keyHex
 * @returns {{ token: string, iat: number, exp: number }}
 */
function decryptSession(encoded, keyHex) {
  const plaintext = decryptToken(encoded, keyHex);
  let payload;
  try {
    payload = JSON.parse(plaintext);
  } catch {
    // Graceful fallback for legacy string-only tokens
    return { token: plaintext, iat: 0, exp: Infinity, isLegacy: true };
  }

  if (!payload || typeof payload !== 'object' || !payload.token) {
    throw new Error('Malformed session payload: missing token field.');
  }

  if (typeof payload.exp === 'number' && Date.now() > payload.exp) {
    const err = new Error('Session has expired.');
    err.code = 'ERR_SESSION_EXPIRED';
    err.expired = true;
    throw err;
  }

  return payload;
}

module.exports = {
  encryptToken,
  decryptToken,
  encryptSession,
  decryptSession,
  createSessionPayload,
  hmac256,
  parseKeyBuffer,
  SESSION_TTL_SECONDS,
  SESSION_TTL_MS
};
