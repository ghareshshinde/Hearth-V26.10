import { beforeEach, describe, expect, it } from 'vitest'

process.env.DATABASE_PATH = ':memory:'
process.env.ADMIN_PASSWORD = 'pw-for-tests'
process.env.SESSION_SECRET = 'test-secret'

import { resetDbForTests } from '@/lib/db'
import * as repo from '@/lib/repo'
import { blankRow, type ParticipantInput } from '@/lib/registration/rules'

const contact = { registrantName: 'Asha Shah', registrantMobile: '9876543210', registrantEmail: 'asha@example.test', emergencyName: 'Uncle Mohan', emergencyMobile: '9123456780', waiver: true as const }
const person = (o: Partial<ParticipantInput> = {}): ParticipantInput => ({ ...blankRow(), name: 'Asha Shah', age: '34', gender: 'Female', mobile: '9876543210', sports: ['Chess'], skill: 'casual', ...o })

let jsg: NonNullable<ReturnType<typeof repo.getCommunityBySlug>>
let ev: repo.EventRow

function register() {
  const r = repo.createRegistration(ev, contact, [person(), person({ name: 'Guest One', mobile: '9000000001', kind: 'guest' })])
  if (!r.ok) throw new Error('setup')
  return repo.getRegistrationByToken(r.token)!
}

beforeEach(() => {
  resetDbForTests()
  jsg = repo.getCommunityBySlug('jsg')!
  ev = repo.listEvents(jsg.id)[0]
})

describe('guest donation collected offline', () => {
  it('records a guest donation once, counts it, and can undo it', () => {
    const reg = register()
    const [member, guest] = repo.listParticipantsOfRegistration(jsg.id, reg.id)
    expect(repo.setDonation(jsg.id, guest.id, 'Gate 1', true)).toBe(true)
    expect(repo.setDonation(jsg.id, guest.id, 'Gate 2', true)).toBe(false)
    const after = repo.listParticipantsOfRegistration(jsg.id, reg.id)[1]
    expect(after.donation_collected_by).toBe('Gate 1')
    expect(repo.stats(repo.listRows(jsg.id, ev.id)).donations).toBe(1)
    expect(repo.setDonation(jsg.id, guest.id, 'Gate 1', false)).toBe(true)
    expect(repo.stats(repo.listRows(jsg.id, ev.id)).donations).toBe(0)
    expect(repo.setDonation(jsg.id, member.id, 'Gate 1', true)).toBe(false)
  })
  it('keeps the donation when the registrant edits the same guest', () => {
    const reg = register()
    const guest = repo.listParticipantsOfRegistration(jsg.id, reg.id)[1]
    repo.setDonation(jsg.id, guest.id, 'Gate 1', true)
    const r = repo.updateRegistration(ev, reg, contact, [person(), person({ name: 'Guest One', mobile: '9000000001', kind: 'guest', sports: ['Carrom'] })])
    expect(r.ok).toBe(true)
    expect(repo.stats(repo.listRows(jsg.id, ev.id)).donations).toBe(1)
  })
  it('covers a walk-in guest the same way', () => {
    const reg = register()
    const w = repo.addWalkIn({ ...ev, config: JSON.stringify({ spot: { open: true, cap: 0 } }) }, { person: person({ name: 'Walk In', mobile: '9000000002', kind: 'guest' }), registrationId: reg.id, waiver: true, by: 'Gate 1', gate: 'Main' })
    if (!w.ok) throw new Error('walk-in')
    expect(repo.setDonation(jsg.id, w.participantId, 'Gate 1', true)).toBe(true)
  })
})
