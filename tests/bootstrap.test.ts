import { afterEach, describe, expect, it, vi } from 'vitest'

process.env.DATABASE_PATH = ':memory:'
process.env.ADMIN_PASSWORD = 'pw-for-tests'
process.env.SESSION_SECRET = 'test-secret'

import { resetDbForTests } from '@/lib/db'
import * as repo from '@/lib/repo'
import { eventSettings } from '@/lib/registration/rules'

afterEach(() => { resetDbForTests(); vi.unstubAllEnvs() })

describe('first run', () => {
  it('a live site gets only the real community and its real event, no demo data', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEED_DEMO_EVENT', 'false')
    expect(repo.listCommunities().map((c) => c.slug)).toEqual(['jsg'])
    const jsg = repo.getCommunityBySlug('jsg')!
    const events = repo.listEvents(jsg.id)
    expect(events.map((e) => e.title)).toEqual(['JSG Sports Fiesta 2026'])
    expect(events[0].starts_at!.startsWith('2026-12-13')).toBe(true)
    expect(new Date(events[0].cutoff_at!).getTime()).toBeLessThan(new Date(events[0].starts_at!).getTime())
    expect(JSON.parse(events[0].sports)).toHaveLength(6)
  })
  it('the live programme covers every sport, has high-tea at 4:30, finishes play by 6:00 and gives prizes at 6:30', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('SEED_DEMO_EVENT', 'false')
    const ev = repo.listEvents(repo.getCommunityBySlug('jsg')!.id)[0]
    const items = eventSettings(ev.config).itinerary
    const text = items.map((i) => i.title).join(' ')
    for (const sport of JSON.parse(ev.sports) as string[]) expect(text, sport).toContain(sport)
    expect(items.find((i) => i.title.startsWith('High-tea'))?.time).toBe('16:30')
    expect(items.find((i) => i.title.startsWith('All matches end'))?.time).toBe('18:00')
    expect(items.at(-1)).toMatchObject({ time: '18:30', title: 'Prize distribution' })
    expect(items.some((i) => i.time > '14:00' && i.time < '16:30' && i.title.includes('Semi-finals'))).toBe(true)
    expect(new Date(ev.ends_at!).getTime()).toBeGreaterThan(new Date('2026-12-13T13:00:00Z').getTime())
  })
  it('a live site with no settings at all still starts: the admin password is chosen on first visit and a session secret is generated and kept', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_PASSWORD', '')
    vi.stubEnv('SESSION_SECRET', '')
    const jsg = repo.getCommunityBySlug('jsg')!
    expect(jsg.admin_hash).toBe('')
    const { verifyPassword, makeSession, checkSession, resetGeneratedSecretForTests } = await import('@/lib/auth')
    expect(verifyPassword('', jsg.admin_hash)).toBe(false)
    expect(verifyPassword('anything', jsg.admin_hash)).toBe(false)
    const cookie = makeSession('jsg')
    expect(checkSession(cookie, 'jsg')).toBe(true)
    // After a restart the same secret is read back from the database, so signed-in admins stay signed in.
    resetGeneratedSecretForTests()
    expect(checkSession(cookie, 'jsg')).toBe(true)
    expect(checkSession(cookie, 'other')).toBe(false)
  })
  it('development and tests still get the demo community', () => {
    expect(repo.listCommunities().map((c) => c.slug)).toEqual(['jsg', 'kitty-demo'].sort((a, b) => a.localeCompare(b)))
  })
})
