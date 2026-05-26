import { sql, json, badRequest, methodNotAllowed, type HardwareRow } from './_lib/db.js';
import { isAuthed, unauthorized } from './_lib/auth.js';

export default async function handler(req: Request): Promise<Response> {
  if (!isAuthed(req)) return unauthorized();
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const rows = (await sql`
      SELECT * FROM hardware_items ORDER BY name
    `) as HardwareRow[];
    return json(rows);
  }

  if (req.method === 'POST') {
    const body = await req.json();
    const items: HardwareRow[] = Array.isArray(body) ? body : [body];
    for (const row of items) {
      if (!row.id) return badRequest('id is required');
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
    return json({ ok: true, count: items.length });
  }

  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id query param is required');
    await sql`DELETE FROM hardware_items WHERE id = ${id}`;
    return json({ ok: true });
  }

  return methodNotAllowed();
}
