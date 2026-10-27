import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { checkPlatformSession, checkSession } from './auth'
import { can, type Scope, type Who } from './access'
import { getCommunityBySlug } from './repo'
import { getStaff, readStaffSession, type StaffRow } from './staff'

export const cookieName = (slug: string) => `hearth_admin_${slug}`

/** Resolves the community for a page and, when `admin`, requires that community's admin session. */
export async function requireCommunity(slug: string, admin = false) {
  const c = getCommunityBySlug(slug)
  if (!c) notFound()
  if (admin) await requireAccess(slug, 'community')
  return c
}
export const isAdminSession = async (slug: string) => can(actorWho(await getActor(slug)), 'community')
export const platformCookieName = 'hearth_platform'

export const staffCookieName = (slug: string) => `hearth_staff_${slug}`
export const gateCookieName = (slug: string) => `hearth_gate_${slug}`

export type Actor = { kind: 'admin'; label: string; platform?: boolean; staff?: undefined } | { kind: 'staff'; label: string; platform?: undefined; staff: StaffRow }

/** Who is signed in for this community: the admin, or an active staff member. Staff are re-checked against the database on every request, so revoking them takes effect at once. */
export async function getActor(slug: string): Promise<Actor | null> {
  const c = getCommunityBySlug(slug)
  if (!c) return null
  const jar = await cookies()
  if (checkPlatformSession(jar.get(platformCookieName)?.value)) return { kind: 'admin', label: 'Application admin', platform: true }
  if (checkSession(jar.get(cookieName(slug))?.value, slug)) return { kind: 'admin', label: 'Admin' }
  const id = readStaffSession(jar.get(staffCookieName(slug))?.value, slug)
  const s = id ? getStaff(c.id, id) : undefined
  return s && s.active ? { kind: 'staff', label: s.name, staff: s } : null
}

export const actorWho = (a: Actor | null): Who | null => (!a ? null : a.kind === 'admin' ? { kind: 'admin' } : { kind: 'staff', role: a.staff.role, sport: a.staff.sport, eventId: a.staff.event_id })
export const canCheckIn = (a: Actor | null) => can(actorWho(a), 'checkin')
export const canSeeSport = (a: Actor | null, sport: string) => can(actorWho(a), 'sport', { sport })

/** For pages: sends anyone not allowed to the right place (sign-in when signed out, their own home otherwise). */
export async function requireAccess(slug: string, scope: Scope, ctx: { eventId?: number; sport?: string } = {}) {
  const c = getCommunityBySlug(slug)
  if (!c) notFound()
  const actor = await getActor(slug)
  if (!can(actorWho(actor), scope, ctx)) redirect(actor ? `/c/${slug}/staff` : `/c/${slug}/admin/login`)
  return { c, actor: actor! }
}
/** For server actions and routes: refuses instead of redirecting. */
export async function assertAccess(slug: string, scope: Scope, ctx: { eventId?: number; sport?: string } = {}) {
  const c = getCommunityBySlug(slug)
  const actor = await getActor(slug)
  if (!c || !can(actorWho(actor), scope, ctx)) throw new Error('Not authorised')
  return { c, actor: actor! }
}
export const hasAccess = async (slug: string, scope: Scope, ctx: { eventId?: number; sport?: string } = {}) => can(actorWho(await getActor(slug)), scope, ctx)

export async function requireActor(slug: string, allow: (a: Actor | null) => boolean = (a) => !!a) {
  const c = getCommunityBySlug(slug)
  if (!c) notFound()
  const actor = await getActor(slug)
  if (!allow(actor)) redirect(actor ? `/c/${slug}/staff` : `/c/${slug}/staff/login`)
  return { c, actor: actor! }
}
