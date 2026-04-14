"use client";

import { useState, useRef, useEffect } from "react";
import * as OTPAuth from "otpauth";
import Logo from "./Logo";

type ButtonState = "idle" | "loading" | "success" | "error";

interface PinLoginProps {
  onSuccess: () => void;
}

export default function PinLogin({ onSuccess }: PinLoginProps) {
  const [code, setCode] = useState("");
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const validateCode = () => {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setButtonState("error");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setButtonState("idle");
      }, 1500);
      return;
    }

    setButtonState("loading");

    setTimeout(() => {
      const secret = process.env.NEXT_PUBLIC_TOTP_SECRET;

      if (secret) {
        const totp = new OTPAuth.TOTP({
          issuer: "Admin",
          label: "ayasemota",
          algorithm: "SHA1",
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(secret),
        });

        const delta = totp.validate({ token: code, window: 1 });

        if (delta !== null) {
          setButtonState("success");
          localStorage.setItem("adminAuth", "true");
          setTimeout(() => {
            localStorage.setItem("loginTime", Date.now().toString());
            onSuccess();
          }, 800);
          return;
        }
      }

      setButtonState("error");
      setShake(true);
      setTimeout(() => {
        setCode("");
        setButtonState("idle");
        setShake(false);
        inputRef.current?.focus();
      }, 1500);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && buttonState === "idle") {
      validateCode();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const getButtonContent = () => {
    switch (buttonState) {
      case "loading":
        return (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Verifying...
          </span>
        );
      case "success":
        return (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Success!
          </span>
        );
      case "error":
        return (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Incorrect Pin
          </span>
        );
      default:
        return "Log In";
    }
  };

  const getButtonClasses = () => {
    const base =
      "w-full py-3 px-4 rounded-lg font-semibold text-base transition-all duration-200 flex items-center justify-center";

    switch (buttonState) {
      case "loading":
        return `${base} bg-primary/70 text-primary-foreground cursor-wait`;
      case "success":
        return `${base} bg-success text-success-foreground`;
      case "error":
        return `${base} bg-destructive text-destructive-foreground`;
      default:
        return `${base} bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]`;
    }
  };

  return (
    <div className="min-h-dvh bg-muted flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col justify-center items-center text-center mb-8">
          <Logo />
          <h1 className="text-4xl font-bold text-foreground my-2">Welcome</h1>
          <p className="text-muted-foreground">Enter your 6-digit code</p>
        </div>

        <div className={`mb-6 ${shake ? "animate-shake" : ""}`}>
          <input
            ref={inputRef}
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="000000"
            disabled={buttonState === "loading" || buttonState === "success"}
            className="w-full h-14 text-center text-2xl font-bold tracking-[0.5em] bg-background border-2 border-input rounded-lg focus:border-ring focus:outline-none transition-all placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={validateCode}
          disabled={buttonState === "loading" || buttonState === "success"}
          className={getButtonClasses()}
        >
          {getButtonContent()}
        </button>
      </div>
    </div>
  );
}
