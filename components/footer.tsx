import Link from 'next/link'
import { Twitter, Linkedin, Instagram, Facebook } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-primary/20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-muted-foreground mb-4 md:mb-0">
          © 2023 OmniPost. All rights reserved.
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Contact Us
          </Link>
        </div>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Twitter className="h-6 w-6 text-primary hover:text-primary/80 transition-colors" />
          <Linkedin className="h-6 w-6 text-secondary hover:text-secondary/80 transition-colors" />
          <Instagram className="h-6 w-6 text-accent hover:text-accent/80 transition-colors" />
          <Facebook className="h-6 w-6 text-primary hover:text-primary/80 transition-colors" />
        </div>
      </div>
    </footer>
  )
}

