/**
 * /api/auth-logout
 *
 * Terminates the authenticated operator session:
 *  1. Cryptographically extracts the refresh token from ga_session.
 *  2. Requests Google OAuth token revocation (invalidates refresh token globally).
 *  3. Handles revocation failures safely without leaking credentials.
 *  4. Instructs the browser to delete session and nonce cookies (Max-Age=0).
 *  5. Redirects back to /dashboard/ (or returns JSON if redirect=false).
 */

'use strict';

const { decryptSession } = require('./_crypto');

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

function buildClearCookie(name, sameSite = 'Strict', isSecure = true) {
  const securePart = isSecure ? '; Secure' : '';
  return `${name}=; Path=/; HttpOnly${securePart}; SameSite=${sameSite}; Max-Age=0`;
}

module.exports = async function handler(req, res) {
  const encKey = process.env.TOKEN_ENCRYPTION_KEY;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
  const isSecure = redirectUri.startsWith('https://');
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies['ga_session'];

  // Attempt server-side Google OAuth token revocation
  if (encKey && sessionCookie) {
    try {
      const session = decryptSession(sessionCookie, encKey);
      const token = session && session.token;

      if (token && typeof token === 'string') {
        const revokeRes = await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token })
        });

        if (!revokeRes.ok) {
          // Log status code only — never log token or response body
          console.warn('[auth-logout] Token revocation response status:', revokeRes.status);
        }
      }
    } catch (err) {
      // Safe catch: revocation network failure or invalid cookie must never block logout
      console.warn('[auth-logout] Token revocation non-fatal notice:', err.code || err.message);
    }
  }

  // Clear session and CSRF state cookies
  res.setHeader('Set-Cookie', [
    buildClearCookie('ga_session', 'Lax', isSecure),
    buildClearCookie('oauth_nonce', 'Lax', isSecure)
  ]);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.query && req.query.redirect === 'false') {
    return res.status(200).json({ ok: true, message: 'Logged out and invalidated successfully.' });
  }

  res.setHeader('Location', '/dashboard/');
  return res.status(302).end();
};
