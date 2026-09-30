const json = (data, status = 200, origin = 'null') => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin'
  }
});

export default {
  async fetch(request, env) {
    const requestOrigin = request.headers.get('Origin') || '';
    const allowedOrigin = env.ALLOWED_ORIGIN || '';
    const origin = allowedOrigin && (!requestOrigin || requestOrigin === allowedOrigin) ? allowedOrigin : 'null';
    if (requestOrigin && origin === 'null') return json({ error: 'Origin is not allowed.' }, 403, 'null');
    if (request.method === 'OPTIONS') return json({ ok: true }, 200, origin);
    if (request.method !== 'POST') return json({ error: 'Only POST is supported.' }, 405, origin);
    if (!env.DEEPSEEK_API_KEY) return json({ error: 'DEEPSEEK_API_KEY is not configured.' }, 500, origin);
    const contentLength = Number(request.headers.get('Content-Length') || 0);
    if (contentLength > 180000) return json({ error: 'Request is too large.' }, 413, origin);

    let incoming;
    try {
      incoming = await request.json();
    } catch {
      return json({ error: 'Request body must be valid JSON.' }, 400, origin);
    }

    if (!Array.isArray(incoming.messages) || incoming.messages.length === 0) {
      return json({ error: 'messages is required.' }, 400, origin);
    }

    const messages = incoming.messages
      .filter((item) => item && ['system', 'user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .map((item) => ({ role: item.role, content: item.content.slice(0, 12000) }))
      .slice(-12);
    if (messages.length === 0) return json({ error: 'No valid messages were provided.' }, 400, origin);

    const apiUrl = env.DEEPSEEK_API_URL || 'https://api.deepseek.com/chat/completions';
    const model = env.DEEPSEEK_MODEL;
    if (!model) return json({ error: 'DEEPSEEK_MODEL is not configured.' }, 500, origin);

    const upstream = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, stream: false, temperature: 0.2 })
    });

    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin'
      }
    });
  }
};
