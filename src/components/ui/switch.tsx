'use client';

import React from 'react';

interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ id, checked, onChange, disabled = false, className = '' }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${checked ? 'bg-primary' : 'bg-slate-300'} ${className}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
          }`}
      />
    </button>
  );
}

interface FieldProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  'data-disabled'?: boolean;
}

export function Field({ children, orientation = 'horizontal', className = '', 'data-disabled': dataDisabled }: FieldProps) {
  return (
    <div
      data-disabled={dataDisabled}
      className={`flex ${orientation === 'horizontal' ? 'items-center gap-3' : 'flex-col gap-1.5'} ${dataDisabled ? 'opacity-50 pointer-events-none' : ''
        } ${className}`}
    >
      {children}
    </div>
  );
}

interface FieldLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export function FieldLabel({ htmlFor, children, className = '' }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-xs font-bold text-slate-700 cursor-pointer select-none ${className}`}
    >
      {children}
    </label>
  );
}
