import { useEffect, RefObject } from 'react';

/**
 * Hook that triggers a callback when a click occurs outside the referenced element
 */
export function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void,
  activeWhen: boolean = true
) {
  useEffect(() => {
    if (!activeWhen) return;
    
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, activeWhen]);
} 