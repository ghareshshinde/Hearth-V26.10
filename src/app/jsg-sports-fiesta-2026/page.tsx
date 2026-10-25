import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function VanityRegisterRedirect() {
  redirect('/c/jsg/e/1/register')
}
