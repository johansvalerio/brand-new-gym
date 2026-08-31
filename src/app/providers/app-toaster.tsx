"use client"

import { Toaster } from "sonner"
import { CheckCircle2, XCircle } from "lucide-react"

export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      icons={{
        success: <CheckCircle2 strokeWidth={2.5} />,
        error: <XCircle strokeWidth={2.5} />,
      }}
    />
  )
}
