import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireCommunity } from '@/lib/session'
import { getCommunityBySlug, getEvent, isOpen, seatsLeft } from '@/lib/repo'
import { formatIst } from '@/lib/time'
import { googleCalendarUrl } from '@/lib/calendar'
import { sportIcon } from '@/lib/sports'
import { eventSettings } from '@/lib/registration/rules'
import ShareButton from '@/components/ShareButton'
import RulesView from '@/components/RulesView'
import ItineraryView from '@/components/ItineraryView'
import Pic from '@/components/Pic'
import PageHero, { Ico } from '@/components/PageHero'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params
  const c = getCommunityBySlug(slug)
  const ev = c && getEvent(c.id, Number(id))
  if (!c || !ev || ev.status === 'draft') return {}
  const base = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return {
    metadataBase: new URL(base),
    title: ev.title,
    description: `${ev.venue ? `${ev.venue}. ` : ''}Register your family for ${ev.title}.`,
    openGraph: { title: ev.title, description: `Register your family for ${ev.title}.`, images: c.brand.logo ? [c.brand.logo] : [] },
  }
}

export default async function EventPage({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params
  const c = await requireCommunity(slug)
  const ev = getEvent(c.id, Number(id))
  if (!ev || ev.status === 'draft') notFound()
  const sports = JSON.parse(ev.sports) as string[]
  const left = seatsLeft(ev)
  const settings = eventSettings(ev.config)
  const open = isOpen(ev)
  return (
    <>
      <PageHero
        logo={c.brand.logo} by={c.brand.name === 'Hearth' ? c.name : c.brand.name} title={ev.title} sports={sports}
        facts={[{ icon: 'when', text: formatIst(ev.starts_at) }, { icon: 'where', text: ev.venue }, ...(ev.cutoff_at ? [{ icon: 'clock' as const, text: `Register and edit until ${formatIst(ev.cutoff_at)}`, warm: true }] : [])]}
        actions={<>
          {open ? <Link className="btn gold" href={`/c/${slug}/e/${id}/register`}>Register your family</Link> : <span className="badge">Registration closed</span>}
          <a className="btn ghost" href={`/c/${slug}/e/${id}/calendar.ics`}>Add to calendar</a>
          <ShareButton title={ev.title} className="btn ghost" />
          {ev.map_url && <a className="btn ghost" href={ev.map_url} target="_blank" rel="noreferrer">Open map</a>}
        </>}
      />
      <main>
        <nav className="qlinks" aria-label="Quick links">
          {[
            { href: `/c/${slug}/my`, d: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z', title: 'Find my registration', sub: 'Get your QR ticket, edit or cancel' },
            { href: `/c/${slug}/e/${id}/results`, d: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM17 5h3v2a3 3 0 01-3 3M7 5H4v2a3 3 0 003 3', title: 'Live results', sub: 'Scores and winners' },
            { href: `/c/${slug}/e/${id}/board`, d: 'M2 5h20v13H2zM8 21h8M12 18v3', title: 'Live board', sub: 'Matches on now, for the big screen' },
          ].map((l) => <Link key={l.href} href={l.href}><span className="ql-ico"><Ico d={l.d} /></span><span><b>{l.title}</b><small>{l.sub}</small></span></Link>)}
        </nav>
        {ev.description && <p style={{ whiteSpace: 'pre-wrap' }}>{ev.description}</p>}

        <ItineraryView items={settings.itinerary} startIso={ev.starts_at} image="/img/celebrate.svg" />

        <h2>Games and rules</h2>
        <p className="muted">Pick a game to read how it is played at this event.</p>
        <RulesView plain rules={settings.rules} sports={sports} meta={Object.fromEntries(sports.map((s) => [s, [settings.ages[s] && `Ages ${settings.ages[s].min ?? 1} to ${settings.ages[s].max ?? 99}`, left[s] === 0 && 'Full: waitlist'].filter(Boolean).join(' · ')]))} />

        <h2>Three steps</h2>
        <div className="steps">
          <div className="step"><div className="pic avatars">{['avatar-1', 'avatar-2', 'avatar-3'].map((a) => <Pic key={a} src={`/img/${a}.svg`} size={84} />)}</div><div className="txt"><strong>1. Add your family</strong><p className="muted" style={{ margin: '.25rem 0 0' }}>One row per person, then pick their games.</p></div></div>
          <div className="step"><div className="pic"><Pic src="/img/camera.svg" size={110} /></div><div className="txt"><strong>2. Mark Member or Guest</strong><p className="muted" style={{ margin: '.25rem 0 0' }}>Organisers verify your choice.</p></div></div>
          <div className="step"><div className="pic" style={{ padding: 0 }}><Pic src="/img/celebrate.svg" width={360} height={200} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div><div className="txt"><strong>3. Save your link</strong><p className="muted" style={{ margin: '.25rem 0 0' }}>Edit or cancel any time before the cut-off.</p></div></div>
        </div>
      </main>
    </>
  )
}
