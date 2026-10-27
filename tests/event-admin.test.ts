import { afterEach, describe, expect, it } from 'vitest'
import { DatabaseSync } from 'node:sqlite'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

process.env.ADMIN_PASSWORD = 'pw-for-tests'
process.env.SESSION_SECRET = 'test-secret'

import { getDb, resetDbForTests } from '@/lib/db'
import { createStaff, getStaff } from '@/lib/staff'
import { checkPlatformSession, makePlatformSession } from '@/lib/auth'

let dir = ''
afterEach(() => { resetDbForTests(); if (dir) rmSync(dir, { recursive: true, force: true }); dir = '' })

describe('event admin', () => {
  it('rebuilds a staff table from before the event role, keeping the people already in it', () => {
    dir = mkdtempSync(join(tmpdir(), 'hearth-'))
    const path = join(dir, 'old.db')
    const old = new DatabaseSync(path)
    old.exec(`create table community (id integer primary key autoincrement, slug text); insert into community (slug) values ('x');
      create table staff (id integer primary key autoincrement, community_id integer not null, name text not null,
        role text not null check (role in ('sport','sports_all','gate')), sport text, username text not null, password_hash text not null,
        invite_hash text, invite_expires_at text, active integer not null default 1, created_at text not null default 'x', unique (community_id, username));
      insert into staff (community_id,name,role,sport,username,password_hash) values (1,'Gate One','gate',null,'gate-1','h')`)
    old.close()
    process.env.DATABASE_PATH = path
    resetDbForTests()
    const db = getDb()
    const kept = db.prepare('select name, role, event_id from staff').all() as { name: string; role: string; event_id: number | null }[]
    expect(kept).toEqual([{ name: 'Gate One', role: 'gate', event_id: null }])
    const cid = (db.prepare('select id from community limit 1').get() as { id: number }).id
    const made = createStaff(cid, { name: 'Event lead', role: 'event', eventId: 1 }, new Date(Date.now() + 86400_000).toISOString())
    expect(made.username).toBe('event-1')
    expect(getStaff(cid, made.staff.id)?.event_id).toBe(1)
  })

  it('refuses an event admin without an event', () => {
    process.env.DATABASE_PATH = ':memory:'
    resetDbForTests()
    expect(() => createStaff(1, { name: 'x', role: 'event' }, new Date().toISOString())).toThrow('needs an event')
  })

  it('application admin cookies are their own scope and expire', () => {
    expect(checkPlatformSession(makePlatformSession())).toBe(true)
    expect(checkPlatformSession(makePlatformSession(12, Date.now() - 13 * 3600_000))).toBe(false)
    expect(checkPlatformSession(`platform.${Date.now() + 1e7}.forged`)).toBe(false)
    expect(checkPlatformSession(undefined)).toBe(false)
  })
})
