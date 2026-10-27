import Link from 'next/link'
import { requireCommunity } from '@/lib/session'
import { listEvents, listRows, stats } from '@/lib/repo'
import { adminLogout } from '@/app/actions'
import { formatIst } from '@/lib/time'
import { sportIcon } from '@/lib/sports'
import Pic from '@/components/Pic'

export default async function AdminHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await requireCommunity(slug, true)
  const events = listEvents(c.id)
  return (
    <main>
      <meta httpEquiv="refresh" content="60" />
      <header className="ahead">
        {c.brand.logo && <Pic src={c.brand.logo} size={56} alt="" />}
        <div><h1>Admin console</h1><p className="muted">{c.brand.name === 'Hearth' ? c.name : c.brand.name}</p></div>
        <Link className="btn gold" href={`/c/${slug}/admin/events/new`}>New event</Link>
      </header>
      {process.env.NODE_ENV === 'production' && !process.env.GCS_BUCKET && (
        <p className="warn" role="alert"><strong>Your data is not backed up automatically.</strong> If the host restarts, registrations can be lost. Download a backup often ({'"Download backup"'} below), or set the GCS_BUCKET setting to a Cloud Storage bucket.</p>
      )}
      <nav className="anav">
        <Link href={`/c/${slug}/admin/branding`}>Branding</Link>
        <Link href={`/c/${slug}/admin/staff`}>Staff and check-in</Link>
        <Link href={`/c/${slug}/staff/announce`}>Announcements</Link>
        <Link href={`/c/${slug}/admin/audit`}>Audit log and outbox</Link>
        <Link href={`/c/${slug}/admin/password`}>Change password</Link>
        <a href={`/c/${slug}/admin/backup`}>Download backup</a>
        <form action={adminLogout.bind(null, slug)}><button>Sign out</button></form>
      </nav>
      {events.map((e) => {
        const s = stats(listRows(c.id, e.id))
        return (
          <section key={e.id} className="card acard">
            <div className="ahd">
              <div><h2>{e.title} <span className="tag">{e.status}</span></h2><p className="muted">{formatIst(e.starts_at)} · {e.venue}</p></div>
              <Pic src="/img/trophy.svg" width={56} height={72} />
            </div>
            <div className="kpis">
              {([['Registrations', s.registrations], ['Awaiting approval', s.pending], ['People', s.participants], ['Members', s.members], ['Guests', s.guests], ['Verified', s.verified], ['Arrived', s.arrived]] as const).map(([k, v]) => <div key={k} className="kpi"><b>{v}</b><span>{k}</span></div>)}
            </div>
            {Object.keys(s.waitlisted).length > 0 && <p className="muted">Waitlisted: {Object.entries(s.waitlisted).map(([k, v]) => `${k} ${v}`).join(', ')}</p>}
            <div className="grid">
              <Counts title="Sports" data={s.sports} icons /><Counts title="Diet" data={s.diets} /><Counts title="T-shirt" data={s.tshirts} /><Counts title="Gender" data={s.gender} />
            </div>
            <p className="aact">
              <Link className="btn" href={`/c/${slug}/admin/events/${e.id}/registrations`}>Registrations</Link>{' '}
              <Link className="btn gold" href={`/c/${slug}/admin/events/${e.id}/review`}>Approve ({s.pending})</Link>{' '}
              <Link className="btn outline" href={`/c/${slug}/admin/events/${e.id}/competitions`}>Sports and results</Link>{' '}
              <Link className="btn outline" href={`/c/${slug}/admin/events/${e.id}/feedback`}>Feedback</Link>{' '}
              <Link className="btn outline" href={`/c/${slug}/admin/events/${e.id}/duties`}>Volunteer duties</Link>{' '}
              <Link href={`/c/${slug}/e/${e.id}/board`}>Live board</Link> · <Link href={`/c/${slug}/admin/events/${e.id}`}>Edit event</Link> · <Link href={`/c/${slug}/e/${e.id}`}>Public page</Link>
            </p>
          </section>
        )
      })}
    </main>
  )
}

function Counts({ title, data, icons }: { title: string; data: Record<string, number>; icons?: boolean }) {
  return (
    <div><strong>{title}</strong>
      <table className="data"><tbody>{Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => <tr key={k}><td><span className="person">{icons && <Pic src={sportIcon(k)} size={28} />}{k}</span></td><td>{v}</td></tr>)}</tbody></table>
    </div>
  )
}
