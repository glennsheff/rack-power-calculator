import { isAuthed } from '../_lib/auth.js';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ authenticated: isAuthed(req) }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
