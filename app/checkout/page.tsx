"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function Checkout() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("has_active_subscription")
          .eq("id", user.id)
          .single()

        if (error) {
          console.error("Error checking subscription:", error)
        } else if (data?.has_active_subscription) {
          router.push("/dashboard")
        }
      }
      setIsLoading(false)
    }

    checkSubscription()
  }, [router, supabase])

  const handleCheckout = () => {
    window.location.href = "https://whop.com/omnipost/"
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold gradient-text">Complete Your Subscription</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You're almost there! Click the button below to complete your subscription on Whop.
          </p>
        </div>
        <Button
          onClick={handleCheckout}
          className="w-full flex items-center justify-center bg-[#FF6243] hover:bg-[#FF6243]/90 text-white"
        >
          Continue to Whop Checkout
        </Button>
      </div>
    </div>
  )
}

