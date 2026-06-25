import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
  width?: string | number;
  height?: string | number;
}

/**
 * Animated skeleton placeholder for loading states.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
}) => {
  const baseClass = 'animate-shimmer bg-surface-raised';
  const shapeClass =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded-md'
      : 'rounded-xl';

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClass} ${shapeClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * Skeleton card mimicking a supplement/wellness card.
 */
export const SkeletonCard: React.FC = () => (
  <div className="bg-surface-elevated border border-surface-raised rounded-2xl p-4 md:p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <Skeleton variant="rect" width={40} height={40} className="rounded-xl" />
        <div className="space-y-2">
          <Skeleton variant="text" width={120} height={16} />
          <Skeleton variant="text" width={80} height={12} />
        </div>
      </div>
      <div className="flex space-x-2">
        <Skeleton variant="rect" width={32} height={32} className="rounded-lg" />
        <Skeleton variant="rect" width={32} height={32} className="rounded-lg" />
      </div>
    </div>
    <Skeleton variant="text" width="60%" height={12} />
  </div>
);

/**
 * Skeleton stat card for dashboard.
 */
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-surface-elevated border border-surface-raised rounded-2xl p-4 md:p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton variant="text" width={100} height={16} />
        <Skeleton variant="text" width={60} height={28} />
        <Skeleton variant="text" width={80} height={12} />
      </div>
      <Skeleton variant="circle" width={60} height={60} />
    </div>
  </div>
);

/**
 * Skeleton schedule item.
 */
export const SkeletonScheduleItem: React.FC = () => (
  <div className="bg-surface-elevated border border-surface-raised rounded-xl p-4 flex items-center space-x-3">
    <Skeleton variant="circle" width={20} height={20} />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" width="50%" height={14} />
      <Skeleton variant="text" width="30%" height={11} />
    </div>
    <Skeleton variant="text" width={48} height={24} className="rounded-lg" />
  </div>
);

export default Skeleton;
