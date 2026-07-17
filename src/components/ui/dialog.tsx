"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogHeaderProps {
  title: string;
  description?: string;
}

export function DialogHeader({ title, description }: DialogHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-[#3D2519]">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-[#8B7A6B]">{description}</p>
      )}
    </div>
  );
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="mt-6 flex justify-end gap-3">{children}</div>
  );
}
