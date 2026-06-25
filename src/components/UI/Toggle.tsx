import React from 'react';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
}

/**
 * Accessible toggle switch with a minimum 44×44px touch target.
 * Track: 56×32px. Thumb: 24×24px.
 */
const Toggle: React.FC<ToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  label,
  description,
  id,
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).slice(2, 9)}`;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onChange(!enabled);
    }
  };

  return (
    <div className="flex items-center justify-between w-full">
      {(label || description) && (
        <div className="mr-4">
          {label && (
            <label
              htmlFor={toggleId}
              className="text-sm md:text-base font-medium text-white cursor-pointer"
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-400 mt-0.5">{description}</p>
          )}
        </div>
      )}

      {/* Touch target wrapper — 44px minimum */}
      <div
        className="flex items-center justify-center min-w-[44px] min-h-[44px]"
      >
        <button
          id={toggleId}
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={disabled}
          onClick={() => !disabled && onChange(!enabled)}
          onKeyDown={handleKeyDown}
          className={`
            relative w-14 h-8 rounded-full transition-all duration-250 touch-manipulation
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-base focus:ring-primary-500
            disabled:opacity-40 disabled:cursor-not-allowed
            ${enabled
              ? 'bg-primary-500 shadow-glow'
              : 'bg-surface-raised border border-surface-overlay'
            }
          `}
        >
          <div
            className={`
              absolute top-1 w-6 h-6 bg-white rounded-full shadow-md
              transition-transform duration-250 ease-in-out
              ${enabled ? 'translate-x-7' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
};

export default Toggle;
