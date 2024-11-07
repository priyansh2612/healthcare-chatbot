import React from 'react'
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean
  children: React.ReactNode
}

export function LoadingButton({ isLoading, children, ...props }: LoadingButtonProps) {
  return (
    <Button {...props} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        children
      )}
    </Button>
  )
}