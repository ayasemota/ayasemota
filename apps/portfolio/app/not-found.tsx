"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import Background from "./components/Background";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden flex items-center justify-center">
      <Background />

      <div className="max-w-2xl mx-auto px-8 py-10 text-center relative z-10">
        <div className="space-y-2 animate-fadeInUp">
          <div className="space-y-4">
            <h1 className="text-9xl font-bold bg-linear-to-r from-accent-purple to-accent-blue bg-clip-text text-transparent animate-pulse">
              404!
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold">Page Not Found</h2>
            <p className="text-muted text-lg max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>

          <div className="flex gap-4 justify-center pt-8">
            <Link
              href="/"
              className="group relative px-8 py-4 border border-foreground rounded-lg hover:bg-foreground hover:text-background transition-all duration-300 focus:outline-none overflow-hidden font-medium"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Home size={18} />
                Go Home
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-accent-purple/20 to-accent-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 max-w-md mx-auto animate-fadeIn animation-delay-400 opacity-0">
          <div className="p-4 border border-border-card rounded-lg bg-card-bg backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent-purple">404</div>
            <div className="text-xs text-muted mt-1">Error Code</div>
          </div>
          <div className="p-4 border border-border-card rounded-lg bg-card-bg backdrop-blur-sm">
            <div className="text-2xl font-bold text-accent-blue">Lost</div>
            <div className="text-xs text-muted mt-1">Status</div>
          </div>
          <div className="p-4 border border-border-card rounded-lg bg-card-bg backdrop-blur-sm">
            <div className="text-2xl font-bold text-foreground">?</div>
            <div className="text-xs text-muted mt-1">Location</div>
          </div>
        </div>
      </div>
    </div>
  );
}
