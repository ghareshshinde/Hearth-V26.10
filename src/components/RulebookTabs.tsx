'use client'
import { useState } from 'react'
import type { Rulebook } from '@/lib/rulebook'
import Pic from '@/components/Pic'

export type SportRules = { sport: string; icon: string; meta?: string; book?: Rulebook; organiser: { label: string; text: string }[] }

/** One tab per game: the organisers' own rules first, then the governing body's rules in plain words. */
export default function RulebookTabs({ items }: { items: SportRules[] }) {
  const [i, setI] = useState(0)
  const [mode, setMode] = useState<'singles' | 'doubles'>('singles')
  const cur = items[i]
  const split = !!cur.book?.groups.some((g) => g.for)
  return (
    <div className="rb">
      <div className="rb-tabs" role="tablist" aria-label="Rules by game">
        {items.map((it, n) => (
          <button key={it.sport} type="button" role="tab" id={`rb-tab-${n}`} aria-selected={n === i} aria-controls="rb-panel" className={n === i ? 'on' : undefined} onClick={() => setI(n)}>
            <Pic src={it.icon} size={34} alt="" /><span>{it.sport}{it.meta && <small>{it.meta}</small>}</span>
          </button>
        ))}
      </div>
      <div className="rb-panel" role="tabpanel" id="rb-panel" aria-labelledby={`rb-tab-${i}`}>
        {cur.organiser.length > 0 && (
          <section className="rb-org">
            <h3>Set by the organisers for this event</h3>
            {cur.organiser.map((o) => <div key={o.label}>{cur.organiser.length > 1 && <strong>{o.label}</strong>}<p>{o.text}</p></div>)}
            <p className="muted">If anything below differs, the organisers’ rules apply.</p>
          </section>
        )}
        {cur.book ? (
          <>
            <p className="rb-src">
              <span className={cur.book.status === 'checked' ? 'chip ok' : 'chip'}>{cur.book.status === 'checked' ? 'Checked against the official text' : 'Standard rules, organisers to confirm'}</span>
              {' '}Based on the {cur.book.body}, {cur.book.edition}. <a href={cur.book.url} target="_blank" rel="noreferrer">Read the full rulebook</a>
            </p>
            {split && (
              <div className="rb-mode" role="group" aria-label="Singles or doubles">
                {(['singles', 'doubles'] as const).map((m) => <button key={m} type="button" aria-pressed={mode === m} className={mode === m ? 'on' : undefined} onClick={() => setMode(m)}>{m === 'singles' ? 'Singles' : 'Doubles'}</button>)}
                <span className="muted">Rules that differ are shown for the one you pick.</span>
              </div>
            )}
            <div className="rb-groups">
              {cur.book.groups.filter((g) => !g.for || g.for === mode).map((g) => (
                <section key={g.title}>
                  <h4>{g.title}</h4>
                  <ul>{g.items.map((t) => <li key={t}>{t}</li>)}</ul>
                </section>
              ))}
            </div>
            <section className="rb-var">
              <h4>Common ways community events adapt the game</h4>
              <ul>{cur.book.variations.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          </>
        ) : cur.organiser.length === 0 && <p className="muted">The organisers have not published rules for this game yet.</p>}
      </div>
    </div>
  )
}
