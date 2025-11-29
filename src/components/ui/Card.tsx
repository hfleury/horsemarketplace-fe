import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}