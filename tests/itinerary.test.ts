import { describe, expect, it } from 'vitest'
import { itineraryNow, itineraryToText, parseItinerary, parseItineraryText } from '@/lib/registration/rules'
import { describeSlot, isEventDay, slotMinutes } from '@/lib/time'

const START = '2026-12-13T02:30:00.000Z' // 8:00 am IST

describe('itinerary', () => {
  it('reads one item per line in 12 or 24 hour time, with an optional day and note, sorted by time', () => {
    const items = parseItineraryText('1:30 pm | Lunch\n8 am | Gates open | Bring your ticket\nDay 2 09:30 | Finals\nnonsense line\n25:00 | bad')
    expect(items).toEqual([
      { day: 1, time: '08:00', title: 'Gates open', note: 'Bring your ticket' },
      { day: 1, time: '13:30', title: 'Lunch', note: '' },
      { day: 2, time: '09:30', title: 'Finals', note: '' },
    ])
  })
  it('round-trips through the stored form and the admin text', () => {
    const items = parseItineraryText('8:00 am | Gates open | Tea\n9:00 am | Opening')
    expect(parseItinerary(items)).toEqual(items)
    expect(parseItineraryText(itineraryToText(items))).toEqual(items)
    expect(parseItinerary('junk')).toEqual([])
  })
  it('knows what is on now and what is next, in IST', () => {
    const items = parseItineraryText('8:00 am | Gates open\n9:00 am | Opening\n1:00 pm | Lunch')
    const at = (ist: string) => Date.parse(`2026-12-13T${ist}:00+05:30`)
    expect(itineraryNow(items, START, at('07:00'))).toEqual({ now: undefined, next: items[0] })
    expect(itineraryNow(items, START, at('09:30'))).toEqual({ now: items[1], next: items[2] })
    expect(itineraryNow(items, START, at('14:00'))).toEqual({ now: undefined, next: undefined })
  })
})

describe('match time slots', () => {
  it('orders 9:30 before 10:30, which text sorting gets wrong', () => {
    expect(slotMinutes('9:30')).toBeLessThan(slotMinutes('10:30')!)
    expect(slotMinutes('Court 2')).toBeNull()
  })
  it('shows a readable time and how soon on the event day only', () => {
    const now = Date.parse('2026-12-13T10:00:00+05:30')
    expect(describeSlot('10.30', now, true)).toEqual({ label: '10:30 am', when: 'in 30 min' })
    expect(describeSlot('3 pm', now, true)).toEqual({ label: '3:00 pm', when: '' })
    expect(describeSlot('10.30', now, false)).toEqual({ label: '10:30 am', when: '' })
    expect(describeSlot('after lunch', now, true)).toEqual({ label: 'after lunch', when: '' })
    expect(isEventDay(START, now)).toBe(true)
    expect(isEventDay(START, Date.parse('2026-12-12T10:00:00+05:30'))).toBe(false)
  })
})
