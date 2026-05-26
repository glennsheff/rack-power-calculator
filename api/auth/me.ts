import type { IncomingMessage, ServerResponse } from 'node:http';
import { isAuthedFromCookie } from '../_lib/auth.js';
import { sendJson, methodNotAllowed } from '../_lib/http.js';

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    methodNotAllowed(res);
    return;
  }

  sendJson(res, { authenticated: isAuthedFromCookie(req.headers.cookie) });
}
