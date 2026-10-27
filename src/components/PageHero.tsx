import type { ReactNode } from 'react'
import Pic from '@/components/Pic'
import { sportIcon } from '@/lib/sports'

export const Ico = ({ d }: { d: string }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>

export const ICONS = {
  when: 'M3 6h18v15H3zM16 2v4M8 2v4M3 10h18',
  where: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0116 0zM12 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z',
  clock: 'M12 2a10 10 0 100 20 10 10 0 000-20zM12 6v6l4 2',
}

/** The page header every public page shares: who presents it, the title, key facts, and a picture panel. */
export default function PageHero({ logo, by, title, facts = [], sports = [], actions, trophy = true }: {
  logo?: string | null; by: string; title: string; sports?: string[]; actions?: ReactNode; trophy?: boolean
  facts?: { icon: keyof typeof ICONS; text: string; warm?: boolean }[]
}) {
  return (
    <section className="rhero">
      <div className="rh-l">
        <div className="rh-by">
          {logo && <Pic src={logo} size={88} alt={by} />}
          <p>Presented by<b>{by}</b></p>
        </div>
        <h1>{title}</h1>
        {facts.length > 0 && (
          <div className="rh-facts">
            {facts.map((f) => <span key={f.text} className={f.warm ? 'warm' : undefined}><Ico d={ICONS[f.icon]} />{f.text}</span>)}
          </div>
        )}
        {actions && <div className="rh-actions">{actions}</div>}
      </div>
      <div className="rh-r">
        {trophy && <Pic src="/img/trophy.svg" width={150} height={192} />}
        {sports.length > 0 && <div className="rh-coll">{sports.slice(0, 6).map((sp) => <div key={sp}><Pic src={sportIcon(sp)} size={64} alt={sp} /></div>)}</div>}
      </div>
    </section>
  )
}
