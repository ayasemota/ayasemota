"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";
import { ArrowRight, Loader2 } from "lucide-react";

export default function AboutSection() {
  const { data, loading } = usePortfolioData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-accent-purple" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-muted-light max-w-3xl animate-fadeInUp opacity-0">
      <div className="space-y-6 text-lg leading-relaxed">
        {data.about.length > 0 ? (
          data.about.map((paragraph, idx) => <p key={idx}>{paragraph}</p>)
        ) : (
          <p>No bio available.</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <a
          href="https://t.me/ayasemota/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative px-8 py-4 border border-foreground rounded-lg hover:bg-foreground hover:text-background transition-all duration-300 focus:outline-none overflow-hidden font-medium"
        >
          <span className="relative z-10 flex items-center gap-2">
            Get in Touch
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform duration-300"
            />
          </span>
          <div className="absolute inset-0 bg-linear-to-r from-accent-purple/20 to-accent-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </a>
      </div>
    </div>
  );
}
