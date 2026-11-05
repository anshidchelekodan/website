/**
 * /api/auth-status
 *
 * Checks if the current visitor has an authenticated GA4 operator session.
 * Decrypts the ga_session cookie using TOKEN_ENCRYPTION_KEY to ensure
 * authenticity and validity.
 *
 * Returns:
 *   { authenticated: boolean, configured: boolean, hasPropertyId: boolean }
 */

'use strict';

const { decryptSession } = require('./_crypto');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const encKey = process.env.TOKEN_ENCRYPTION_KEY;
  const propertyId = process.env.GA4_PROPERTY_ID;
  const isPropertyConfigured = Boolean(
    propertyId &&
    !propertyId.startsWith('REPLACE_WITH') &&
    propertyId.trim() !== ''
  );

  if (!encKey) {
    return res.status(200).json({
      authenticated: false,
      configured: false,
      hasPropertyId: isPropertyConfigured,
      message: 'Server encryption key is not configured.'
    });
  }

  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies['ga_session'];

  if (!sessionCookie) {
    return res.status(200).json({
      authenticated: false,
      configured: true,
      hasPropertyId: isPropertyConfigured
    });
  }

  try {
    const session = decryptSession(sessionCookie, encKey);
    if (!session || !session.token || typeof session.token !== 'string') {
      return res.status(200).json({
        authenticated: false,
        configured: true,
        hasPropertyId: isPropertyConfigured
      });
    }

    return res.status(200).json({
      authenticated: true,
      configured: true,
      hasPropertyId: isPropertyConfigured,
      propertyId: isPropertyConfigured ? propertyId : null,
      expiresAt: session.exp || null
    });
  } catch (err) {
    // Decryption failed or session expired (e.g. ERR_SESSION_EXPIRED)
    return res.status(200).json({
      authenticated: false,
      configured: true,
      hasPropertyId: isPropertyConfigured,
      expired: Boolean(err.expired)
    });
  }
};
