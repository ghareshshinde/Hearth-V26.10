import Link from 'next/link'
import { cookies } from 'next/headers'
import { checkPlatformSession } from '@/lib/auth'
import { listCommunities, listEvents } from '@/lib/repo'
import { platformCookieName } from '@/lib/session'
import { platformLogout } from '@/app/platform-actions'
import SignInForm from '@/components/SignInForm'

export const dynamic = 'force-dynamic'

export default async function Platform() {
  if (!checkPlatformSession((await cookies()).get(platformCookieName)?.value)) {
    return (
      <main>
        <h1>Application admin</h1>
        {process.env.PLATFORM_ADMIN_PASSWORD ? <SignInForm slug={null} /> : <p className="warn">Not switched on. Set PLATFORM_ADMIN_PASSWORD on the server to use this page.</p>}
        <p><Link href="/">Back to Hearth</Link></p>
      </main>
    )
  }
  return (
    <main>
      <header className="ahead"><div><h1>Application admin</h1><p className="muted">Every community on this Hearth</p></div></header>
      <nav className="anav"><Link href="/">Public directory</Link><form action={platformLogout}><button>Sign out</button></form></nav>
      <div className="grid">
        {listCommunities().map((c) => (
          <article key={c.id} className="card">
            <h3 style={{ marginTop: 0 }}>{c.name}</h3>
            <p className="muted">{listEvents(c.id).length} events</p>
            <p className="aact"><Link className="btn" href={`/c/${c.slug}/admin`}>Open admin</Link><Link href={`/c/${c.slug}`}>Public page</Link></p>
          </article>
        ))}
      </div>
    </main>
  )
}
