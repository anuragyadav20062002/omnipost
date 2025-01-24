import type React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TermTooltipProps {
  term: string
  definition: string
  children: React.ReactNode
}

export function TermTooltip({ term, definition, children }: TermTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-help">{children}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            <strong>{term}:</strong> {definition}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

