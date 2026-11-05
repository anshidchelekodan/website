/**
 * middleware.js
 *
 * Vercel Edge Middleware for Server-Level Route Protection.
 * Protects /dashboard/ and its assets at the hosting/edge level before static files are served.
 *
 * Security properties:
 *  1. Cryptographically validates the ga_session cookie using AES-256-GCM via Web Crypto API.
 *  2. Does NOT rely on cookie presence alone: verifies authentication tag and expiration timestamp.
 *  3. Unauthenticated, expired, or tampered sessions are rejected at the edge with HTTP 302 to /api/auth-start.
 *  4. Preserves the full Google OAuth callback and redirect flow.
 */

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*']
};

function hexToBytes(hex) {
  if (typeof hex !== 'string' || hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    const val = parseInt(hex.substring(i, i + 2), 16);
    if (isNaN(val)) return null;
    bytes[i / 2] = val;
  }
  return bytes;
}

async function validateSession(cookieValue, encKeyHex) {
  if (!cookieValue || !encKeyHex || encKeyHex.length !== 64) {
    return false;
  }

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;

    const iv = hexToBytes(parts[0]);
    const ct = hexToBytes(parts[1]);
    const tag = hexToBytes(parts[2]);
    const keyBytes = hexToBytes(encKeyHex);

    if (!iv || !ct || !tag || !keyBytes) return false;
    if (iv.length !== 12 || tag.length !== 16 || keyBytes.length !== 32) return false;

    // Web Crypto requires ciphertext and authentication tag to be concatenated
    const combined = new Uint8Array(ct.length + tag.length);
    combined.set(ct);
    combined.set(tag, ct.length);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decryptedBuf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      cryptoKey,
      combined
    );

    const decryptedText = new TextDecoder().decode(decryptedBuf);
    const payload = JSON.parse(decryptedText);

    if (!payload || !payload.token || typeof payload.token !== 'string') {
      return false;
    }

    if (typeof payload.exp === 'number' && Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch {
    // Cryptographic validation failed (tampered or wrong key)
    return false;
  }
}

export default async function middleware(request) {
  const encKey = process.env.TOKEN_ENCRYPTION_KEY;
  const sessionCookie = request.cookies.get('ga_session');
  const cookieVal = sessionCookie ? sessionCookie.value : null;

  const isValid = await validateSession(cookieVal, encKey);

  if (!isValid) {
    // Unauthenticated, expired, or tampered: redirect immediately to OAuth start
    const authStartUrl = new URL('/api/auth-start', request.url);
    return Response.redirect(authStartUrl, 302);
  }

  // Session valid: allow access to /dashboard/
  return;
}
