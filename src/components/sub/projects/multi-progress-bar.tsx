import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

export type ProgressSegment = {
  value: number;
  color?: string;
  priority?: number;
};

type Props = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  segments: ProgressSegment[];
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Props
>(({ className, segments, ...props }, ref) => {
  // Use the segments in their existing order (already sorted by priority from getTaskStatusSegments)
  // Higher priority segments will be rendered first with a higher z-index
  const segmentsWithIndex = segments.map((segment, index) => ({
    ...segment,
    zIndex: segments.length - index
  }));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/30',
        className
      )}
      {...props}
    >
      {segmentsWithIndex.map((segment, index) => (
        <ProgressPrimitive.Indicator
          key={index}
          className={cn(
            'h-full transition-all duration-300 ease-in-out absolute top-0',
            // Only round the right edge of the rightmost segment
            index === 0 ? 'rounded-r-full' : '',
            // Only round the left edge of the leftmost segment (if it starts at 0)
            index === segmentsWithIndex.length - 1 ? 'rounded-l-full' : '',
            segment.color ? segment.color : 'bg-primary'
          )}
          style={{
            width: `${segment.value}%`,
            left: '0%',
            zIndex: segment.zIndex,
            opacity: 0.9, // Slight transparency for better visual appearance
          }}
        />
      ))}
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = 'Progress';

export { Progress };