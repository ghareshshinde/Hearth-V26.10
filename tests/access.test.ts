import { describe, expect, it } from 'vitest'
import { can, homeFor, navFor, type Who } from '@/lib/access'

const admin: Who = { kind: 'admin' }
const eventAdmin: Who = { kind: 'staff', role: 'event', eventId: 7 }
const allSports: Who = { kind: 'staff', role: 'sports_all' }
const chess: Who = { kind: 'staff', role: 'sport', sport: 'Chess' }
const gate: Who = { kind: 'staff', role: 'gate' }

describe('access', () => {
  it('nobody signed in can open nothing', () => {
    for (const s of ['community', 'console', 'event', 'checkin', 'announce', 'sport'] as const) expect(can(null, s, { eventId: 7, sport: 'Chess' })).toBe(false)
  })
  it('an admin can open everything', () => {
    expect(can(admin, 'community')).toBe(true)
    expect(can(admin, 'event', { eventId: 99 })).toBe(true)
  })
  it('an event admin is locked to their own event and cannot touch community settings', () => {
    expect(can(eventAdmin, 'event', { eventId: 7 })).toBe(true)
    expect(can(eventAdmin, 'event', { eventId: 8 })).toBe(false)
    expect(can(eventAdmin, 'event')).toBe(false)
    expect(can(eventAdmin, 'community')).toBe(false)
    expect(can(eventAdmin, 'console')).toBe(true)
    expect(can(eventAdmin, 'checkin')).toBe(true)
    expect(can(eventAdmin, 'sport', { sport: 'Carrom' })).toBe(true)
  })
  it('a sport admin sees only their sport, a common sports admin sees all, neither sees admin pages', () => {
    expect(can(chess, 'sport', { sport: 'Chess' })).toBe(true)
    expect(can(chess, 'sport', { sport: 'Carrom' })).toBe(false)
    expect(can(allSports, 'sport', { sport: 'Carrom' })).toBe(true)
    for (const w of [chess, allSports]) {
      expect(can(w, 'event', { eventId: 7 })).toBe(false)
      expect(can(w, 'console')).toBe(false)
      expect(can(w, 'checkin')).toBe(false)
      expect(can(w, 'announce')).toBe(true)
    }
  })
  it('a check-in volunteer can only check people in', () => {
    expect(can(gate, 'checkin')).toBe(true)
    for (const s of ['community', 'console', 'event', 'announce', 'sport'] as const) expect(can(gate, s, { eventId: 7, sport: 'Chess' })).toBe(false)
  })
  it('the menu lists exactly what the role may open', () => {
    const ev = { id: 7, title: 'Fiesta' }
    const labels = (w: Who) => navFor(w, 'jsg', ev, ['Chess', 'Carrom']).flatMap((g) => g.links.map((l) => l.label))
    expect(labels(admin)).toContain('Branding')
    expect(labels(eventAdmin)).toEqual(expect.arrayContaining(['Registrations', 'Check-in', 'Chess']))
    expect(labels(eventAdmin)).not.toContain('Branding')
    expect(labels(chess)).toEqual(['Chess', 'Announcements'])
    expect(labels(gate)).toEqual(['Check-in'])
  })
  it('the menu stays short: a handful of groups, not a row of every page', () => {
    const top = navFor(admin, 'jsg', { id: 7, title: 'Fiesta' }, ['Chess', 'Carrom', 'Cricket', 'Badminton', 'Table Tennis', 'Pickleball']).map((g) => g.label)
    expect(top).toEqual(['Home', 'Event', 'On the day', 'Sports', 'Community'])
  })
  it('each role lands on the page it may use after signing in', () => {
    expect(homeFor(admin, 'jsg')).toBe('/c/jsg/admin')
    expect(homeFor(eventAdmin, 'jsg')).toBe('/c/jsg/admin')
    expect(homeFor({ kind: 'staff', role: 'sport', sport: 'Table Tennis' }, 'jsg')).toBe('/c/jsg/staff/sport/Table%20Tennis')
    expect(homeFor(allSports, 'jsg')).toBe('/c/jsg/staff')
    expect(homeFor(gate, 'jsg')).toBe('/c/jsg/staff')
  })
})
