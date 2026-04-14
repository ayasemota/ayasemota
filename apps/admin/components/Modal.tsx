"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "lg",
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-card text-card-foreground rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90dvh] overflow-hidden animate-scaleIn my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between z-10">
          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90dvh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
