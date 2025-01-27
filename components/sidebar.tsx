"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from './theme-toggle'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { LayoutDashboard, History, BarChart3, Settings, Calendar, Zap } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface UserMetadata {
  avatar_url?: string;
  full_name?: string;
}

interface User {
  user_metadata?: UserMetadata;
  email?: string;
}

interface SidebarProps {
  user: User;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Zap, label: 'Repurpose', href: '/dashboard/repurpose' },
    { icon: Calendar, label: 'Schedule', href: '/dashboard/schedule' },
    { icon: History, label: 'History', href: '/dashboard/history' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ]

  return (
    <>
      <aside className={`bg-card text-card-foreground fixed left-0 top-0 h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border/5">
            <div className="flex flex-col items-center justify-center">
              <Avatar className="h-16 w-16 mb-2">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="text-center">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors ${pathname === item.href ? 'bg-accent text-accent-foreground' : ''}`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t border-border/5">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 z-50"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </>
  )
}

