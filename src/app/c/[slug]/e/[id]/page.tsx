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
import PageHero from '@/components/PageHero'

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
        {ev.description && <p style={{ whiteSpace: 'pre-wrap' }}>{ev.description}</p>}

        <ItineraryView items={settings.itinerary} startIso={ev.starts_at} image="/img/celebrate.svg" />

        <h2>Pick your games</h2>
        <div className="tiles">
          {sports.map((s) => {
            const age = settings.ages[s]
            return (
              <div key={s} className="tile">
                <Pic src={sportIcon(s)} size={96} />
                <strong>{s}</strong>
                {age && <small className="muted">Ages {age.min ?? 1} to {age.max ?? 99}</small>}
                {left[s] === 0 && <small className="wl">Full: waitlist</small>}
              </div>
            )
          })}
        </div>

        <RulesView rules={settings.rules} sports={sports} title="Rules of the event and of each game" />

        <p><Link href={`/c/${slug}/e/${id}/results`}>Live results and winners</Link> · <Link href={`/c/${slug}/e/${id}/board`}>Live board (for the big screen)</Link></p>
        <p className="muted">Already registered? <Link href={`/c/${slug}/my`}>Find my registration and QR ticket</Link></p>

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
