"use client";

import { useState, useCallback } from "react";
import StarryBackground from "./components/StarryBackground";
import WelcomeScreen from "./components/WelcomeScreen";
import OnboardingForm from "./components/OnboardingForm";
import CompletionScreen from "./components/CompletionScreen";

import { saveRegistration } from "./lib/firestore";

type OnboardingPhase = "welcome" | "form" | "submitting" | "success" | "error";

interface FormData {
  fields: Record<string, string>;
  answers: Record<string, string>;
}

export default function Home() {
  const [phase, setPhase] = useState<OnboardingPhase>("welcome");

  const handleWelcomeComplete = useCallback(() => {
    setPhase("form");
  }, []);

  const handleFormComplete = useCallback(async (data: FormData) => {
    setPhase("submitting");
    try {
      await saveRegistration(data);
      console.log("Onboarding Complete and saved to Firestore:", data);
      setPhase("success");
    } catch (error) {
      console.error("Error saving registration:", error);
      setPhase("error");
    }
  }, []);

  const handleRestart = useCallback(() => {
    setPhase("welcome");
  }, []);

  const handleRetry = useCallback(() => {
    setPhase("form");
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      <StarryBackground />

      {phase === "welcome" && (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      )}

      {phase === "form" && (
        <OnboardingForm
          onComplete={handleFormComplete}
          onRestart={handleRestart}
        />
      )}

      {phase === "submitting" && <CompletionScreen status="submitting" />}
      {phase === "success" && <CompletionScreen status="success" />}
      {phase === "error" && <CompletionScreen status="error" onRetry={handleRetry} />}
    </div>
  );
}