// Adapted from https://ui.shadcn.com/docs/components/toast
import { useState, useEffect, useCallback } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  open: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).slice(2, 9)
    const newToast: Toast = {
      id,
      open: true,
      variant: "default",
      duration: 5000,
      ...props,
    }

    setToasts((prevToasts) => [...prevToasts, newToast])
    
    // Auto dismiss after duration
    setTimeout(() => {
      dismiss(id)
    }, newToast.duration)
    
    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast
      )
    )
    
    // Remove from state after animation
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 300)
  }, [])

  // Simple implementation for this specific use case
  // In a real app, you would use react-hot-toast, sonner, or a complete toast implementation
  return { toast, dismiss }
} 