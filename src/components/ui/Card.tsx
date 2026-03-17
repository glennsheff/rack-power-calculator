import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-aifi-gray bg-white p-6 ${className}`}>
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-aifi-black">{title}</h3>
      )}
      {children}
    </div>
  );
}
