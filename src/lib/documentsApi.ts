import { sbOrNull } from '@/lib/sb'

const BUCKET = 'client-documents'

export async function listDocuments(filters?: { case_id?: string; client_id?: string }) {
  const client = sbOrNull()
  if (!client) return []
  let q = client.from('documents').select('*').order('created_at', { ascending: false })
  if (filters?.case_id) q = q.eq('case_id', filters.case_id)
  if (filters?.client_id) q = q.eq('client_id', filters.client_id)
  const { data } = await q.limit(100)
  return data ?? []
}

export async function uploadDocument(input: {
  file: File
  title?: string
  client_id?: string | null
  case_id?: string | null
  tax_filing_id?: string | null
  ownerFolder: string
}) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }

  const safeName = input.file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${input.ownerFolder}/${Date.now()}-${safeName}`

  const { error: upErr } = await client.storage.from(BUCKET).upload(path, input.file, {
    upsert: false,
    contentType: input.file.type || undefined,
  })
  if (upErr) return { ok: false as const, error: upErr.message }

  const { data: userData } = await client.auth.getUser()
  const { data, error } = await client
    .from('documents')
    .insert({
      title: input.title || input.file.name,
      storage_path: path,
      bucket: BUCKET,
      mime_type: input.file.type || null,
      size_bytes: input.file.size,
      client_id: input.client_id ?? null,
      case_id: input.case_id ?? null,
      tax_filing_id: input.tax_filing_id ?? null,
      uploaded_by: userData.user?.id ?? null,
    })
    .select('id')
    .single()
  if (error) {
    await client.storage.from(BUCKET).remove([path])
    return { ok: false as const, error: error.message }
  }
  return { ok: true as const, id: (data as { id: string }).id, path }
}

export async function getSignedDownloadUrl(storagePath: string, expiresIn = 120) {
  const client = sbOrNull()
  if (!client) return { ok: false as const, error: 'Supabase not configured' }
  const { data, error } = await client.storage.from(BUCKET).createSignedUrl(storagePath, expiresIn)
  if (error || !data?.signedUrl) {
    return { ok: false as const, error: error?.message ?? 'Could not sign URL' }
  }
  return { ok: true as const, url: data.signedUrl }
}
