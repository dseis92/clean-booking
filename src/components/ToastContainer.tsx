"use client";

import { Toast } from "@/components/ui/Toast";
import { ToastContext, useToastState } from "@/lib/toast";
import { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastState = useToastState();

  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toastState.toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => toastState.removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
