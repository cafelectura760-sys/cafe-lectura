"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  required = false,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="password-field-wrap">
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          className="field-input pr-14"
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={isVisible ? "Ocultar contrasena" : "Mostrar contrasena"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
