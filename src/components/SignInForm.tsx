'use client'
import { useActionState } from 'react'
import { signIn } from '@/app/signin-actions'

/** Everybody signs in here; the username decides which level of the admin panel they land on. */
export default function SignInForm({ slug }: { slug: string | null }) {
  const [state, action, pending] = useActionState(signIn.bind(null, slug), undefined)
  return (
    <form action={action} className="card" style={{ maxWidth: '24rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <label>Username<input name="username" autoComplete="username" autoCapitalize="none" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <p className="muted" style={{ margin: 0 }}>{slug ? 'Community admins use the username admin. Everyone else uses the username they were given.' : 'The application admin uses the username platform.'}</p>
      {state?.error && <p role="alert" className="cellerr">{state.error}</p>}
      <p style={{ margin: 0 }}><button className="btn" disabled={pending}>Sign in</button></p>
    </form>
  )
}
