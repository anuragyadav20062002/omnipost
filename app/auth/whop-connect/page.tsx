"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"

export default function WhopConnect() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/auth/signin")
      }
    }
    checkUser()
  }, [router, supabase])

  const handleWhopConnect = () => {
    const whopAuthUrl = `https://whop.com/oauth?client_id=${process.env.NEXT_PUBLIC_WHOP_CLIENT_ID}&redirect_uri=${encodeURIComponent(`${window.location.origin}/api/auth/whop-callback`)}`
    window.location.href = whopAuthUrl
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold gradient-text">Connect with Whop</h2>
          <p className="mt-2 text-sm text-muted-foreground">Link your Whop account to access OmniPost features</p>
        </div>
        <Button
          onClick={handleWhopConnect}
          className="w-full flex items-center justify-center bg-[#FF6243] hover:bg-[#FF6243]/90 text-white"
        >
          Connect with Whop
        </Button>
      </div>
    </div>
  )
}

