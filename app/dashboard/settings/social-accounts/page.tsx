'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Twitter, Linkedin, Instagram, Facebook, RefreshCw, Loader2, Youtube, TwitterIcon as TikTok, PinIcon as Pinterest, SunMediumIcon as Medium, RssIcon as Reddit } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Database } from '@/types/database'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface SocialPlatform {
  name: string
  icon: any
  color: string
  isAvailable: boolean
  username?: string
}

export default function SocialAccountsPage() {
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const socialPlatforms: SocialPlatform[] = [
    { name: 'twitter', icon: Twitter, color: 'text-[#1DA1F2]', isAvailable: true },
    { name: 'facebook', icon: Facebook, color: 'text-[#4267B2]', isAvailable: true },
    { name: 'instagram', icon: Instagram, color: 'text-[#E1306C]', isAvailable: false },
    { name: 'linkedin', icon: Linkedin, color: 'text-[#0077B5]', isAvailable: false },
    { name: 'youtube', icon: Youtube, color: 'text-[#FF0000]', isAvailable: false },
    { name: 'tiktok', icon: TikTok, color: 'text-[#000000]', isAvailable: false },
    { name: 'pinterest', icon: Pinterest, color: 'text-[#E60023]', isAvailable: false },
    { name: 'medium', icon: Medium, color: 'text-[#000000]', isAvailable: false },
    { name: 'reddit', icon: Reddit, color: 'text-[#FF4500]', isAvailable: false },
  ]

  useEffect(() => {
    fetchConnectedAccounts()
    
    const success = searchParams?.get('success')
    const error = searchParams?.get('error')

    if (success) {
      toast({
        title: "Success",
        description: "Social media account connected successfully!",
      })
    } else if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [searchParams])

  const fetchConnectedAccounts = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('social_accounts')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data && data.social_accounts) {
          setConnectedAccounts(data.social_accounts)
        }
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch connected accounts. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const connectOrRefreshAccount = async (platform: string) => {
    setIsLoading(true)
    try {
      let url = `/api/auth/${platform}`
      
      // Special handling for Instagram
      if (platform === 'instagram') {
        url = `/api/auth/instagram`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.error) {
        console.error(`Error connecting/refreshing ${platform} account:`, data.error)
        throw new Error(data.error)
      }

      // Store state and code verifier in cookies
      if (data.state) {
        document.cookie = `${platform}_state=${data.state}; path=/; max-age=3600; secure; samesite=lax`
      }
      if (data.codeVerifier) {
        document.cookie = `${platform}_code_verifier=${data.codeVerifier}; path=/; max-age=3600; secure; samesite=lax`
      }

      console.log(`Redirecting to ${platform} auth URL:`, data.url)
      window.location.href = data.url
    } catch (error) {
      console.error('Error connecting/refreshing account:', error)
      toast({
        title: "Error",
        description: `Failed to connect/refresh ${platform} account. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const disconnectAccount = async (platform: string) => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('social_accounts')
          .eq('id', user.id)
          .single()

        if (profile?.social_accounts) {
          const updatedAccounts = { ...profile.social_accounts }
          delete updatedAccounts[platform]

          // If disconnecting Facebook, also remove Instagram if present
          if (platform === 'facebook' && updatedAccounts['instagram']) {
            delete updatedAccounts['instagram']
          }

          const { error } = await supabase
            .from('profiles')
            .update({ social_accounts: updatedAccounts })
            .eq('id', user.id)

          if (error) throw error

          setConnectedAccounts(updatedAccounts)
          toast({
            title: "Success",
            description: `Disconnected ${platform} account successfully.`,
          })
        }
      }
    } catch (error) {
      console.error('Error disconnecting account:', error)
      toast({
        title: "Error",
        description: "Failed to disconnect account. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAccountDetails = (platform: string) => {
    if (!connectedAccounts[platform]) return null

    switch (platform) {
      case 'twitter':
        return connectedAccounts[platform].screen_name || 'Connected'
      case 'facebook':
        return connectedAccounts[platform].name || 'Connected'
      case 'instagram':
        return connectedAccounts[platform].username || 'Connected'
      case 'linkedin':
        return connectedAccounts[platform].profile_name || 'Connected'
      default:
        return 'Connected'
    }
  }

  const connectInstagram = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/instagram');
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Error connecting Instagram account:', error);
      toast({
        title: "Error",
        description: `Failed to connect Instagram account. ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Connect Social Media Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialPlatforms.map((platform) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-2 h-2 m-4 rounded-full ${
                connectedAccounts[platform.name] ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <CardHeader>
                <CardTitle className="flex items-center">
                  <platform.icon className={`mr-2 h-6 w-6 ${platform.color}`} />
                  <span className="capitalize">{platform.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {platform.isAvailable ? (
                  <>
                    {connectedAccounts[platform.name] && (
                      <div className="mb-4">
                        <Badge variant="outline" className="text-xs">
                          {getAccountDetails(platform.name)}
                        </Badge>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {connectedAccounts[platform.name] ? (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => disconnectAccount(platform.name)}
                            disabled={isLoading}
                          >
                            Disconnect
                          </Button>
                          <Button
                            onClick={() => connectOrRefreshAccount(platform.name)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Token
                          </Button>
                        </>
                      ) : (
                        <Button 
                          onClick={() => connectOrRefreshAccount(platform.name)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Connect {platform.name}
                        </Button>
                      )}
                    </div>
                    {platform.name === 'facebook' && !connectedAccounts[platform.name] && (
                      <p className="mt-2 text-xs text-yellow-600">
                        Note: If you have an Instagram account connected to your Facebook Page, please create a new Facebook Page without Instagram for use with OmniPost to avoid potential errors.
                      </p>
                    )}
                  </>
                ) : (
                  <Button disabled className="w-full">
                    Coming in Next Update
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

