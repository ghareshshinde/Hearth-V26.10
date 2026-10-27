import { redirect } from 'next/navigation'

/** Staff and admins share one sign-in. Old links and invite expiry notices land there. */
export default async function StaffLogin({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ expired?: string }> }) {
  const { slug } = await params
  const { expired } = await searchParams
  redirect(`/c/${slug}/admin/login${expired ? '?expired=1' : ''}`)
}
