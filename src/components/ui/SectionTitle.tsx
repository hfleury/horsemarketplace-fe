import React from 'react';

interface SectionTitleProps {
  title: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  className?: string;
}

export default function SectionTitle({
  title,
  viewAllLabel,
  onViewAll,
  className = ''
}: SectionTitleProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
      {viewAllLabel && (
        <button
          onClick={onViewAll}
          className="text-primary-500 font-semibold hover:opacity-80 transition-opacity"
        >
          {viewAllLabel}
        </button>
      )}
    </div>
  );
}