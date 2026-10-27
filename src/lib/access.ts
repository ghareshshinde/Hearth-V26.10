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

/** The first page each role sees after signing in. */
export function homeFor(who: Who, slug: string): string {
  if (who.kind === 'admin' || who.role === 'event') return `/c/${slug}/admin`
  return who.role === 'sport' && who.sport ? `/c/${slug}/staff/sport/${encodeURIComponent(who.sport)}` : `/c/${slug}/staff`
}

export type NavLink = { label: string; href: string }
const titleOf = (who: Who) => (who.kind === 'admin' ? 'Community admin' : { event: 'Event admin', sports_all: 'Common sports admin', sport: `${who.sport} admin`, gate: 'Check-in volunteer' }[who.role])
export const roleTitle = (who: Who, platform = false) => (platform ? 'Application admin' : titleOf(who))

/** One entry in the menu bar: a plain link when it holds one page, a drop-down when it holds several. */
export type NavGroup = { label: string; links: NavLink[] }

/** The menu a signed-in person sees: only what their role allows, grouped by what it is for. */
export function navFor(who: Who, slug: string, event: { id: number; title: string } | null, sports: string[] = []): NavGroup[] {
  const c = `/c/${slug}`
  const ev = event ? { eventId: event.id } : {}
  const e = `${c}/admin/events/${event?.id}`
  const links: (NavLink & { group: string; scope: Scope; ctx?: Ctx })[] = [
    { group: 'Home', label: 'Admin home', href: `${c}/admin`, scope: 'console' },
    { group: 'Event', label: 'Registrations', href: `${e}/registrations`, scope: 'event', ctx: ev },
    { group: 'Event', label: 'Approve', href: `${e}/review`, scope: 'event', ctx: ev },
    { group: 'Event', label: 'Games and results', href: `${e}/competitions`, scope: 'event', ctx: ev },
    { group: 'Event', label: 'Event settings', href: e, scope: 'event', ctx: ev },
    { group: 'On the day', label: 'Check-in', href: `${c}/staff/gate`, scope: 'checkin' },
    ...sports.map((s) => ({ group: 'Sports', label: s, href: `${c}/staff/sport/${encodeURIComponent(s)}`, scope: 'sport' as const, ctx: { sport: s } })),
    { group: 'On the day', label: 'Announcements', href: `${c}/staff/announce`, scope: 'announce' },
    { group: 'Community', label: 'Branding', href: `${c}/admin/branding`, scope: 'community' },
    { group: 'Community', label: 'Staff and logins', href: `${c}/admin/staff`, scope: 'community' },
    { group: 'Community', label: 'Audit log', href: `${c}/admin/audit`, scope: 'community' },
  ]
  const groups: NavGroup[] = []
  for (const l of links) {
    if ((l.scope === 'event' && !event) || !can(who, l.scope, l.ctx)) continue
    const g = groups.find((x) => x.label === l.group) ?? groups[groups.push({ label: l.group, links: [] }) - 1]
    g.links.push({ label: l.label, href: l.href })
  }
  return groups
}
