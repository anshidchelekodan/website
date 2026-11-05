/**
 * /api/analytics
 *
 * Serverless GA4 Data API Proxy.
 * Authenticates via the encrypted refresh token stored in the ga_session cookie.
 * Exchanging refresh tokens for short-lived access tokens occurs entirely server-side.
 * Never exposes OAuth secrets, tokens, or credentials to the client.
 *
 * Supported query parameters:
 *   period: 'today' | '7d' | '30d' | 'custom'
 *   startDate: 'YYYY-MM-DD' (if period === 'custom')
 *   endDate:   'YYYY-MM-DD' (if period === 'custom')
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

/**
 * Resolve date ranges from query parameters.
 */
function resolveDateRange(query) {
  const period = (query.period || '7d').toLowerCase();

  if (period === 'today') {
    return { startDate: 'today', endDate: 'today', label: 'Today' };
  }
  if (period === '30d') {
    return { startDate: '30daysAgo', endDate: 'today', label: 'Last 30 Days' };
  }
  if (period === 'custom') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const start = query.startDate;
    const end = query.endDate;

    if (start && end && dateRegex.test(start) && dateRegex.test(end)) {
      return { startDate: start, endDate: end, label: `${start} to ${end}` };
    }
  }

  // Default to 7 days
  return { startDate: '7daysAgo', endDate: 'today', label: 'Last 7 Days' };
}

/**
 * Exchange refresh token for fresh short-lived Google access token.
 */
async function fetchAccessToken(refreshToken, clientId, clientSecret) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text().catch(() => '');
    throw new Error(`Token exchange failed (${tokenRes.status}): ${errText}`);
  }

  const tokenData = await tokenRes.json();
  if (!tokenData || !tokenData.access_token) {
    throw new Error('No access_token returned by Google token endpoint.');
  }

  return tokenData.access_token;
}

/**
 * Helper to run a single GA4 report via Google Analytics Data API v1beta.
 */
async function runGA4Report(propertyId, accessToken, reportConfig) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reportConfig)
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => null);
    const message = errJson && errJson.error ? errJson.error.message : response.statusText;
    const error = new Error(`GA4 API error (${response.status}): ${message}`);
    error.status = response.status;
    error.details = errJson;
    throw error;
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // ── 1. Check server environment configuration ─────────────────────────────
  const encKey = process.env.TOKEN_ENCRYPTION_KEY;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!encKey || !clientId || !clientSecret) {
    return res.status(500).json({
      error: 'Server OAuth configuration is incomplete.',
      code: 'SERVER_CONFIG_ERROR'
    });
  }

  // ── 2. Authenticate session ───────────────────────────────────────────────
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies['ga_session'];

  if (!sessionCookie) {
    return res.status(401).json({
      error: 'Authentication required. Please connect your Google account.',
      requiresAuth: true
    });
  }

  let session;
  try {
    session = decryptSession(sessionCookie, encKey);
  } catch (err) {
    const errorMsg = err.expired
      ? 'Session expired. Please sign in again.'
      : 'Session invalid or corrupted. Please sign in again.';
    return res.status(401).json({
      error: errorMsg,
      requiresAuth: true,
      expired: Boolean(err.expired)
    });
  }

  const refreshToken = session && session.token;
  if (!refreshToken || typeof refreshToken !== 'string') {
    return res.status(401).json({
      error: 'Session missing refresh token. Please sign in again.',
      requiresAuth: true
    });
  }

  // ── 3. Verify GA4 Property ID ─────────────────────────────────────────────
  const isPropertyConfigured = Boolean(
    propertyId &&
    !propertyId.startsWith('REPLACE_WITH') &&
    propertyId.trim() !== ''
  );

  if (!isPropertyConfigured) {
    return res.status(503).json({
      error: 'GA4 Property ID is not configured on this server.',
      code: 'UNCONFIGURED_PROPERTY',
      requiresConfig: true,
      message: 'Add GA4_PROPERTY_ID in environment variables (GA4 Admin > Property Settings > Property ID).'
    });
  }

  // ── 4. Obtain short-lived Google Access Token ─────────────────────────────
  let accessToken;
  try {
    accessToken = await fetchAccessToken(refreshToken, clientId, clientSecret);
  } catch (err) {
    console.error('[analytics] Access token renewal failed:', err.message);
    // If token was revoked or invalid, prompt re-authentication
    return res.status(401).json({
      error: 'Google authorization expired or revoked. Please reconnect.',
      requiresAuth: true
    });
  }

  // ── 5. Prepare Date Ranges ────────────────────────────────────────────────
  const query = req.method === 'POST' ? { ...req.query, ...req.body } : req.query || {};
  const dateRange = resolveDateRange(query);
  const gaDateRanges = [{ startDate: dateRange.startDate, endDate: dateRange.endDate }];

  // ── 6. Query GA4 Data API v1beta ──────────────────────────────────────────
  try {
    const [
      overviewRes,
      trendsRes,
      channelsRes,
      sourcesRes,
      pagesRes,
      devicesRes,
      geoRes,
      eventsRes
    ] = await Promise.all([
      // 1. Overview metrics
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'engagementRate' },
          { name: 'userEngagementDuration' }
        ]
      }),
      // 2. Timeline trends by date
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'date' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' },
          { name: 'screenPageViews' }
        ],
        orderBys: [{ dimension: { orderType: 'ALPHANUMERIC', dimensionName: 'date' } }]
      }),
      // 3. Channels breakdown
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'engagementRate' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      }),
      // 4. Source / Medium
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'sessionSourceMedium' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      }),
      // 5. Pages and blog posts
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'activeUsers' },
          { name: 'userEngagementDuration' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 25
      }),
      // 6. Device category
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' }
        ]
      }),
      // 7. Geographic breakdown
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'country' }, { name: 'city' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'sessions' }
        ],
        orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
        limit: 15
      }),
      // 8. Conversion and interaction events
      runGA4Report(propertyId, accessToken, {
        dateRanges: gaDateRanges,
        dimensions: [{ name: 'eventName' }],
        metrics: [
          { name: 'eventCount' },
          { name: 'activeUsers' }
        ],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 30
      })
    ]);

    // ── 7. Transform and Structure Response Cleanly ─────────────────────────
    // Overview
    const overviewRow = overviewRes.rows && overviewRes.rows[0];
    const totalUsers = overviewRow ? parseInt(overviewRow.metricValues[0].value || '0', 10) : 0;
    const totalSessions = overviewRow ? parseInt(overviewRow.metricValues[1].value || '0', 10) : 0;
    const totalViews = overviewRow ? parseInt(overviewRow.metricValues[2].value || '0', 10) : 0;
    const engRate = overviewRow ? parseFloat(overviewRow.metricValues[3].value || '0') : 0;
    const engDuration = overviewRow ? parseFloat(overviewRow.metricValues[4].value || '0') : 0;
    // Official GA4 definition: total userEngagementDuration divided by activeUsers
    const avgEngTime = totalUsers > 0 ? Math.round(engDuration / totalUsers) : 0;

    const hasData = totalUsers > 0 || totalSessions > 0 || totalViews > 0;

    // Timeline trends
    const trends = (trendsRes.rows || []).map(row => ({
      date: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value || '0', 10),
      sessions: parseInt(row.metricValues[1].value || '0', 10),
      views: parseInt(row.metricValues[2].value || '0', 10)
    }));

    // Channels
    const channels = (channelsRes.rows || []).map(row => ({
      channel: row.dimensionValues[0].value || '(Other)',
      sessions: parseInt(row.metricValues[0].value || '0', 10),
      users: parseInt(row.metricValues[1].value || '0', 10),
      engagementRate: parseFloat(row.metricValues[2].value || '0')
    }));

    // Sources
    const sources = (sourcesRes.rows || []).map(row => ({
      sourceMedium: row.dimensionValues[0].value || '(Direct)',
      sessions: parseInt(row.metricValues[0].value || '0', 10),
      users: parseInt(row.metricValues[1].value || '0', 10)
    }));

    // Pages & Blog Posts
    const pages = (pagesRes.rows || []).map(row => ({
      path: row.dimensionValues[0].value || '/',
      title: row.dimensionValues[1].value || 'Untitled',
      views: parseInt(row.metricValues[0].value || '0', 10),
      users: parseInt(row.metricValues[1].value || '0', 10),
      duration: parseFloat(row.metricValues[2].value || '0')
    }));

    // Devices
    const devices = (devicesRes.rows || []).map(row => ({
      device: row.dimensionValues[0].value || 'unknown',
      users: parseInt(row.metricValues[0].value || '0', 10),
      sessions: parseInt(row.metricValues[1].value || '0', 10)
    }));

    // Geo
    const geo = (geoRes.rows || []).map(row => ({
      country: row.dimensionValues[0].value || 'Unknown',
      city: row.dimensionValues[1].value || 'Unknown',
      users: parseInt(row.metricValues[0].value || '0', 10),
      sessions: parseInt(row.metricValues[1].value || '0', 10)
    }));

    // Conversion & Action Events
    const rawEvents = (eventsRes.rows || []).map(row => ({
      name: row.dimensionValues[0].value,
      count: parseInt(row.metricValues[0].value || '0', 10),
      users: parseInt(row.metricValues[1].value || '0', 10)
    }));

    // Map high-value conversion events
    const findEventData = (...aliases) => {
      let count = 0;
      let configured = false;
      for (const ev of rawEvents) {
        const lower = ev.name.toLowerCase();
        if (aliases.some(alias => lower.includes(alias.toLowerCase()))) {
          count += ev.count;
          configured = true;
        }
      }
      return { count, configured };
    };

    const conversions = {
      whatsapp: findEventData('whatsapp', 'wa_click'),
      email: findEventData('email', 'mail'),
      phone: findEventData('phone', 'tel', 'call'),
      formSubmissions: findEventData('form_submit', 'contact_submit', 'generate_lead', 'lead'),
      allEvents: rawEvents
    };

    return res.status(200).json({
      success: true,
      propertyId,
      period: dateRange,
      isEmpty: !hasData,
      overview: {
        activeUsers: totalUsers,
        sessions: totalSessions,
        pageviews: totalViews,
        engagementRate: engRate,
        averageEngagementTime: avgEngTime,
        hasData
      },
      trends,
      channels,
      sources,
      pages,
      devices,
      geo,
      conversions
    });

  } catch (err) {
    console.error('[analytics] Query execution error:', err.message);

    return res.status(502).json({
      error: 'Google Analytics Data API request failed.',
      message: err.message,
      status: err.status || 502,
      details: err.details || null
    });
  }
};
