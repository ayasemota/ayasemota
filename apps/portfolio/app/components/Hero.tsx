"use client";

interface HeroProps {
  isLoaded: boolean;
}

export default function Hero({ isLoaded }: HeroProps) {
  return (
    <div className="space-y-6">
      <div
        className={`relative ${
          isLoaded ? "animate-fadeInUp opacity-0" : "opacity-0"
        }`}
      >
        <h1 className="text-7xl md:text-8xl font-bold tracking-tighter">
          AY Asemota
        </h1>
        <div className="h-1 w-32 bg-linear-to-r from-accent-purple to-accent-blue mt-4 transform origin-left"></div>
      </div>

      <p
        className={`text-xl md:text-2xl text-muted max-w-2xl leading-relaxed ${
          isLoaded
            ? "animate-fadeInUp opacity-0 animation-delay-200"
            : "opacity-0"
        }`}
      >
        Front End Developer crafting digital experiences with modern
        technologies
      </p>

    </div>
  );
}
