import { sql, json, badRequest, methodNotAllowed, type ConfigRow } from './_lib/db.ts';

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const rows = (await sql`
      SELECT * FROM rack_configurations ORDER BY updated_at DESC
    `) as ConfigRow[];
    return json(rows);
  }

  if (req.method === 'POST') {
    const row = (await req.json()) as ConfigRow;
    if (!row.id) return badRequest('id is required');
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
    return json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const id = url.searchParams.get('id');
    if (!id) return badRequest('id query param is required');
    await sql`DELETE FROM rack_configurations WHERE id = ${id}`;
    return json({ ok: true });
  }

  return methodNotAllowed();
}
