'use client';

import useFluidCursor from '@/hooks/useFluidCursor';

const FluidCursorWrapper: React.FC = () => {
  const canvasRef = useFluidCursor();

  if (!canvasRef.current) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default FluidCursorWrapper; 