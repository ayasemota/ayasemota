"use client";

import { useState, useEffect } from "react";
import Hero from "./components/Hero";
import Navigation from "./components/Navigation";
import WorkSection from "./components/WorkSection";
import SkillsSection from "./components/SkillsSection";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import Background from "./components/Background";
import Preloader from "./components/Preloader";

export default function Home() {
  const [activeSection, setActiveSection] = useState("work");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
      setIsLoaded(true);
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {showPreloader && <Preloader />}

      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        <Background />

        <div className="max-w-5xl mx-auto px-8 py-24 relative z-10">
          <Hero isLoaded={isLoaded} />
          <Navigation
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isLoaded={isLoaded}
          />

          <div className="min-h-[400px]">
            {activeSection === "work" && <WorkSection />}
            {activeSection === "skills" && <SkillsSection />}
            {activeSection === "about" && <AboutSection />}
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}
