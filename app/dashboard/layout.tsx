import { redirect } from 'next/navigation'
import { LayoutDashboard, HelpCircle,Calendar, BarChart3, Settings, ChevronRight, History, WandSparkles, LogOut } from 'lucide-react'
import Link from 'next/link'
import { getSession } from '../actions/auth'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { Button } from "@/components/ui/button"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const supabase = createServerComponentClient<Database>({ cookies })
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: WandSparkles, label: 'Repurpose', href:'/dashboard/repurpose'},
    { icon: Calendar, label: 'Schedule', href: '/dashboard/schedule' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
    {icon: HelpCircle, label:'User Guide',href:'/dashboard/user-guide'}
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-card shadow-lg flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex flex-col items-center space-y-3 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{profile?.full_name?.split(' ').map((n: any[]) => n[0]).join('').toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-sm font-semibold">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{session.user.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors group"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100/10">
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}

