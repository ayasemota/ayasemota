"use client";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onContinue: () => void;
}

export default function SectionHeader({
  title,
  subtitle,
  onContinue,
}: SectionHeaderProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-light text-white/90">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-white/50 max-w-md mx-auto">{subtitle}</p>
        )}
      </div>

      <button
        onClick={onContinue}
        className="mt-8 px-8 py-3 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-white/90 hover:bg-indigo-500/30 transition-all duration-300"
      >
        Continue →
      </button>
    </div>
  );
}
