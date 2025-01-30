"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams?.get("error") ?? ""
  const message = searchParams?.get("message") ?? ""

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case "missing_code":
        return "The authorization code is missing. Please try the authentication process again."
      case "profile_fetch_failed":
        return "Failed to fetch user profile. Please try again later."
      case "whop_connection_failed":
        return "Failed to connect with Whop. Please try again."
      case "database_error":
        return "There was an error updating your profile. Please try again later."
      default:
        return "An unknown error occurred during authentication."
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Authentication Error</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {getErrorMessage(error)}
            {message && <p className="mt-2">{message}</p>}
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AuthError() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        }
      >
        <ErrorContent />
      </Suspense>
    </div>
  )
}

