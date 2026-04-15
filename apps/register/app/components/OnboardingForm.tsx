"use client";

import { useState, useCallback } from "react";
import FormStep from "./FormStep";
import SingleFieldStep from "./SingleFieldStep";
import QuestionStep from "./QuestionStep";
import ProgressIndicator from "./ProgressIndicator";
import NavigationButtons from "./NavigationButtons";
import { allSteps, StepType } from "../lib/questions";

interface FormData {
  fields: Record<string, string>;
  answers: Record<string, string>;
}

interface OnboardingFormProps {
  onComplete: (data: FormData) => void;
  onRestart: () => void;
}

export default function OnboardingForm({
  onComplete,
  onRestart,
}: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    fields: {},
    answers: {},
  });

  const steps: StepType[] = allSteps;
  const totalSteps = steps.length;

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      fields: { ...prev.fields, [fieldId]: value },
    }));
  }, []);

  const handleQuestionAnswer = useCallback(
    (questionId: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        answers: { ...prev.answers, [questionId]: value },
      }));
    },
    []
  );

  const handleStepComplete = useCallback(
    (manualValue?: string) => {
      let nextStep = currentStep + 1;

      const currentStepObj = steps[currentStep];
      const actualValue =
        manualValue ??
        (currentStepObj.kind === "field"
          ? formData.fields[currentStepObj.id]
          : formData.answers[currentStepObj.question.id]);

      if (currentStepObj.kind === "field" && currentStepObj.id === "budget") {
        if (actualValue === "Skip") {
          setFormData((prev) => ({
            ...prev,
            answers: { ...prev.answers, "payment-structure": "Skip" },
          }));
          if (nextStep < totalSteps - 1) {
            nextStep += 1;
          }
        }
      }

      if (currentStep < totalSteps - 1) {
        setCurrentStep(nextStep);
      } else {
        onComplete(formData);
      }
    },
    [currentStep, totalSteps, formData, onComplete, steps]
  );

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      let prevIndex = currentStep - 1;
      let prevStep = steps[prevIndex];

      if (
        prevStep.kind === "question" &&
        prevStep.question.id === "payment-structure" &&
        formData.fields["budget"] === "Skip"
      ) {
        if (prevIndex > 0) {
          prevIndex -= 1;
          prevStep = steps[prevIndex];
        }
      }

      if (prevStep.kind === "field" && prevStep.id === "budget") {
        setFormData((prev) => ({
          ...prev,
          fields: { ...prev.fields, budget: "" },
        }));
      }
      if (
        prevStep.kind === "question" &&
        prevStep.question.id === "payment-structure"
      ) {
        setFormData((prev) => ({
          ...prev,
          answers: { ...prev.answers, "payment-structure": "" },
        }));
      }

      setCurrentStep(prevIndex);
    }
  }, [currentStep, steps, formData.fields]);

  const handleRestart = useCallback(() => {
    onRestart();
  }, [onRestart]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative z-10 py-20">
      <NavigationButtons
        onBack={handleBack}
        onRestart={handleRestart}
        showBack={currentStep > 0}
        showRestart={currentStep > 0}
      />

      {steps.map((step, index) => {
        if (step.kind === "field") {
          return (
            <FormStep key={step.id} isActive={currentStep === index}>
              <SingleFieldStep
                label={step.label}
                placeholder={step.placeholder}
                type={step.type}
                value={formData.fields[step.id] || ""}
                onChange={(value: string) => handleFieldChange(step.id, value)}
                onComplete={handleStepComplete}
                autoAdvance={false}
                minValue={step.minValue}
              />
            </FormStep>
          );
        }

        if (step.kind === "question") {
          return (
            <FormStep key={step.question.id} isActive={currentStep === index}>
              <QuestionStep
                question={step.question}
                value={formData.answers[step.question.id] || ""}
                onChange={(value: string) =>
                  handleQuestionAnswer(step.question.id, value)
                }
                onComplete={handleStepComplete}
              />
            </FormStep>
          );
        }

        return null;
      })}

      <ProgressIndicator total={totalSteps} current={currentStep} />
    </div>
  );
}