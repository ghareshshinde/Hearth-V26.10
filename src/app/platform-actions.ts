'use server'
import { timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { makePlatformSession } from '@/lib/auth'
import { platformCookieName } from '@/lib/session'
import { allow } from '@/lib/ratelimit'

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

export async function platformLogout() {
  ;(await cookies()).delete(platformCookieName)
  redirect('/platform')
}
