'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowRight, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import '../styles/sparkle.css'



const StarIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ width: '12px', height: '12px' }}
  >
    <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
  </svg>
)

const BurstIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    style={{ width: '24px', height: '24px' }}
  >
    <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9Z" />
  </svg>
)

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-primary/20">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="text-2xl font-bold gradient-text">
          OmniPost
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/upcoming-features" className="relative text-sm font-medium hover:text-primary transition-colors group">
            <span className="relative z-10">Upcoming</span>
            <StarIcon className="sparkle sparkle-1 text-yellow-400 absolute -top-2 -left-2" />
            <StarIcon className="sparkle sparkle-2 text-yellow-400 absolute -top-2 -right-2" />
            <StarIcon className="sparkle sparkle-3 text-yellow-400 absolute -bottom-2 -left-2" />
            <StarIcon className="sparkle sparkle-4 text-yellow-400 absolute -bottom-2 -right-2" />
            <BurstIcon className="burst burst-1 text-yellow-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <BurstIcon className="burst burst-2 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <BurstIcon className="burst burst-3 text-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-full"></span>
          </Link>
          {!user ? (
            <>
              <Link href="/auth/signin" className="text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Sign Up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}

