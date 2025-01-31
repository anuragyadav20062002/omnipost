"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"
import type React from "react" // Added import for React

export function Providers({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient())

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      // You can add any additional logic here if needed when auth state changes
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return <SessionContextProvider supabaseClient={supabase}>{children}</SessionContextProvider>
}

