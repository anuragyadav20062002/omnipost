import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Check if user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        {/* Admin Sidebar */}
        <nav className="mt-5">
          <a href="/admin/queue" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Queue Management</a>
          <a href="/admin/subscriptions" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">Subscriptions</a>
          <a href="/admin/users" className="block py-2 px-4 text-gray-600 hover:bg-gray-200">User Management</a>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  )
}

