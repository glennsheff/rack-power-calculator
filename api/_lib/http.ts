import type { ServerResponse } from 'node:http';

export function sendJson(res: ServerResponse, data: unknown, status = 200): void {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(data));
}

export function sendError(res: ServerResponse, status: number, message: string): void {
  sendJson(res, { error: message }, status);
}

export function methodNotAllowed(res: ServerResponse): void {
  sendError(res, 405, 'Method not allowed');
}

export function unauthorized(res: ServerResponse): void {
  sendError(res, 401, 'Unauthorized');
}
