import { rulesFor, type EventRules } from '@/lib/registration/rules'
import { rulebookFor } from '@/lib/rulebook'
import { sportIcon } from '@/lib/sports'
import RulebookTabs from '@/components/RulebookTabs'

type EntryType = 'singles' | 'doubles' | 'team'

/** The organisers' written rules, folded away until opened. Text only, shown exactly as typed. */
export default function RulesView({ rules, sports, sport, entryType, title = 'Rules', open = false, meta, plain }: { rules: EventRules; sports?: string[]; sport?: string; entryType?: EntryType; title?: string; open?: boolean; meta?: Record<string, string>; plain?: boolean }) {
  const blocks: { label: string; text: string }[] = []
  if (!sport && rules.general) blocks.push({ label: 'For everyone', text: rules.general })
  for (const sp of sport ? [sport] : sports ?? []) blocks.push(...rulesFor(rules, sp, entryType))
  if (!sport && sports?.length) {
    const items = sports.map((sp) => ({ sport: sp, icon: sportIcon(sp), meta: meta?.[sp], book: rulebookFor(sp), organiser: rulesFor(rules, sp) }))
    if (plain) return (
      <section id="rules">
        {rules.general && <section className="rb-org"><h3>For everyone at the event</h3><p>{rules.general}</p></section>}
        <RulebookTabs items={items} />
      </section>
    )
    return (
      <details className="card rules" open={open || undefined} id="rules">
        <summary style={{ cursor: 'pointer', fontWeight: 700, minHeight: 44, display: 'flex', alignItems: 'center' }}>{title}</summary>
        {rules.general && <section className="rb-org"><h3>For everyone at the event</h3><p>{rules.general}</p></section>}
        <RulebookTabs items={items} />
      </details>
    )
  }
  if (!blocks.length) return null
  return (
    <details className="card rules" open={open || undefined} id="rules">
      <summary style={{ cursor: 'pointer', fontWeight: 700, minHeight: 44, display: 'flex', alignItems: 'center' }}>{title}</summary>
      {blocks.map((b) => (
        <section key={b.label} style={{ marginTop: '.75rem' }}>
          <h3 style={{ margin: '0 0 .25rem', fontSize: '1rem' }}>{b.label}</h3>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{b.text}</p>
        </section>
      ))}
    </details>
  )
}
