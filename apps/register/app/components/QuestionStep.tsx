"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import CardSelection from "./CardSelection";
import { Question } from "../lib/questions";

interface QuestionStepProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onComplete: (value?: string) => void;
}

export default function QuestionStep({
  question,
  value,
  onChange,
  onComplete,
}: QuestionStepProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (newValue: string) => {
      setLocalValue(newValue);
      onChange(newValue);

      if (question.type !== "text") {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          onComplete(newValue);
        }, 600);
      }
    },
    [onChange, question.type, onComplete]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && localValue.trim()) {
      e.preventDefault();
      onComplete(localValue);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed">
          {question.question}
        </h2>
      </div>

      <div className="w-full">
        {question.type === "text" && (
          <div className="space-y-4">
            <textarea
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={question.placeholder || "Type your answer..."}
              className="textarea-field w-full"
              rows={1}
              autoFocus
            />
            {localValue.trim() && (
              <div className="text-center animate-fade-in">
                <button
                  onClick={() => onComplete(localValue)}
                  className="text-white/50 text-sm hover:text-white/70 transition-colors"
                >
                  Click Here{" "}
                  <span className="border border-solid border-white/50 p-[0.5px] rounded-sm mx-1">
                    Enter
                  </span>{" "}
                  to continue →{" "}
                </button>
              </div>
            )}
          </div>
        )}

        {question.type === "multipleChoice" && question.options && (
          <div className="grid gap-3 w-full">
            {question.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleChange(option.id)}
                className={`card-option text-center py-4 w-full ${
                  localValue === option.id ? "selected" : ""
                }`}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <span className="text-white/90">{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {question.type === "cardSelection" && question.options && (
          <div className="w-full">
            <CardSelection
              options={question.options}
              selected={localValue}
              onSelect={handleChange}
            />
          </div>
        )}

        {question.type === "rating" && question.options && (
          <div className="flex justify-center gap-3">
            {question.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleChange(option.id)}
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-medium transition-all duration-300 ${
                  localValue === option.id
                    ? "bg-indigo-500/30 border-2 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10"
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
