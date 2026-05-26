import type { IncomingMessage, ServerResponse } from 'node:http';
import { sql, type ConfigRow } from './_lib/db.js';
import { isAuthedFromCookie } from './_lib/auth.js';
import { sendJson, sendError, methodNotAllowed, unauthorized } from './_lib/http.js';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
  query?: Record<string, string | string[]>;
}

export default async function handler(req: VercelRequest, res: ServerResponse): Promise<void> {
  if (!isAuthedFromCookie(req.headers.cookie)) {
    unauthorized(res);
    return;
  }

  if (req.method === 'GET') {
    const rows = (await sql`
      SELECT * FROM rack_configurations ORDER BY updated_at DESC
    `) as ConfigRow[];
    sendJson(res, rows);
    return;
  }

  if (req.method === 'POST') {
    const row = req.body as ConfigRow;
    if (!row?.id) {
      sendError(res, 400, 'id is required');
      return;
    }
    await sql`
      INSERT INTO rack_configurations (
        id, name, store_name, region, items,
        desired_runtime_minutes, include_redundancy, ambient_temp_celsius,
        notes, created_at, updated_at
      ) VALUES (
        ${row.id}, ${row.name ?? ''}, ${row.store_name ?? ''}, ${row.region},
        ${JSON.stringify(row.items ?? [])}::jsonb,
        ${row.desired_runtime_minutes}, ${row.include_redundancy}, ${row.ambient_temp_celsius},
        ${row.notes ?? ''}, ${row.created_at}, ${row.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        name                    = EXCLUDED.name,
        store_name              = EXCLUDED.store_name,
        region                  = EXCLUDED.region,
        items                   = EXCLUDED.items,
        desired_runtime_minutes = EXCLUDED.desired_runtime_minutes,
        include_redundancy      = EXCLUDED.include_redundancy,
        ambient_temp_celsius    = EXCLUDED.ambient_temp_celsius,
        notes                   = EXCLUDED.notes,
        updated_at              = EXCLUDED.updated_at
    `;
    sendJson(res, { ok: true });
    return;
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id;
    if (typeof id !== 'string' || id.length === 0) {
      sendError(res, 400, 'id query param is required');
      return;
    }
    await sql`DELETE FROM rack_configurations WHERE id = ${id}`;
    sendJson(res, { ok: true });
    return;
  }

  methodNotAllowed(res);
}
