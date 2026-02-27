"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export default function InputField({
  label,
  type = "text",
  error,
  className = "",
  ...rest
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col w-full space-y-1.5 focus-within:text-primary transition-colors">
      <label className="pl-5 text-sm font-bold tracking-wide uppercase transition-colors">
        {label}
      </label>
      <div className="relative group">
        <input
          type={inputType}
          className={`w-full bg-gray-50 border-2 border-transparent rounded-full py-3 px-6 transition-all focus:bg-snow focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400 ${
            error ? "border-red-500 bg-red-50" : ""
          } ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <span className="pl-5 text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
}
