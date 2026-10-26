const IST = 'Asia/Kolkata'
export const formatIst = (iso: string | null, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }) =>
  iso ? new Intl.DateTimeFormat('en-IN', { timeZone: IST, ...opts }).format(new Date(iso)) : ''

/** `datetime-local` value (entered as IST) to ISO UTC. */
export const istInputToIso = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : null)
/** ISO UTC to a `datetime-local` value in IST. */
export function isoToIstInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600_000)
  return d.toISOString().slice(0, 16)
}

/** "9.30 am", "14:05" or "2 pm" as minutes after midnight; anything else (a court name, free text) is null. */
export function slotMinutes(text: string): number | null {
  const m = /^\s*(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?\s*$/i.exec(text)
  if (!m) return null
  let h = Number(m[1]); const min = Number(m[2] ?? 0)
  if (m[3]) h = (h % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0)
  return h > 23 || min > 59 ? null : h * 60 + min
}
/** "10:30 am" for a time slot, with "in 25 min" or "due now" on the event day; other text is shown as typed. */
export function describeSlot(text: string, now = Date.now(), eventDay = false): { label: string; when: string } {
  const mins = slotMinutes(text)
  if (mins === null) return { label: text, when: '' }
  const h = Math.floor(mins / 60), label = `${h % 12 || 12}:${String(mins % 60).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`
  if (!eventDay) return { label, when: '' }
  const ist = new Date(now + 5.5 * 3600_000), diff = mins - (ist.getUTCHours() * 60 + ist.getUTCMinutes())
  return { label, when: diff > 0 && diff <= 120 ? `in ${diff} min` : diff <= 0 && diff > -30 ? 'due now' : '' }
}
/** Whether `now` falls on the same IST calendar day as the event start. */
export const isEventDay = (startIso: string | null, now = Date.now()) =>
  !!startIso && new Date(new Date(startIso).getTime() + 5.5 * 3600_000).toISOString().slice(0, 10) === new Date(now + 5.5 * 3600_000).toISOString().slice(0, 10)

/** The current time in ms; server pages read the clock through this so rendering code stays free of direct clock calls. */
export const clockNow = () => Date.now()

