'use server'
import { timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { makePlatformSession } from '@/lib/auth'
import { platformCookieName } from '@/lib/session'
import { allow } from '@/lib/ratelimit'

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/** The application admin password is a server setting (PLATFORM_ADMIN_PASSWORD), never stored in the database. */
export async function platformLogin(_prev: { error?: string } | undefined, form: FormData) {
  const secret = process.env.PLATFORM_ADMIN_PASSWORD
  const ip = (await headers()).get('x-forwarded-for') ?? 'local'
  if (!allow(`platform:${ip}`, 5, 5 * 60_000)) return { error: 'Too many attempts. Try again in a few minutes.' }
  if (!secret || !same(String(form.get('password') ?? ''), secret)) return { error: 'Incorrect password' }
  ;(await cookies()).set(platformCookieName, makePlatformSession(), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 12 * 3600 })
  redirect('/platform')
}
export async function platformLogout() {
  ;(await cookies()).delete(platformCookieName)
  redirect('/platform')
}
