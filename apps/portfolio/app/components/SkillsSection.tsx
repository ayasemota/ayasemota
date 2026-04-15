"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";
import { Loader2 } from "lucide-react";

export default function SkillsSection() {
  const { data, loading } = usePortfolioData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-accent-purple" size={24} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.skills.length > 0 ? (
        data.skills.map((skill, idx) => (
          <div
            key={idx}
            className="relative p-6 text-center border border-border-card rounded-lg bg-card-bg backdrop-blur-sm hover:border-foreground hover:bg-foreground hover:text-background hover:scale-105 transition-all duration-300 cursor-default focus:outline-none animate-fadeIn opacity-0 group"
            style={{ animationDelay: `${idx * 0.1}s` }}
            tabIndex={0}
          >
            <span className="relative z-10 font-medium">{skill}</span>
            <div className="absolute inset-0 bg-linear-to-br from-accent-purple/0 to-accent-blue/0 group-hover:from-accent-purple/10 group-hover:to-accent-blue/10 rounded-lg transition-all duration-300"></div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center text-muted-light">
          No skills listed yet.
        </div>
      )}
    </div>
  );
}
