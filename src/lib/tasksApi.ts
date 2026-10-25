import { sbOrNull } from '@/lib/sb'
import { enqueueNotification } from '@/lib/notificationsApi'

export async function listTasks() {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client.from('tasks').select('*').order('due_date', { ascending: true })
  return data ?? []
}

export async function createTask(input: {
  title: string
  description?: string
  assignee_id?: string | null
  case_id?: string | null
  due_date?: string | null
  priority?: string
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data: userData } = await client.auth.getUser()
  const { data, error } = await client
    .from('tasks')
    .insert({
      title: input.title,
      description: input.description ?? null,
      assignee_id: input.assignee_id ?? null,
      case_id: input.case_id ?? null,
      due_date: input.due_date ?? null,
      priority: input.priority ?? 'normal',
      status: 'todo',
      created_by: userData.user?.id ?? null,
    })
    .select('id')
    .single()
  if (error) return { ok: false as const, error: error.message }
  const id = (data as { id: string }).id
  if (input.assignee_id) {
    await enqueueNotification({
      user_id: input.assignee_id,
      title: `Task assigned: ${input.title}`,
      entity: 'tasks',
      entity_id: id,
      idempotency_key: `task-assign-${id}`,
    })
  }
  return { ok: true as const, id }
}

export async function updateTaskStatus(id: string, status: string) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { error } = await client
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function listTaskComments(taskId: string) {
  const client = sbOrNull()
  if (!client) return []
  const { data } = await client
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at')
  return data ?? []
}

export async function addTaskComment(taskId: string, body: string) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data: userData } = await client.auth.getUser()
  const { error } = await client.from('task_comments').insert({
    task_id: taskId,
    body,
    author_id: userData.user?.id ?? null,
  })
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
