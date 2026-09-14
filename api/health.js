import 'dotenv/config';

function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  const apiKey = process.env.SINGSTAT_API_KEY;
  const keyConfigured = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'undefined');

  // BEFORE the fetch, if the credential is missing or empty, return 503 naming the variable and do not call upstream
  if (!keyConfigured) {
    return sendJson(res, 503, {
      keyConfigured: false,
      upstreamAnswered: false,
      upstreamStatus: null,
      error: 'SINGSTAT_API_KEY is not configured or empty. Upstream was not called.',
      variable: 'SINGSTAT_API_KEY'
    });
  }

  try {
    const upstreamResponse = await fetch('https://tablebuilder.singstat.gov.sg/api/table/tabledata/M213751', {
      headers: {
        'User-Agent': 'SingStat-CPI-Dashboard/1.0',
        'api-key': apiKey,
        'x-api-key': apiKey,
        'apiKey': apiKey,
        'Accept': 'application/json'
      }
    });

    const upstreamStatus = upstreamResponse.status;
    const upstreamAnswered = true;

    return sendJson(res, upstreamResponse.ok ? 200 : upstreamStatus, {
      keyConfigured: true,
      upstreamAnswered,
      upstreamStatus,
      ok: upstreamResponse.ok,
      message: upstreamResponse.ok
        ? 'SingStat upstream answered successfully.'
        : `SingStat upstream returned HTTP ${upstreamStatus}.`
    });
  } catch (err) {
    // Upstream is unreachable
    return sendJson(res, 502, {
      keyConfigured: true,
      upstreamAnswered: false,
      upstreamStatus: null,
      error: `SingStat upstream is unreachable: ${err.message || 'Network connection failed'}`
    });
  }
}
