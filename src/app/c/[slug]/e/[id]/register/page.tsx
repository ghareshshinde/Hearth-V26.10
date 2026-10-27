import { notFound, redirect } from 'next/navigation'
import { requireCommunity } from '@/lib/session'
import { getEvent, isOpen, seatsLeft } from '@/lib/repo'
import RulesView from '@/components/RulesView'
import ItineraryView from '@/components/ItineraryView'
import PageHero from '@/components/PageHero'
import { formatIst } from '@/lib/time'
import { columnConfig, eventSettings, rulesFor } from '@/lib/registration/rules'
import { submitRegistration } from '@/app/actions'
import RegistrationForm from '@/components/RegistrationForm'

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
      <PageHero
        logo={c.brand.logo} by={c.brand.name === 'Hearth' ? c.name : c.brand.name} title={`Register for ${ev.title}`} sports={sports}
        facts={[{ icon: 'when', text: formatIst(ev.starts_at) }, { icon: 'where', text: ev.venue }, ...(ev.cutoff_at ? [{ icon: 'clock' as const, text: `Registration closes ${formatIst(ev.cutoff_at)}`, warm: true }] : [])]}
      />
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
