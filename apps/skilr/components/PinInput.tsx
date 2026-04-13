import React, { useRef, useState, KeyboardEvent, useEffect } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
  isLoading?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  value,
  onChange,
  onComplete,
  isLoading = false,
}) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    let val = e.target.value;
    
    
    val = val.replace(/\D/g, "");

    
    if (val.length > 1) {
      const pasteData = val.slice(0, 6);
      const newPinArray = value.padEnd(6, "").split("");
      
      for (let i = 0; i < pasteData.length; i++) {
        if (index + i < 6) {
          newPinArray[index + i] = pasteData[i];
        }
      }
      
      const newPin = newPinArray.join("").substring(0, 6);
      onChange(newPin);

      
      const nextIndex = Math.min(index + pasteData.length, 5);
      inputs.current[nextIndex]?.focus();
      return;
    }

    if (val.length === 1) {
      
      const newPinArray = value.padEnd(6, "").split("");
      newPinArray[index] = val;
      const newPin = newPinArray.join("").substring(0, 6);
      onChange(newPin);

      
      if (index < 5) {
        inputs.current[index + 1]?.focus();
      } else if (index === 5) {
        
        if (newPin.length === 6 && onComplete) {
          
          setTimeout(() => {
            onComplete();
          }, 50);
        }
      }
    } else if (val.length === 0) {
      
      const newPinArray = value.padEnd(6, "").split("");
      newPinArray[index] = "";
      onChange(newPinArray.join("").substring(0, 6));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const pinArray = value.split("");
      if (!pinArray[index] && index > 0) {
        
        inputs.current[index - 1]?.focus();
        const newPinArray = [...pinArray];
        newPinArray[index - 1] = "";
        onChange(newPinArray.join(""));
      } else {
        
        const newPinArray = [...pinArray];
        newPinArray[index] = "";
        onChange(newPinArray.join(""));
      }
      e.preventDefault(); 
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputs.current[index] = el;
  };

  return (
    <div className="flex justify-between gap-2 md:gap-4">
      {Array.from({ length: 6 }).map((_, index) => {
        const char = value[index] || "";
        return (
          <input
            key={index}
            ref={setInputRef(index)}
            type="password"
            inputMode="numeric"
            disabled={isLoading}
            autoComplete="one-time-code"
            maxLength={6} 
            value={char}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            className="w-10 h-12 md:w-12 md:h-14 text-center text-xl md:text-2xl font-bold bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
          />
        );
      })}
    </div>
  );
};
