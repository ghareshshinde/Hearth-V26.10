import Link from 'next/link'
import { actorWho, getActor } from '@/lib/session'
import { navFor, roleTitle } from '@/lib/access'
import { currentEvent, getEvent } from '@/lib/repo'

/** The menu for whoever is signed in, on every page of the community: only the sections their role may open. */
export default async function RoleBar({ slug, communityId, name }: { slug: string; communityId: number; name: string }) {
  const actor = await getActor(slug)
  const who = actorWho(actor)
  if (!actor || !who) return null
  const ev = (who.kind === 'staff' && who.role === 'event' ? getEvent(communityId, who.eventId ?? 0) : undefined) ?? currentEvent(communityId)
  const links = navFor(who, slug, ev ? { id: ev.id, title: ev.title } : null, ev ? JSON.parse(ev.sports) : [])
  return (
    <nav className="rolebar" aria-label="Your sections">
      <span className="rb-who"><b>{roleTitle(who, actor.platform)}</b>{actor.platform ? '' : ` · ${actor.label}`}</span>
      <span className="rb-crumb">
        {actor.platform && <><Link href="/platform">All communities</Link> › </>}
        <Link href={`/c/${slug}`}>{name}</Link>{ev && <> › <Link href={`/c/${slug}/e/${ev.id}`}>{ev.title}</Link></>}
      </span>
      <span className="rb-links">{links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</span>
    </nav>
  )
}
