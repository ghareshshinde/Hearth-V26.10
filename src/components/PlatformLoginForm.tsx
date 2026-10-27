'use client'
import { useActionState } from 'react'
import { platformLogin } from '@/app/platform-actions'

export default function PlatformLoginForm() {
  const [state, action, pending] = useActionState(platformLogin, undefined)
  return (
    <form action={action} className="card" style={{ maxWidth: '22rem' }}>
      <label>Application admin password<input name="password" type="password" autoComplete="current-password" required /></label>
      {state?.error && <p role="alert" className="cellerr">{state.error}</p>}
      <p><button className="btn" disabled={pending}>Sign in</button></p>
    </form>
  )
}
