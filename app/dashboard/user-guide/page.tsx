import { UserGuide } from "@/components/user-guide/UserGuide"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function UserGuidePage() {
  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">OmniPost User Guide</h1>
        <UserGuide />
      </div>
    </TooltipProvider>
  )
}

