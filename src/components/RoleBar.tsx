import Link from 'next/link'
import { actorWho, getActor } from '@/lib/session'
import { navFor, roleTitle } from '@/lib/access'
import { currentEvent, getEvent } from '@/lib/repo'
import { signOut } from '@/app/signin-actions'

/** The header menu for whoever is signed in, on every page of the community: only the sections their role may open, grouped. */
export default async function RoleBar({ slug, communityId }: { slug: string; communityId: number }) {
  const actor = await getActor(slug)
  const who = actorWho(actor)
  if (!actor || !who) return null
  const ev = (who.kind === 'staff' && who.role === 'event' ? getEvent(communityId, who.eventId ?? 0) : undefined) ?? currentEvent(communityId)
  const groups = navFor(who, slug, ev ? { id: ev.id, title: ev.title } : null, ev ? JSON.parse(ev.sports) : [])
  return (
    <nav className="hnav" aria-label="Your sections">
      {groups.map((g) => g.links.length === 1
        ? <Link key={g.label} href={g.links[0].href}>{g.links[0].label}</Link>
        : (
          <details key={g.label} name="hnav" className="hn-menu">
            <summary>{g.label}</summary>
            <div>{g.label === 'Event' && ev && <small>{ev.title}</small>}{g.links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}</div>
          </details>
        ))}
      <details name="hnav" className="hn-menu hn-acct">
        <summary>{roleTitle(who, actor.platform)}</summary>
        <div>
          {!actor.platform && <small>{actor.label}</small>}
          {actor.platform && <Link href="/platform">All communities</Link>}
          <Link href={`/c/${slug}`}>Public page</Link>
          <form action={signOut.bind(null, slug)}><button>Sign out</button></form>
        </div>
      </details>
    </nav>
  )
}
