import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpSuccess() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-card p-8 shadow-lg text-center">
        <h2 className="text-3xl font-extrabold gradient-text">Sign Up Successful!</h2>
        <p className="text-foreground">
          Thank you for signing up. Please check your email to verify your account.
        </p>
        <Button asChild>
          <Link href="/auth/signin">Proceed to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}

