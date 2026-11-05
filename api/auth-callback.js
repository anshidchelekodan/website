/**
 * /api/auth-callback
 *
 * Step 2 of the OAuth 2.0 flow — Google redirects back here after user consent.
 *
 * Security hardening addressed:
 *  F1 — Refresh token encrypted using AES-256-GCM with fresh 12-byte IV (via _crypto.js).
 *       Plaintext is never stored in cookies, logs, or response bodies.
 *  F2 — OAuth error parameter sanitized against a strict allowlist before logging/rendering.
 *  F3 — CSRF state validated against server-bound HMAC(nonce, SESSION_SECRET) + timingSafeEqual.
 *  F4 — Request Host header and redirect URI validated against GOOGLE_REDIRECT_URI origin.
 *  F7 — Cookie values URL-encoded via encodeURIComponent to prevent cookie injection.
 */

'use strict';

const crypto = require('crypto');
const { encryptSession, createSessionPayload, hmac256, parseKeyBuffer, SESSION_TTL_SECONDS } = require('./_crypto');

// Strict allowlist of known Google OAuth error codes (RFC 6749 / Google OAuth 2.0)
const KNOWN_OAUTH_ERRORS = new Set([
  'access_denied',
  'invalid_request',
  'unauthorized_client',
  'unsupported_response_type',
  'invalid_scope',
  'server_error',
  'temporarily_unavailable',
  'interaction_required'
]);

/**
 * Parse Cookie header safely.
 * @param {string|undefined} header
 * @returns {Record<string, string>}
 */
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx < 1) continue;
    const key = pair.slice(0, idx).trim();
    const rawVal = pair.slice(idx + 1).trim();
    try {
      out[key] = decodeURIComponent(rawVal);
    } catch {
      out[key] = rawVal;
    }
  }
  return out;
}

/**
 * Serialise a Set-Cookie string.
 * F7: values URL-encoded.
 */
function buildCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.httpOnly)             parts.push('HttpOnly');
  if (opts.secure)               parts.push('Secure');
  if (opts.sameSite)             parts.push(`SameSite=${opts.sameSite}`);
  if (opts.path)                 parts.push(`Path=${opts.path}`);
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  return parts.join('; ');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  // ── Environment variable validation ───────────────────────────────────────
  const clientId     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri  = process.env.GOOGLE_REDIRECT_URI;
  const sessionSecret = process.env.SESSION_SECRET;
  const encKey       = process.env.TOKEN_ENCRYPTION_KEY;

  if (!clientId || !clientSecret || !redirectUri || !sessionSecret || !encKey) {
    console.error('[auth-callback] Missing required environment variables.');
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  try {
    parseKeyBuffer(encKey);
  } catch (err) {
    console.error('[auth-callback] Invalid TOKEN_ENCRYPTION_KEY configuration.');
    return res.status(500).json({ error: 'Server encryption configuration error.' });
  }

  // ── F4: Validate incoming Host vs configured GOOGLE_REDIRECT_URI ───────────
  let expectedUrl;
  try {
    expectedUrl = new URL(redirectUri);
  } catch {
    console.error('[auth-callback] Malformed GOOGLE_REDIRECT_URI configured.');
    return res.status(500).json({ error: 'Server redirect configuration error.' });
  }

  const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
  if (!hostHeader || hostHeader.toLowerCase() !== expectedUrl.host.toLowerCase()) {
    console.warn('[auth-callback] Host header mismatch against configured redirect URI.');
    return res.status(403).json({ error: 'Host mismatch. Request rejected.' });
  }

  const { code, state, error: oauthError } = req.query || {};

  // ── F2: Sanitize and handle OAuth error response ───────────────────────────
  if (oauthError) {
    const rawError = String(oauthError);
    const sanitizedError = KNOWN_OAUTH_ERRORS.has(rawError) ? rawError : 'unspecified_oauth_error';
    console.warn(`[auth-callback] OAuth consent returned error: ${sanitizedError}`);
    return res.status(400).send(
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Authentication Failed</title></head>' +
      '<body><p>Google authentication could not be completed.</p>' +
      '<p><a href="/">Return to Home</a></p></body></html>'
    );
  }

  // ── Validate presence of code and state ───────────────────────────────────
  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid OAuth parameters.' });
  }

  // ── F3: Validate HMAC-bound CSRF state against session nonce ──────────────
  const cookies     = parseCookies(req.headers.cookie);
  const storedNonce = cookies['oauth_nonce'];

  const stateParts = typeof state === 'string' ? state.split('.') : [];
  if (stateParts.length !== 2 || !/^[0-9a-fA-F]{64}$/.test(stateParts[0]) || !/^[0-9a-fA-F]{64}$/.test(stateParts[1])) {
    console.warn('[auth-callback] Malformed state parameter.');
    return res.status(400).json({ error: 'Malformed state parameter.' });
  }

  const [stateNonce, stateHmac] = stateParts;
  const expectedHmac = hmac256(stateNonce, sessionSecret);
  const hmacBuf = Buffer.from(stateHmac, 'utf8');
  const expectedHmacBuf = Buffer.from(expectedHmac, 'utf8');

  const hmacValid =
    hmacBuf.length === expectedHmacBuf.length &&
    crypto.timingSafeEqual(hmacBuf, expectedHmacBuf);

  if (!hmacValid) {
    console.warn('[auth-callback] State HMAC verification failed.');
    return res.status(403).json({ error: 'Invalid state parameter. Possible CSRF attempt.' });
  }

  if (storedNonce) {
    if (typeof storedNonce !== 'string' || storedNonce !== stateNonce) {
      console.warn('[auth-callback] Nonce mismatch between cookie and state parameter.');
      return res.status(403).json({ error: 'Session state mismatch. Possible CSRF attempt.' });
    }
  }

  // ── Server-side token exchange ────────────────────────────────────────────
  let tokenData;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code'
      })
    });

    if (!tokenRes.ok) {
      console.error('[auth-callback] Token exchange returned status:', tokenRes.status);
      return res.status(502).json({ error: 'Token exchange failed with authentication provider.' });
    }

    tokenData = await tokenRes.json();
  } catch (err) {
    console.error('[auth-callback] Network error reaching token provider.');
    return res.status(502).json({ error: 'Unable to reach authentication provider.' });
  }

  if (!tokenData || !tokenData.refresh_token) {
    console.warn('[auth-callback] Token response did not include a refresh token.');
    return res.status(502).json({
      error: 'Authentication provider did not provide a refresh token.',
      detail: 'Ensure offline access and consent prompt are properly configured.'
    });
  }

  // ── F1: Encrypt structured session payload with AES-256-GCM ───────────────
  let encryptedToken;
  try {
    const sessionPayload = createSessionPayload(tokenData.refresh_token);
    encryptedToken = encryptSession(sessionPayload, encKey);
  } catch (err) {
    console.error('[auth-callback] Encryption failure during session creation.');
    return res.status(500).json({ error: 'Failed to securely encrypt session data.' });
  }

  const isSecure = redirectUri.startsWith('https://');

  const sessionCookie = buildCookie('ga_session', encryptedToken, {
    httpOnly: true,
    secure:   isSecure,
    sameSite: 'Lax',
    path:     '/',
    maxAge:   SESSION_TTL_SECONDS // 30 days aligned with payload.exp
  });

  // Clear one-time nonce cookie
  const clearNonceCookie = buildCookie('oauth_nonce', '', {
    httpOnly: true,
    secure:   isSecure,
    sameSite: 'Lax',
    path:     '/',
    maxAge:   0
  });

  res.setHeader('Set-Cookie', [sessionCookie, clearNonceCookie]);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Location', '/dashboard/');
  return res.status(302).end();
};
