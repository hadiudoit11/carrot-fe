import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const useFluidCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const pathname = usePathname();

  useEffect(() => {
    // Only show on homepage
    const isDashboardRoute = pathname?.startsWith('/(dashboard)') || pathname?.startsWith('/dashboard');
    const isDefaultRoute = pathname === '/' || pathname === '';
    if (!isDefaultRoute || isDashboardRoute) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Example minimal placeholder (replace with full logic):
    const ctx = canvas.getContext('2d');
    let running = true;
    function draw() {
      if (!running || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ...draw fluid effect...
      animationRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      running = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [pathname]);

  return canvasRef;
};

export default useFluidCursor; 