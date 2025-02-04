import React from 'react';

export default function LoadingSpinner({ size = 'default' }) {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          ${sizeClasses[size] || sizeClasses.default}
          animate-spin
          rounded-full
          border-solid
          border-blue-500
          border-t-transparent
        `}
      />
    </div>
  );
} 