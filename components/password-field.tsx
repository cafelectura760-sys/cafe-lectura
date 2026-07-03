"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  inputClassName?: string;
  wrapperClassName?: string;
  labelClassName?: string;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  required = false,
  minLength,
  inputClassName,
  wrapperClassName,
  labelClassName,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className={labelClassName ?? "field-label"}>
        {label}
      </label>
      <div className={wrapperClassName ?? "password-field-wrap"}>
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          className={inputClassName ?? "field-input pr-14"}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((current) => !current)}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
