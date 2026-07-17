"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface Toast {
  id: string;
  message: string;
  variant: "success" | "error" | "info";
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, variant: Toast["variant"] = "info") {
  const toast: Toast = {
    id: crypto.randomUUID(),
    message,
    variant,
  };
  toastListeners.forEach((l) => l(toast));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4000);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  if (toasts.length === 0) return null;

  const variantStyles: Record<Toast["variant"], string> = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-[#5B3A29]",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "rounded-md px-4 py-3 text-sm text-white shadow-lg animate-in slide-in-from-right",
            variantStyles[toast.variant]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
