"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: "sm" | "lg" | "xl";
}

export function Modal({ open, onClose, title, children, size = "sm" }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const maxW =
    size === "xl" ? "max-w-4xl" :
    size === "lg" ? "max-w-2xl" :
    "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full ${maxW} rounded-2xl bg-surface-bright shadow-2xl border border-outline-variant max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-surface-bright/95 backdrop-blur-sm border-b border-outline-variant/20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
