
/**
 * Vercel Edge Middleware
 * Protects the private Analytics Dashboard.
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

// Read cookie safely from the standard HTTP header
function getCookie(request, name) {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const prefix = `${name}=`;

  for (const item of cookieHeader.split(';')) {
    const cookie = item.trim();

    if (cookie.startsWith(prefix)) {
      return cookie.substring(prefix.length);
    }
  }

  return null;
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
    if (iv.length !== 12 || tag.length !== 16 || keyBytes.length !== 32) {
      return false;
    }

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

    const payload = JSON.parse(
      new TextDecoder().decode(decryptedBuf)
    );

    if (!payload || typeof payload.token !== 'string' || !payload.token) {
      return false;
    }

    if (
      typeof payload.exp !== 'number' ||
      Date.now() >= payload.exp
    ) {
      return false;
    }

    return true;

  } catch {
    return false;
  }
}

export default async function middleware(request) {
  const encKey = process.env.TOKEN_ENCRYPTION_KEY;
  const cookieVal = getCookie(request, 'ga_session');

  const isValid = await validateSession(cookieVal, encKey);

  if (!isValid) {
    const authStartUrl = new URL('/api/auth-start', request.url);
    return Response.redirect(authStartUrl, 302);
  }

  return;
}
