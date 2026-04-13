"use client";

import { ReactNode } from "react";

interface FormStepProps {
  children: ReactNode;
  isActive: boolean;
}

export default function FormStep({ children, isActive }: FormStepProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 animate-fade-in-up">
      {children}
    </div>
  );
}
