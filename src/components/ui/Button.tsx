import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: ButtonVariant;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({
  loading = false,
  variant = 'primary',
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}