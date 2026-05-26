import type { IncomingMessage, ServerResponse } from 'node:http';
import { sql, type HardwareRow } from './_lib/db.js';
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
      SELECT * FROM hardware_items ORDER BY name
    `) as HardwareRow[];
    sendJson(res, rows);
    return;
  }

  if (req.method === 'POST') {
    const body = req.body;
    const items: HardwareRow[] = Array.isArray(body) ? body : [body as HardwareRow];
    for (const row of items) {
      if (!row?.id) {
        sendError(res, 400, 'id is required');
        return;
      }
      await sql`
        INSERT INTO hardware_items (
          id, name, model, category,
          power_watts, peak_power_watts, heat_output_btu,
          power_supply_count, power_supply_type,
          rack_units, weight_kg, notes, status, poe_powered,
          created_at, updated_at
        ) VALUES (
          ${row.id}, ${row.name}, ${row.model}, ${row.category},
          ${row.power_watts}, ${row.peak_power_watts}, ${row.heat_output_btu},
          ${row.power_supply_count}, ${row.power_supply_type},
          ${row.rack_units}, ${row.weight_kg}, ${row.notes ?? ''}, ${row.status}, ${row.poe_powered ?? false},
          ${row.created_at}, ${row.updated_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          name               = EXCLUDED.name,
          model              = EXCLUDED.model,
          category           = EXCLUDED.category,
          power_watts        = EXCLUDED.power_watts,
          peak_power_watts   = EXCLUDED.peak_power_watts,
          heat_output_btu    = EXCLUDED.heat_output_btu,
          power_supply_count = EXCLUDED.power_supply_count,
          power_supply_type  = EXCLUDED.power_supply_type,
          rack_units         = EXCLUDED.rack_units,
          weight_kg          = EXCLUDED.weight_kg,
          notes              = EXCLUDED.notes,
          status             = EXCLUDED.status,
          poe_powered        = EXCLUDED.poe_powered,
          updated_at         = EXCLUDED.updated_at
      `;
    }
    sendJson(res, { ok: true, count: items.length });
    return;
  }

  if (req.method === 'DELETE') {
    const id = req.query?.id;
    if (typeof id !== 'string' || id.length === 0) {
      sendError(res, 400, 'id query param is required');
      return;
    }
    await sql`DELETE FROM hardware_items WHERE id = ${id}`;
    sendJson(res, { ok: true });
    return;
  }

  methodNotAllowed(res);
}
