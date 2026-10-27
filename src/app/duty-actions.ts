'use server'
import { redirect } from 'next/navigation'
import { assertAccess } from '@/lib/session'
import { addDuty, removeDuty } from '@/lib/duties'
import { persist } from '@/lib/persist'

const admin = async (slug: string, eventId: number) => (await assertAccess(slug, 'event', { eventId })).c
export async function addDutyAction(slug: string, eventId: number, form: FormData) {
  const c = await admin(slug, eventId)
  const f = (k: string) => String(form.get(k) ?? '')
  const r = addDuty(c.id, eventId, { volunteer: f('volunteer'), mobile: f('mobile'), area: f('area'), starts: f('starts'), ends: f('ends'), notes: f('notes') }, 'Admin')
  if (r.ok) await persist()
  redirect(`/c/${slug}/admin/events/${eventId}/duties?${r.ok ? 'msg=Added' : `err=${encodeURIComponent(r.error)}`}`)
}
export async function removeDutyAction(slug: string, eventId: number, id: number) {
  const c = await admin(slug, eventId)
  removeDuty(c.id, id, 'Admin')
  await persist()
  redirect(`/c/${slug}/admin/events/${eventId}/duties?msg=Removed`)
}
