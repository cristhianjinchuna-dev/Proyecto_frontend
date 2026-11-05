import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <section className="mx-auto max-w-md py-10">
      <div className="space-y-6 rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <header className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </header>
        {children}
        {footer && <div className="text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </section>
  );
}