import type { IncomingMessage, ServerResponse } from 'node:http';
import { verifyPassword, setSessionCookieHeader } from '../_lib/auth.js';
import { sendJson, sendError, methodNotAllowed } from '../_lib/http.js';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    methodNotAllowed(res);
    return;
  }

  const body = req.body as { password?: unknown } | undefined;
  const password = body?.password;
  if (typeof password !== 'string') {
    sendError(res, 400, 'password required');
    return;
  }

  if (!verifyPassword(password)) {
    sendJson(res, { ok: false }, 401);
    return;
  }

  res.setHeader('set-cookie', setSessionCookieHeader());
  sendJson(res, { ok: true });
}
