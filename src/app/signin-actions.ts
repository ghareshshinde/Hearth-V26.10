'use server'
import { timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { makePlatformSession, makeSession, verifyPassword } from '@/lib/auth'
import { homeFor } from '@/lib/access'
import { allow } from '@/lib/ratelimit'
import * as repo from '@/lib/repo'
import { makeStaffSession, verifyStaffLogin } from '@/lib/staff'
import { cookieName, platformCookieName, staffCookieName } from '@/lib/session'

/** Signs out of every level at once: community admin, staff and application admin. */
export async function signOut(slug: string) {
  const jar = await cookies()
  for (const name of [cookieName(slug), staffCookieName(slug), platformCookieName]) jar.delete(name)
  redirect(`/c/${slug}`)
}

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))
const cookie = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 12 * 3600 } as const
const WRONG = { error: 'Wrong username or password' }

/**
 * The one sign-in for everybody. The username decides who is signing in, and the password proves it:
 * "platform" is the application admin, "admin" is the community admin, anything else is a staff login.
 * Each lands on the page their role is allowed to use.
 */
export async function signIn(slug: string | null, _prev: { error?: string } | undefined, form: FormData) {
  const username = String(form.get('username') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  const key = `signin:${slug ?? '-'}:${username}:${(await headers()).get('x-forwarded-for') ?? 'local'}`
  if (!allow(key, 8, 5 * 60_000)) return { error: 'Too many attempts. Try again in a few minutes.' }
  const jar = await cookies()
  const c = slug ? repo.getCommunityBySlug(slug) : undefined

  if (username === 'platform') {
    const secret = process.env.PLATFORM_ADMIN_PASSWORD
    if (!secret || !same(password, secret)) return WRONG
    jar.set(platformCookieName, makePlatformSession(), cookie)
    redirect('/platform')
  }
  if (!slug || !c) return WRONG
  if (username === 'admin') {
    if (!c.admin_hash || !verifyPassword(password, c.admin_hash)) {
      repo.audit(c.id, 'anonymous', 'admin.login_failed', slug)
      return WRONG
    }
    jar.set(cookieName(slug), makeSession(slug), cookie)
    repo.audit(c.id, 'admin', 'admin.login', slug)
    redirect(homeFor({ kind: 'admin' }, slug))
  }
  const s = verifyStaffLogin(c.id, username, password)
  if (!s) return WRONG
  jar.set(staffCookieName(slug), makeStaffSession(slug, s.id), cookie)
  repo.audit(c.id, s.name, 'staff.login', s.username)
  redirect(homeFor({ kind: 'staff', role: s.role, sport: s.sport, eventId: s.event_id }, slug))
}
