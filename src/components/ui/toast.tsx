import * as React from "react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive"
  title?: string
  description?: string
  action?: React.ReactNode
  open?: boolean
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", title, description, action, open = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border px-6 py-4 shadow-lg transition-all",
          variant === "default" && "border-border bg-background text-foreground",
          variant === "destructive" && "destructive border-destructive bg-destructive text-destructive-foreground",
          !open && "opacity-0 translate-x-full",
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-1">
          {title && <div className="text-sm font-semibold">{title}</div>}
          {description && <div className="text-sm opacity-90">{description}</div>}
        </div>
        {action}
        {onClose && (
          <button 
            onClick={onClose}
            className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ToastViewport = React.forwardRef<HTMLDivElement, ToastViewportProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
)
ToastViewport.displayName = "ToastViewport"

export { Toast } 