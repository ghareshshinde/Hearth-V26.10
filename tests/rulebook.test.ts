import { describe, expect, it } from 'vitest'
import { RULEBOOKS, rulebookFor } from '@/lib/rulebook'

describe('rulebook', () => {
  it('covers every sport of the first event and finds them whatever the capitals', () => {
    for (const s of ['Chess', 'Carrom', 'Cricket', 'Badminton', 'Table Tennis', 'Pickleball']) expect(rulebookFor(` ${s.toUpperCase()} `)).toBeDefined()
    expect(rulebookFor('Kabaddi')).toBeUndefined()
  })
  it('every sport links to its full rulebook and has rules to show', () => {
    for (const [sport, b] of Object.entries(RULEBOOKS)) {
      expect(b.url, sport).toMatch(/^https:\/\//)
      expect(b.groups.length, sport).toBeGreaterThan(2)
      expect(b.groups.every((g) => g.items.length > 0), sport).toBe(true)
      expect(b.variations.length, sport).toBeGreaterThan(0)
    }
  })
  it('sports whose rules differ for singles and doubles have both, and the rest have neither', () => {
    const forms = (s: string) => new Set(rulebookFor(s)!.groups.map((g) => g.for).filter(Boolean))
    for (const s of ['Badminton', 'Table Tennis', 'Pickleball']) expect([...forms(s)].sort(), s).toEqual(['doubles', 'singles'])
    for (const s of ['Chess', 'Cricket']) expect(forms(s).size, s).toBe(0)
  })
})
