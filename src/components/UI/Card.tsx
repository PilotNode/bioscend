import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div
      className={`bg-surface-elevated border border-surface-raised rounded-2xl p-4 md:p-6 ${
        hover ? 'hover:bg-surface-raised transition-colors duration-200' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;