import { NextRequest, NextResponse } from 'next/server'
import * as repo from '@/lib/repo'
import { allow } from '@/lib/ratelimit'
import { deliverEmails } from '@/lib/mail'
import { persist } from '@/lib/persist'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, eventId, contact, rows } = body
    const c = repo.getCommunityBySlug(slug)
    const ev = c && repo.getEvent(c.id, Number(eventId))
    if (!c || !ev) return NextResponse.json({ ok: false, error: 'Event not found' }, { status: 404 })

    const forwarded = req.headers.get('x-forwarded-for') ?? 'local'
    const ip = forwarded.split(',')[0].trim()
    if (!allow(`reg:${ip}`, 100, 10 * 60_000)) {
      return NextResponse.json({ ok: false, error: 'Too many registrations from this connection. Please wait a few minutes and try again.' }, { status: 429 })
    }

    const effectiveToken = String(body.token || body.contact?.token || '').trim()
    if (effectiveToken) {
      let reg = repo.getRegistrationByToken(effectiveToken)
      if (!reg) {
        try {
          const dec = decodeURIComponent(effectiveToken)
          if (dec !== effectiveToken) reg = repo.getRegistrationByToken(dec)
        } catch { /* ignore */ }
      }
      if (!reg && body.contact?.registrantMobile && c) {
        const found = repo.findTokenByMobile(c.id, body.contact.registrantMobile)
        if (found) reg = repo.getRegistrationByToken(found)
      }
      const ev = reg && repo.getEvent(reg.community_id, reg.event_id)
      if (!reg || !ev) {
        return NextResponse.json({ ok: false, error: 'Registration not found' }, { status: 404 })
      }
      const r = repo.updateRegistration(ev, reg, contact, rows)
      if (!r.ok) return NextResponse.json(r)
      try {
        await persist()
      } catch (e) {
        console.error('persist failed', e)
        return NextResponse.json({ ok: false, error: 'We could not store this safely. Please try again in a minute.' }, { status: 500 })
      }
      return NextResponse.json(r)
    }

    const r = repo.createRegistration(ev, contact, rows)
    if (!r.ok) return NextResponse.json(r)

    try {
      await persist()
    } catch (e) {
      console.error('persist failed', e)
      return NextResponse.json({ ok: false, error: 'We could not store this safely. Please try again in a minute.' }, { status: 500 })
    }

    await deliverEmails()
    return NextResponse.json(r)
  } catch (err: unknown) {
    console.error('Registration API error:', err)
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
