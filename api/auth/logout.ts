import type { IncomingMessage, ServerResponse } from 'node:http';
import { clearSessionCookieHeader } from '../_lib/auth.js';
import { sendJson, methodNotAllowed } from '../_lib/http.js';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  res.setHeader('set-cookie', clearSessionCookieHeader());
  sendJson(res, { ok: true });
}
