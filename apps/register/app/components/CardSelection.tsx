"use client";

interface CardSelectionProps {
  options: { id: string; label: string; description?: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function CardSelection({
  options,
  selected,
  onSelect,
}: CardSelectionProps) {
  return (
    <div className="grid gap-3 mt-6">
      {options.map((option, index) => (
        <button
          key={option.id}
          onClick={() => onSelect(option.id)}
          className={`card-option text-left flex items-start gap-4 ${
            selected === option.id ? "selected" : ""
          }`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <span className="shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-medium">
            {option.id}
          </span>
          <div>
            <span className="block font-medium text-white/90">
              {option.label}
            </span>
            {option.description && (
              <span className="block text-sm text-white/50 mt-1">
                {option.description}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
