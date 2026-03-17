import React from 'react';

interface BadgeProps {
  variant?: 'blue' | 'gray' | 'green' | 'red' | 'yellow';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className = '' }: BadgeProps) {
  const variants = {
    blue: 'bg-aifi-blue-10 text-aifi-blue',
    gray: 'bg-aifi-gray-50 text-aifi-black-60',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    yellow: 'bg-amber-50 text-amber-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
