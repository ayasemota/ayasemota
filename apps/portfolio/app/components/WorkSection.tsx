"use client";

import { useProjects } from "@/hooks/useProjects";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function WorkSection() {
  const { projects, loading } = useProjects();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-accent-purple animate-spin" />
        <p className="text-muted-light animate-pulse">Loading amazing projects...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="p-8 rounded-lg border border-border-card bg-card-bg/50 text-center text-muted-light">
          No projects available yet. Check back soon!
        </div>
      ) : (
        projects.map((project, idx) => (
          <div
            key={project.id || idx}
            className="group relative p-8 rounded-lg border border-border-card bg-card-bg backdrop-blur-sm transition-all duration-500 cursor-pointer hover:bg-card-hover hover:border-border-card-hover hover:shadow-2xl hover:shadow-accent-purple/10 hover:scale-[1.02] animate-slideInLeft opacity-0"
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            <div className="absolute inset-0 bg-linear-to-br from-accent-purple/5 to-accent-blue/5 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-500"></div>

            <Link href={project.link} target="_blank">
              <div className="flex justify-between items-start gap-6 relative z-10">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-semibold group-hover:text-foreground transition-colors duration-300">
                      {project.title}
                    </h3>
                    <span className="text-xs text-tag px-2 py-1 border border-tag-border rounded group-hover:border-accent-purple/50 group-hover:text-accent-purple transition-all duration-300">
                      {project.date}
                    </span>
                  </div>
                  <p className="text-muted-light leading-relaxed group-hover:text-muted transition-colors duration-300">
                    {project.description}
                  </p>
                  <p className="text-sm text-tag group-hover:text-muted transition-colors duration-300">
                    {project.tech}
                  </p>
                </div>
                <ArrowRight
                  className="text-icon group-hover:text-foreground group-hover:translate-x-2 transition-all duration-300 shrink-0"
                  size={20}
                />
              </div>
            </Link>
          </div>
        ))
      )}
      <div className="flex pt-4 animate-fadeIn opacity-0 animation-delay-400 text-center justify-center sm:justify-start">
        <a
          href="https://github.com/ayasemota/"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors duration-300 focus:outline-none"
        >
          <span className="relative pb-1 font-medium">
            View more on GitHub
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-accent-purple to-accent-blue group-hover:w-full transition-all duration-300"></span>
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 group-hover:text-accent-purple transition-all duration-300" />
        </a>
      </div>
    </div>
  );
}
