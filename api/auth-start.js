/**
 * /api/auth-start
 *
 * Step 1 of the OAuth 2.0 flow.
 *
 * Security hardening:
 *  F3 — HMAC-bound state: state = nonce + '.' + HMAC(nonce, SESSION_SECRET)
 *       Only the server can produce a valid state. Even if an attacker plants
 *       an oauth_nonce cookie (e.g. via a sibling subdomain), they cannot forge
 *       the matching URL state without SESSION_SECRET.
 *  F7 — Cookie value is URL-encoded via encodeURIComponent to prevent header
 *       injection if a value ever contains ; , or whitespace.
 *
 * No secrets, tokens or OAuth credentials are ever sent to the browser.
 */

'use strict';

const crypto                      = require('crypto');
const { hmac256, parseKeyBuffer } = require('./_crypto');

// GA4 read-only scope — the minimum required for the GA4 Data API
const OAUTH_SCOPES = 'https://www.googleapis.com/auth/analytics.readonly';

/**
 * Serialise a Set-Cookie header string.
 * F7: values are URL-encoded to prevent cookie header injection.
 *
 * @param {string} name
 * @param {string} value
 * @param {Object} opts
 * @returns {string}
 */
function buildCookie(name, value, opts = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`]; // F7
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

  const clientId      = process.env.GOOGLE_CLIENT_ID;
  const redirectUri   = process.env.GOOGLE_REDIRECT_URI;
  const sessionSecret = process.env.SESSION_SECRET; // Required here for F3
  const encKey        = process.env.TOKEN_ENCRYPTION_KEY;

  if (!clientId || !redirectUri || !sessionSecret || !encKey) {
    console.error('[auth-start] Missing required env vars: GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, SESSION_SECRET or TOKEN_ENCRYPTION_KEY');
    return res.status(500).json({ error: 'OAuth is not configured on this server.' });
  }

  try {
    parseKeyBuffer(encKey);
  } catch (err) {
    console.error('[auth-start] Invalid TOKEN_ENCRYPTION_KEY configuration.');
    return res.status(500).json({ error: 'Server encryption configuration error.' });
  }

  // ── F3: HMAC-bound CSRF state ─────────────────────────────────────────────
  //
  // nonce  : 32 random bytes (hex) — stored in the browser cookie as the anchor
  // state  : nonce + '.' + HMAC-SHA256(nonce, SESSION_SECRET) — sent to Google
  //
  // In auth-callback the server re-derives HMAC(storedNonce, SESSION_SECRET)
  // and reconstructs expectedState, then compares it against the URL state
  // with crypto.timingSafeEqual. An attacker who can plant an oauth_nonce
  // cookie still cannot produce the correct state URL parameter.
  const nonce = crypto.randomBytes(32).toString('hex'); // 64-char hex
  const state = `${nonce}.${hmac256(nonce, sessionSecret)}`; // 64 + 1 + 64 = 129 chars

  const isSecure = redirectUri.startsWith('https://');

  // Only the nonce is stored in the cookie — the HMAC is re-derived server-side
  const nonceCookie = buildCookie('oauth_nonce', nonce, {
    httpOnly: true,
    secure:   isSecure,
    sameSite: 'Lax',   // Must be Lax: Google redirects back with a top-level cross-site GET
    path:     '/',
    maxAge:   600,     // 10 minutes — more than sufficient to complete the consent screen
  });

  // ── Build the Google authorisation URL ────────────────────────────────────
  const authParams = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         OAUTH_SCOPES,
    access_type:   'offline',   // Required to receive a refresh token
    prompt:        'consent',   // Forces Google to always return a refresh token
    state,
  });

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  res.setHeader('Set-Cookie', nonceCookie);
  res.setHeader('Location', authUrl);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.status(302).end();
};
