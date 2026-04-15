"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { checkUniqueField } from "../lib/firestore";

interface SingleFieldStepProps {
  label: string;
  placeholder: string;
  type: "text" | "date" | "name" | "telegram" | "number" | "email" | "phone" | "pin";
  value: string;
  onChange: (value: string) => void;
  onComplete: () => void;
  autoAdvance?: boolean;
  minValue?: number;
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return parseInt(num, 10).toLocaleString("en-US");
}

function parseNumber(value: string): number {
  return parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
}

const PinInputRenderer = ({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete: () => void;
}) => {
  const [digits, setDigits] = useState<string[]>(
    value.split("").concat(Array(6).fill("")).slice(0, 6)
  );
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setDigits(value.split("").concat(Array(6).fill("")).slice(0, 6));
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const firstEmptyIndex = digits.findIndex((d) => d === "");
      const focusIndex = firstEmptyIndex === -1 ? 5 : firstEmptyIndex;
      if (inputs.current[focusIndex]) {
        inputs.current[focusIndex]?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (!val && e.target.value !== "") return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1);
    setDigits(newDigits);
    onChange(newDigits.join(""));

    if (val && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      onComplete();
    }
  };

  return (
    <div className="flex gap-2 justify-center mt-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-semibold rounded-xl border border-white/20 bg-white/5 focus:border-indigo-500 focus:bg-indigo-500/10 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-300 text-white shadow-sm"
        />
      ))}
    </div>
  );
};

export default function SingleFieldStep({
  label,
  placeholder,
  type,
  value,
  onChange,
  onComplete,
  autoAdvance = false,
  minValue,
}: SingleFieldStepProps) {
  const [localValue, setLocalValue] = useState(value);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (type === "text" || type === "number") {
      textareaRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  }, [type]);

  const getMinDate = (): string => {
    return "1920-01-01";
  };

  const getMaxDate = (): string => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleChange = (newValue: string) => {
    setError("");
    let processedValue = newValue;

    if (type === "name") {
      processedValue = capitalizeFirstLetter(newValue);
    } else if (type === "telegram") {
      if (newValue && !newValue.startsWith("@")) {
        processedValue = "@" + newValue.replace(/^@+/, "");
      }
    } else if (type === "number") {
      processedValue = formatNumber(newValue);
    } else if (type === "phone") {
      let clean = newValue.replace(/[^\d]/g, "");
      if (clean.length > 11) clean = clean.substring(0, 11);
      processedValue = clean;
    } else if (type === "date") {
      let clean = newValue.replace(/[^\d]/g, "");
      if (clean.length > 8) clean = clean.substring(0, 8);
      let formatted = clean;
      if (clean.length > 2) {
        formatted = clean.substring(0, 2) + "/" + clean.substring(2);
      }
      if (clean.length > 4) {
        formatted = formatted.substring(0, 5) + "/" + clean.substring(4);
      }
      processedValue = formatted;
    }

    setLocalValue(processedValue);
    onChange(processedValue);
  };

  const handleNotSure = () => {
    setLocalValue("Not sure");
    onChange("Not sure");
    onComplete();
  };

  const validateAndComplete = useCallback(async () => {
    if (!localValue.trim()) return;

    if (isChecking) return;
    setIsChecking(true);
    setError("");

    try {

    if (type === "name") {
      const cleaned = localValue.trim();
      if (cleaned.length < 2) {
        setError("Name must be at least 2 characters");
        return;
      }
      if (!/^[a-zA-Z\s'-]+$/.test(cleaned)) {
        setError("Name can only contain letters");
        return;
      }
    }

    if (type === "date") {
      const parts = localValue.split("/");
      if (parts.length !== 3 || localValue.length !== 10) {
        setError("Please enter date as DD/MM/YYYY");
        return;
      }
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const selectedDate = new Date(year, month, day);

      if (
        selectedDate.getDate() !== day ||
        selectedDate.getMonth() !== month ||
        selectedDate.getFullYear() !== year
      ) {
        setError("Please enter a valid date");
        return;
      }

      const minDate = new Date(getMinDate());
      const maxDate = new Date(getMaxDate());
      if (selectedDate < minDate || selectedDate > maxDate) {
        setError("Please enter a valid date of birth");
        return;
      }
      const age = Math.floor(
        (maxDate.getTime() - selectedDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      );
      if (age < 10) {
        setError("You must be at least 10 years old");
        return;
      }
    }

    if (type === "telegram") {
      if (!localValue.startsWith("@")) {
        setError("Username must start with @");
        return;
      }
      const username = localValue.slice(1);
      if (username.length < 5) {
        setError("Username must be at least 5 characters");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError("Username can only contain letters, numbers, and underscores");
        return;
      }
      const exists = await checkUniqueField("telegramUsername", localValue.trim());
      if (exists) {
        setError("This Telegram username is already registered");
        return;
      }
    }

    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(localValue.trim())) {
        setError("Please enter a valid email address");
        return;
      }
      const exists = await checkUniqueField("email", localValue.trim().toLowerCase());
      if (exists) {
        setError("This email is already registered");
        return;
      }
    }

    if (type === "phone") {
      if (localValue.trim().length !== 11 || !/^\d{11}$/.test(localValue.trim())) {
        setError("Phone number must be exactly 11 digits");
        return;
      }
      const exists = await checkUniqueField("phone", localValue.trim());
      if (exists) {
        setError("This phone number is already registered");
        return;
      }
    }

    if (type === "pin") {
      if (localValue.trim().length !== 6 || !/^\d+$/.test(localValue.trim())) {
        setError("PIN must be exactly 6 digits");
        return;
      }
      const exists = await checkUniqueField("pin", localValue.trim());
      if (exists) {
        setError("This PIN is already in use by another user");
        return;
      }
    }

    if (type === "number" && minValue && localValue !== "Not sure") {
      const numValue = parseNumber(localValue);
      if (numValue < minValue) {
        setError(`Minimum amount is ${minValue.toLocaleString("en-US")}`);
        return;
      }
    }

    onComplete();
  } catch (err) {
    console.error(err);
    setError("An error occurred verifying details.");
  } finally {
    setIsChecking(false);
  }
  }, [localValue, type, minValue, onComplete, isChecking]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      validateAndComplete();
    }
  };

  useEffect(() => {
    if (autoAdvance && localValue.trim()) {
      const timer = setTimeout(() => {
        validateAndComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoAdvance, localValue, validateAndComplete]);

  const renderInput = () => {
    if (type === "date") {
      return (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="DD/MM/YYYY"
          className="input-field text-center tracking-widest"
        />
      );
    }

    if (type === "name" || type === "telegram") {
      return (
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field text-center"
        />
      );
    }

    if (type === "email") {
      return (
        <input
          ref={inputRef}
          type="email"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field text-center"
        />
      );
    }

    if (type === "phone") {
      return (
        <input
          ref={inputRef}
          type="tel"
          maxLength={11}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input-field text-center"
        />
      );
    }

    if (type === "pin") {
      return (
        <PinInputRenderer 
          value={localValue}
          onChange={handleChange}
          onComplete={validateAndComplete}
        />
      );
    }

    return (
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="textarea-field"
        rows={1}
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-light text-white/90 leading-relaxed">
          {label}
        </h2>
      </div>

      <div className="space-y-4">
        {renderInput()}

        {error && (
          <p className="text-red-400 text-sm text-center animate-fade-in">
            {error}
          </p>
        )}

        {(placeholder === "Enter amount" || label.toLowerCase().includes("investing")) && !localValue && (
          <div className="text-center animate-fade-in">
            <button
              onClick={handleNotSure}
              className="px-6 py-2 rounded-full border border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium"
            >
              Not sure / Skip
            </button>
          </div>
        )}

        {localValue.trim() && !autoAdvance && !error && (
          <div className="text-center animate-fade-in">
            <button
              onClick={validateAndComplete}
              disabled={isChecking}
              className="text-white/50 text-sm hover:text-white/70 transition-colors disabled:opacity-50"
            >
              {isChecking ? "Checking..." : (
                <>
                  Click Here{" "}
                  <span className="border border-solid border-white/50 p-[0.5px] rounded-sm mx-1">
                    Enter
                  </span>{" "}
                  to continue →{" "}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
