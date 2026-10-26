import { itineraryNow, type ItineraryItem } from '@/lib/registration/rules'
import { formatIst } from '@/lib/time'

export const clock = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}` }

/** What happens when, for every kind of event. On the day it marks what is under way and what is next. */
export default function ItineraryView({ items, startIso, title = 'Programme: what to expect', open = true }: { items: ItineraryItem[]; startIso: string | null; title?: string; open?: boolean }) {
  if (!items.length || !startIso) return null
  const { now, next } = itineraryNow(items, startIso)
  const days = [...new Set(items.map((i) => i.day))]
  const dayName = (d: number) => `Day ${d} · ${formatIst(new Date(new Date(startIso).getTime() + (d - 1) * 86400_000).toISOString(), { weekday: 'long', day: 'numeric', month: 'short' })}`
  return (
    <details className="card itin" open={open || undefined} id="programme">
      <summary>{title}</summary>
      {days.map((d) => (
        <section key={d}>
          {(days.length > 1 || d > 1) && <h3>{dayName(d)}</h3>}
          <ol>
            {items.filter((i) => i.day === d).map((i) => (
              <li key={`${i.day}${i.time}${i.title}`} className={i === now ? 'now' : i === next ? 'next' : undefined}>
                <time>{clock(i.time)}</time>
                <div><strong>{i.title}</strong>{i.note && <span className="muted">{i.note}</span>}</div>
                {i === now && <span className="tag on">Happening now</span>}
                {i === next && <span className="tag">Next</span>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </details>
  )
}
