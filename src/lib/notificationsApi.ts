import { sbOrNull } from '@/lib/sb'

export async function enqueueNotification(input: {
  user_id?: string | null
  title: string
  body?: string
  entity?: string
  entity_id?: string
  idempotency_key?: string
  channel?: string
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const client = sbOrNull()
  if (!client) return { ok: false, error: 'Supabase not configured' }

  if (input.idempotency_key) {
    const { data: existing } = await client
      .from('notifications')
      .select('id')
      .eq('idempotency_key', input.idempotency_key)
      .maybeSingle()
    if (existing) return { ok: true }
  }

  const { error } = await client.from('notifications').insert({
    user_id: input.user_id ?? null,
    title: input.title,
    body: input.body ?? null,
    entity: input.entity ?? null,
    entity_id: input.entity_id ?? null,
    idempotency_key: input.idempotency_key ?? null,
    channel: input.channel ?? 'in_app',
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function listNotifications(limit = 50) {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function ensureDeadlineReminders() {
  const client = sbOrNull()
  if (!client) return { created: 0 }
  const today = new Date().toISOString().slice(0, 10)
  const { data: due } = await client
    .from('tax_deadlines')
    .select('id, title, due_date')
    .lte('due_date', today)
    .in('status', ['upcoming', 'due'])
  let created = 0
  for (const d of due ?? []) {
    const row = d as { id: string; title: string; due_date: string }
    const res = await enqueueNotification({
      title: `Deadline: ${row.title}`,
      body: `Due ${row.due_date}`,
      entity: 'tax_deadlines',
      entity_id: row.id,
      idempotency_key: `deadline-reminder-${row.id}-${row.due_date}`,
    })
    if (res.ok) created += 1
  }
  return { created }
}
