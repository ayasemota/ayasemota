"use client";

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isLoaded: boolean;
}

export default function Navigation({
  activeSection,
  setActiveSection,
  isLoaded,
}: NavigationProps) {
  const sections = ["work", "skills", "about"];

  return (
    <div
      className={`flex gap-8 mt-24 mb-10 ${
        isLoaded ? "animate-fadeIn opacity-0 animation-delay-600" : "opacity-0"
      }`}
    >
      {sections.map((section) => (
        <button
          key={section}
          onClick={() => setActiveSection(section)}
          className={`relative text-lg font-medium transition-all duration-300 focus:outline-none cursor-pointer capitalize ${
            activeSection === section
              ? "text-foreground"
              : "text-muted hover:text-muted-hover"
          }`}
        >
          {section}
          {activeSection === section && (
            <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-linear-to-r from-accent-purple to-accent-blue"></span>
          )}
        </button>
      ))}
    </div>
  );
}
