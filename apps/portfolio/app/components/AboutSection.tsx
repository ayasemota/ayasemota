"use client";

import { ArrowRight } from "lucide-react";

export default function AboutSection() {
  return (
    <div className="space-y-8 text-muted-light max-w-3xl animate-fadeInUp opacity-0">
      <div className="space-y-6 text-lg leading-relaxed">
        <p>
          I&apos;m a front end developer with years of experience building
          scalable web applications and I focus on making things simple, fast,
          and understandable for beginners.
        </p>
        <p>
          When I&apos;m not building or experimenting with new ideas,
          you&apos;ll find me teaching tech to young people, breaking things
          down in the simplest way possible, or helping others start their
          journey into web development.
        </p>
      </div>

      <div className="flex gap-4 pt-4">
        <a
          href="https://t.me/ayasemota/"
          target="_blank"
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
