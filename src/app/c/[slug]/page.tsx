import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { requireCommunity } from '@/lib/session'
import { isOpen, listEvents } from '@/lib/repo'
import { formatIst } from '@/lib/time'
import { sportIcon } from '@/lib/sports'
import Pic from '@/components/Pic'
import PageHero from '@/components/PageHero'

export default async function CommunityHome({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const c = await requireCommunity(slug)
  const t = await getTranslations('community')
  const events = listEvents(c.id, true)
  const name = c.brand.name === 'Hearth' ? c.name : c.brand.name
  return (
    <>
      <PageHero logo={c.brand.logo} by={name} title={c.brand.tagline || name} />
      <main>
        <p>{c.about}</p>
        <h2>{t('events')}</h2>
        {events.length === 0 && <p className="muted">{t('noEvents')}</p>}
        <div className="grid">
          {events.map((e) => (
            <article key={e.id} className="ecard">
              <div className="ec-img"><Pic src="/img/celebrate.svg" width={360} height={200} /></div>
              <div className="ec-body">
                <div className="avatars">{(JSON.parse(e.sports) as string[]).slice(0, 6).map((s) => <Pic key={s} src={sportIcon(s)} size={36} style={{ marginLeft: 0 }} />)}</div>
                <h3>{e.title}</h3>
                <p className="muted">{formatIst(e.starts_at)} · {e.venue}</p>
                <Link className="btn" href={`/c/${slug}/e/${e.id}`}>{isOpen(e) ? t('register') : t('closed')}</Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  )
}
