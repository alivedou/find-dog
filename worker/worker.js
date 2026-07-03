// find.exp.dog API — Cloudflare Workers + KV

const BLOCK = [/https?:\/\//, /www\./, /[a-zA-Z0-9]+\.[a-z]{2,}\//, /([0-9]{1,3}\.){3}/, /[Qq]{2,3}[：: ]?\d/, /[Vv][Xx][：: ]?\w/];
const MAX_MSGS = 50;
const RATE_LIMIT = 3;
const RATE_WINDOW = 3600;

function bad(text) {
  return BLOCK.some(p => p.test(text));
}

async function checkRate(kv, ip) {
  const raw = await kv.get('ip:' + ip);
  const now = Date.now() / 1000;
  let times = raw ? JSON.parse(raw) : [];
  times = times.filter(t => now - t < RATE_WINDOW);
  if (times.length >= RATE_LIMIT) return null;
  times.push(now);
  await kv.put('ip:' + ip, JSON.stringify(times), { expirationTtl: RATE_WINDOW });
  return times.length;
}

async function getMessages(kv) {
  const raw = await kv.get('messages');
  return raw ? JSON.parse(raw) : [];
}

async function saveMessages(kv, msgs) {
  await kv.put('messages', JSON.stringify(msgs));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const kv = env.DOGKV;
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });

    if (path === '/api/count' && request.method === 'GET') {
      const count = parseInt(await kv.get('count') || '0');
      return new Response(JSON.stringify({ count }), { headers });
    }

    if (path === '/api/hit' && request.method === 'POST') {
      const count = parseInt(await kv.get('count') || '0') + 1;
      await kv.put('count', String(count));
      return new Response(JSON.stringify({ count }), { headers });
    }

    if (path === '/api/messages' && request.method === 'GET') {
      const msgs = await getMessages(kv);
      return new Response(JSON.stringify(msgs.slice(-20)), { headers });
    }

    if (path === '/api/messages' && request.method === 'POST') {
      let body;
      try { body = await request.json(); } catch { body = {}; }
      const text = (body.text || '').trim().slice(0, 60);
      if (!text) return new Response(JSON.stringify({ error: 'empty' }), { status: 400, headers });
      if (bad(text)) return new Response(JSON.stringify({ error: 'content not allowed' }), { status: 400, headers });

      const rate = await checkRate(kv, ip);
      if (rate === null) return new Response(JSON.stringify({ error: 'too many' }), { status: 429, headers });

      const msgs = await getMessages(kv);
      const now = Date.now() / 1000;
      msgs.push({ text, time: now });
      if (msgs.length > MAX_MSGS) msgs.splice(0, msgs.length - MAX_MSGS);
      await saveMessages(kv, msgs);
      return new Response(JSON.stringify({ ok: true }), { headers });
    }

    // GET /api/dog — 多源兜底
    if (path === '/api/dog' && request.method === 'GET') {
      const sources = [
        'https://dog.ceo/api/breeds/image/random',
        'https://random.dog/woof.json',
      ];
      for (const src of sources) {
        try {
          const res = await fetch(src);
          const data = await res.json();
          let imgUrl = '';
          if (data.message) imgUrl = data.message;
          if (data.url && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(data.url)) imgUrl = data.url;
          if (imgUrl) return new Response(JSON.stringify({ url: imgUrl }), { headers });
        } catch {}
      }
      return new Response(JSON.stringify({ url: '' }), { headers });
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers });
  }
};
