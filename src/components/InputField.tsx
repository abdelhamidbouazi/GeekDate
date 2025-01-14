'use client'
import * as React from "react";
import { Input } from "@nextui-org/react";
import { EyeFilledIcon, EyeSlashFilledIcon } from "./icons/eyes";

interface InputFieldProps {
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onValueChange: (value: string) => void;
  validate?: (value: string) => string | null;
  errorMessage?: string;
  name?: string;
  isPassword?: boolean;
}

export default function InputField({
  label,
  placeholder,
  type,
  value,
  onValueChange,
  validate,
  name,
  errorMessage,
  isPassword,
}: InputFieldProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleValidation = (value: string) => {
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
    onValueChange(value);
  };

  return (
    <Input
      variant="bordered"
      isClearable
      isRequired
      label={label}
      placeholder={placeholder}
      type={type}
      value={value}
      name={name}
      onValueChange={handleValidation}
      errorMessage={errorMessage || error}
      isInvalid={!!error}
    />
  );
}
