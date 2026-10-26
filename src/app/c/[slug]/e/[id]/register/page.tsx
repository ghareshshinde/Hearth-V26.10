import { notFound, redirect } from 'next/navigation'
import { requireCommunity } from '@/lib/session'
import { getEvent, isOpen, seatsLeft } from '@/lib/repo'
import RulesView from '@/components/RulesView'
import ItineraryView from '@/components/ItineraryView'
import Pic from '@/components/Pic'
import { formatIst } from '@/lib/time'
import { sportIcon } from '@/lib/sports'
import { columnConfig, eventSettings, rulesFor } from '@/lib/registration/rules'
import { submitRegistration } from '@/app/actions'
import RegistrationForm from '@/components/RegistrationForm'

const Ico = ({ d }: { d: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>

export default async function Register({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params
  const c = await requireCommunity(slug)
  const ev = getEvent(c.id, Number(id))
  if (!ev || ev.status === 'draft') notFound()
  if (!isOpen(ev)) redirect(`/c/${slug}/e/${id}`)
  const settings = eventSettings(ev.config)
  const sports = JSON.parse(ev.sports) as string[]
  const sportRules = Object.fromEntries(sports.map((s) => [s, rulesFor(settings.rules, s).map((b) => b.text).join('\n\n')]).filter(([, t]) => t))
  return (
    <>
      <section className="rhero">
        <div className="rh-l">
          <div className="rh-by">
            {c.brand.logo && <Pic src={c.brand.logo} size={88} alt={c.brand.name} />}
            <p>Presented by<b>{c.brand.name === 'Hearth' ? c.name : c.brand.name}</b></p>
          </div>
          <h1>Register for {ev.title}</h1>
          <div className="rh-facts">
            <span><Ico d="M3 6h18v15H3zM16 2v4M8 2v4M3 10h18" />{formatIst(ev.starts_at)}</span>
            <span><Ico d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0zM12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z" />{ev.venue}</span>
            {ev.cutoff_at && <span className="warm"><Ico d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2" />Registration closes {formatIst(ev.cutoff_at)}</span>}
          </div>
        </div>
        <div className="rh-r">
          <Pic src="/img/trophy.svg" width={150} height={192} />
          <div className="rh-coll">{sports.map((sp) => <div key={sp}><Pic src={sportIcon(sp)} size={64} alt={sp} /></div>)}</div>
        </div>
      </section>
      <main className="wide">
        <ItineraryView items={settings.itinerary} startIso={ev.starts_at} image="/img/celebrate.svg" />
        <RulesView rules={settings.rules} sports={sports} title="Read the rules before you register" />
        <RegistrationForm
          slug={slug} eventId={ev.id} sports={sports} rules={sportRules} columns={columnConfig(ev.config)} ages={settings.ages} diets={settings.diets} questions={settings.questions} waiver={settings.waiver} emailRequired={settings.contactEmailRequired} seatsLeft={seatsLeft(ev)}
          submit={submitRegistration.bind(null, slug, ev.id)} submitLabel="Submit registration"
        />
      </main>
    </>
  )
}
