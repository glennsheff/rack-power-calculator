import { verifyPassword, setSessionCookieHeader } from '../_lib/auth.js';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const password = body.password;
  if (typeof password !== 'string') {
    return new Response(JSON.stringify({ error: 'password required' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!verifyPassword(password)) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'set-cookie': setSessionCookieHeader(),
    },
  });
}
