"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[24px] bg-surface-bright p-xl shadow-xl border border-outline-variant">
        <div className="flex items-center justify-between mb-lg">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container transition-colors">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
