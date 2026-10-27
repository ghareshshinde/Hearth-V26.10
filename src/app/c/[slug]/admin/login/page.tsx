import { requireCommunity } from '@/lib/session'
import SignInForm from '@/components/SignInForm'
import AdminSetupForm from '@/components/AdminSetupForm'

export const dynamic = 'force-dynamic'

export default async function Login({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ expired?: string }> }) {
  const { slug } = await params
  const { expired } = await searchParams
  const c = await requireCommunity(slug)
  return c.admin_hash
    ? (
      <main>
        <h1>Admin login</h1>
        {expired && <p className="warn" role="alert">That invite link has expired or was replaced. Sign in with your username and password, or ask the organisers for a new link.</p>}
        <SignInForm slug={slug} />
      </main>
    )
    : <main><h1>Set the admin password</h1><AdminSetupForm slug={slug} /></main>
}
