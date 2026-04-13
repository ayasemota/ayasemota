"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="mt-40 pt-12 border-t border-border-footer flex justify-between items-center text-footer text-sm animate-fadeIn opacity-0 animation-delay-600">
      <p>© {currentYear} AY Asemota</p>
      <p>Built with Next.js</p>
    </div>
  );
}
