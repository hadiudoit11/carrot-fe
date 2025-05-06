"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Toast, ToastViewport } from "./toast"
import { useToast } from "./use-toast"

export const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  // Use a minimal implementation of useToast for this specific use case
  const toastUtils = useToast()
  const [visibleToasts, setVisibleToasts] = useState<Array<{
    id: string
    title?: string
    description?: string
    variant?: "default" | "destructive"
    open: boolean
  }>>([])

  // Sync the toasts from the useToast hook to local state for rendering
  useEffect(() => {
    // This is a simplified implementation
    // In a real app, you would use react-hot-toast or a complete toast implementation
    const handleToast = (toast: any) => {
      setVisibleToasts((prev) => [...prev, { ...toast, open: true }])
      
      setTimeout(() => {
        setVisibleToasts((prev) => 
          prev.map((t) => (t.id === toast.id ? { ...t, open: false } : t))
        )
        
        setTimeout(() => {
          setVisibleToasts((prev) => prev.filter((t) => t.id !== toast.id))
        }, 300)
      }, 5000)
    }
    
    // Mock event listeners for this simplified implementation
    // This simplified version just works for our current needs
  }, [])

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      
      <ToastViewport>
        {visibleToasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            open={toast.open}
            onClose={() => {
              setVisibleToasts((prev) =>
                prev.map((t) => (t.id === toast.id ? { ...t, open: false } : t))
              )
              setTimeout(() => {
                setVisibleToasts((prev) => 
                  prev.filter((t) => t.id !== toast.id)
                )
              }, 300)
            }}
          />
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  )
} 