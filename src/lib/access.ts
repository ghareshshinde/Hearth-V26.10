/**
 * Who may open what. One table, used by every page, every action and the menu bar,
 * so a link that is hidden is also blocked on the server.
 *
 *   admin (platform or community)  everything
 *   event admin                    one event, plus check-in, announcements and sports
 *   common sports admin            every sport, announcements
 *   sport admin                    their own sport, announcements
 *   check-in volunteer             check-in only
 */
export type Scope = 'community' | 'console' | 'event' | 'checkin' | 'announce' | 'sport'
export type Who = { kind: 'admin' } | { kind: 'staff'; role: 'event' | 'sports_all' | 'sport' | 'gate'; sport?: string | null; eventId?: number | null }
type Ctx = { eventId?: number | null; sport?: string }

export function can(who: Who | null, scope: Scope, ctx: Ctx = {}): boolean {
  if (!who) return false
  if (who.kind === 'admin') return true
  switch (who.role) {
    case 'event':
      return scope !== 'community' && (scope !== 'event' || (ctx.eventId != null && ctx.eventId === who.eventId))
    case 'sports_all': return scope === 'sport' || scope === 'announce'
    case 'sport': return scope === 'announce' || (scope === 'sport' && ctx.sport === who.sport)
    case 'gate': return scope === 'checkin'
  }
}

export type NavLink = { label: string; href: string }
const titleOf = (who: Who) => (who.kind === 'admin' ? 'Community admin' : { event: 'Event admin', sports_all: 'Common sports admin', sport: `${who.sport} admin`, gate: 'Check-in volunteer' }[who.role])
export const roleTitle = (who: Who, platform = false) => (platform ? 'Application admin' : titleOf(who))

/** The menu a signed-in person sees: only what their role allows, for the event they work on. */
export function navFor(who: Who, slug: string, event: { id: number; title: string } | null, sports: string[] = []): NavLink[] {
  const c = `/c/${slug}`
  const ev = event ? { eventId: event.id } : {}
  const links: (NavLink & { scope: Scope; ctx?: Ctx })[] = [
    { label: 'Admin home', href: `${c}/admin`, scope: 'console' },
    { label: 'Registrations', href: `${c}/admin/events/${event?.id}/registrations`, scope: 'event', ctx: ev },
    { label: 'Approve', href: `${c}/admin/events/${event?.id}/review`, scope: 'event', ctx: ev },
    { label: 'Games and results', href: `${c}/admin/events/${event?.id}/competitions`, scope: 'event', ctx: ev },
    { label: 'Event settings', href: `${c}/admin/events/${event?.id}`, scope: 'event', ctx: ev },
    { label: 'Check-in', href: `${c}/staff/gate`, scope: 'checkin' },
    ...sports.map((s) => ({ label: s, href: `${c}/staff/sport/${encodeURIComponent(s)}`, scope: 'sport' as const, ctx: { sport: s } })),
    { label: 'Announcements', href: `${c}/staff/announce`, scope: 'announce' },
    { label: 'Branding', href: `${c}/admin/branding`, scope: 'community' },
    { label: 'Staff and logins', href: `${c}/admin/staff`, scope: 'community' },
    { label: 'Audit log', href: `${c}/admin/audit`, scope: 'community' },
  ]
  return links.filter((l) => (l.scope !== 'event' || event) && can(who, l.scope, l.ctx)).map(({ label, href }) => ({ label, href }))
}
