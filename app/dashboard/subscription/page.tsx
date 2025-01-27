'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<'basic' | 'pro' | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrentPlan()
  }, [])

  const fetchCurrentPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id).eq('is_active', true)
        .single()

      if (error) throw error

      setCurrentPlan(data?.plan_type || null)
    } catch (error) {
      console.error('Error fetching current plan:', error)
      toast({
        title: "Error",
        description: "Failed to fetch current plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('subscriptions')
        .update({ plan_type: 'pro' })
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) throw error

      setCurrentPlan('pro')
      toast({
        title: "Success",
        description: "Your plan has been upgraded to Pro!",
      })
    } catch (error) {
      console.error('Error upgrading plan:', error)
      toast({
        title: "Error",
        description: "Failed to upgrade plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDowngrade = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not found')

      const { error } = await supabase
        .from('subscriptions')
        .update({ plan_type: 'basic' })
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (error) throw error

      setCurrentPlan('basic')
      toast({
        title: "Success",
        description: "Your plan has been downgraded to Basic.",
      })
    } catch (error) {
      console.error('Error downgrading plan:', error)
      toast({
        title: "Error",
        description: "Failed to downgrade plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading subscription information...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Manage Your Subscription</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan: {currentPlan ? currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) : 'None'}</CardTitle>
          <CardDescription>
            {currentPlan === 'basic' ? 'Upgrade to Pro for more features!' : 'You are enjoying our Pro features!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            {currentPlan === 'basic' 
              ? 'With the Pro plan, you get access to advanced analytics, priority support, and more!' 
              : 'Thank you for being a Pro subscriber. You have access to all our premium features.'}
          </p>
        </CardContent>
        <CardFooter>
          {currentPlan === 'basic' ? (
            <Button onClick={handleUpgrade} disabled={isLoading}>
              Upgrade to Pro
            </Button>
          ) : (
            <Button onClick={handleDowngrade} disabled={isLoading} variant="outline">
              Downgrade to Basic
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

