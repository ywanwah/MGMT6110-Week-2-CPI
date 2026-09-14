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
  // Monthly cache control matching frequency of official update
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=172800');

  const apiKey = process.env.SINGSTAT_API_KEY;

  // BEFORE the fetch: if credential is missing or empty, return 503 naming variable, do not call upstream
  if (!apiKey || apiKey.trim() === '' || apiKey === 'undefined') {
    return sendJson(res, 503, {
      error: 'SINGSTAT_API_KEY environment variable is missing or empty. Upstream was not called.',
      variable: 'SINGSTAT_API_KEY'
    });
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetch('https://tablebuilder.singstat.gov.sg/api/table/tabledata/M213751', {
      headers: {
        'User-Agent': 'SingStat-CPI-Dashboard/1.0',
        'api-key': apiKey,
        'x-api-key': apiKey,
        'apiKey': apiKey,
        'Accept': 'application/json'
      }
    });
  } catch (networkError) {
    // Upstream unreachable
    return sendJson(res, 502, {
      upstreamStatus: null,
      error: `Upstream unreachable: ${networkError.message || 'Network connection failed'}`
    });
  }

  // AFTER the fetch: check response.ok before reading the body
  if (!upstreamResponse.ok) {
    let reason = upstreamResponse.statusText || 'Upstream request failed';
    try {
      const text = await upstreamResponse.text();
      if (text) {
        try {
          const parsed = JSON.parse(text);
          reason = parsed.message || parsed.error || parsed.title || reason;
        } catch {
          reason = text.split('\n')[0].trim().slice(0, 150) || reason;
        }
      }
    } catch {
      // Empty or unreadable body, fall back to statusText
    }

    return sendJson(res, upstreamResponse.status, {
      upstreamStatus: upstreamResponse.status,
      error: `Upstream returned status ${upstreamResponse.status}: ${reason}`
    });
  }

  let json;
  try {
    json = await upstreamResponse.json();
  } catch (parseErr) {
    return sendJson(res, 502, {
      upstreamStatus: upstreamResponse.status,
      error: 'Failed to parse JSON response from SingStat upstream.'
    });
  }

  const tableData = json?.Data;
  const rows = tableData?.row || [];

  if (!rows || rows.length === 0) {
    return sendJson(res, 200, {
      empty: true,
      title: tableData?.title || 'Consumer Price Index (CPI), 2024 As Base Year, Monthly',
      resourceId: 'M213751',
      records: []
    });
  }

  // Find "All Items" row (seriesNo: "1")
  const allItemsRow = rows.find((r) => r.rowText === 'All Items' || r.seriesNo === '1') || rows[0];
  const columns = allItemsRow?.columns || [];

  if (columns.length === 0) {
    return sendJson(res, 200, {
      empty: true,
      title: tableData?.title || 'Consumer Price Index (CPI), 2024 As Base Year, Monthly',
      resourceId: 'M213751',
      records: []
    });
  }

  const totalPoints = columns.length;
  const latestCol = columns[totalPoints - 1];
  const prevCol = totalPoints >= 2 ? columns[totalPoints - 2] : null;
  const yoyCol = totalPoints >= 13 ? columns[totalPoints - 13] : null;

  const latestVal = parseFloat(latestCol.value);
  const prevVal = prevCol ? parseFloat(prevCol.value) : null;
  const yoyVal = yoyCol ? parseFloat(yoyCol.value) : null;

  const momChange = prevVal !== null ? latestVal - prevVal : 0;
  const momPercent = prevVal !== null && prevVal !== 0 ? ((latestVal - prevVal) / prevVal) * 100 : 0;

  const yoyChange = yoyVal !== null ? latestVal - yoyVal : 0;
  const yoyPercent = yoyVal !== null && yoyVal !== 0 ? ((latestVal - yoyVal) / yoyVal) * 100 : 0;

  // Recent 18 monthly points for dashboard sparkline/chart
  const recentMonthly = columns.slice(-18).map((c) => ({
    period: c.key,
    value: parseFloat(c.value)
  }));

  // Selected top-level categories
  const categoryRows = rows.filter((r) => r.seriesNo !== '1' && (r.seriesNo.endsWith('.0') || ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0'].includes(r.seriesNo) || r.columns?.length > 100)).slice(0, 8);

  const categories = categoryRows.map((cat) => {
    const catCols = cat.columns || [];
    const catLatest = catCols.length > 0 ? parseFloat(catCols[catCols.length - 1].value) : null;
    const catPrev = catCols.length >= 2 ? parseFloat(catCols[catCols.length - 2].value) : null;
    const catYoY = catCols.length >= 13 ? parseFloat(catCols[catCols.length - 13].value) : null;

    const catMomPct = catLatest !== null && catPrev !== null && catPrev !== 0
      ? ((catLatest - catPrev) / catPrev) * 100
      : null;
    const catYoyPct = catLatest !== null && catYoY !== null && catYoY !== 0
      ? ((catLatest - catYoY) / catYoY) * 100
      : null;

    return {
      seriesNo: cat.seriesNo,
      name: cat.rowText,
      value: catLatest,
      unit: cat.uoM || 'Index',
      momPercent: catMomPct !== null ? Number(catMomPct.toFixed(2)) : null,
      yoyPercent: catYoyPct !== null ? Number(catYoyPct.toFixed(2)) : null
    };
  });

  // Return only the fields needed by the screen
  return sendJson(res, 200, {
    empty: false,
    resourceId: 'M213751',
    title: tableData.title || 'Consumer Price Index (CPI), 2024 As Base Year, Monthly',
    frequency: tableData.frequency || 'Monthly',
    baseYear: '2024',
    datasource: tableData.datasource || 'SINGAPORE DEPARTMENT OF STATISTICS',
    dataLastUpdated: tableData.dataLastUpdated || null,
    footnote: tableData.footnote || '',
    latest: {
      period: latestCol.key,
      value: latestVal,
      unit: allItemsRow.uoM || 'Index',
      momPercent: Number(momPercent.toFixed(2)),
      yoyPercent: Number(yoyPercent.toFixed(2)),
      momChange: Number(momChange.toFixed(3)),
      yoyChange: Number(yoyChange.toFixed(3)),
      prevPeriod: prevCol ? prevCol.key : null,
      yoyPeriod: yoyCol ? yoyCol.key : null
    },
    recentMonthly,
    categories
  });
}
