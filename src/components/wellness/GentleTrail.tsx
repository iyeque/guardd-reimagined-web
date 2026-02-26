import { useEffect, useRef, FC, memo } from 'react';

export const GentleTrail: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  useEffect(() => {
    // Only enable for desktop
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      trailRef.current.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trailRef.current.length > 8) trailRef.current.shift();
    };

    const updateTrail = () => {
      if (containerRef.current) {
        const children = containerRef.current.children;
        const mainCursor = children[children.length - 1] as HTMLElement;
        
        if (mainCursor) {
          mainCursor.style.transform = `translate3d(${mouseRef.current.x - 12}px, ${mouseRef.current.y - 12}px, 0)`;
        }

        trailRef.current.forEach((point, i) => {
          point.age += 1;
          const trailEl = children[i] as HTMLElement;
          if (trailEl && i < children.length - 1) {
            const size = Math.max(0, 16 - (trailRef.current.length - i) * 2);
            trailEl.style.width = `${size}px`;
            trailEl.style.height = `${size}px`;
            trailEl.style.transform = `translate3d(${point.x - size/2}px, ${point.y - size/2}px, 0)`;
            trailEl.style.opacity = `${Math.max(0, 0.25 - (trailRef.current.length - i) * 0.04)}`;
          }
        });

        if (trailRef.current.length > 8) {
            trailRef.current = trailRef.current.slice(-8);
        }
      }
      rafRef.current = requestAnimationFrame(updateTrail);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Return null if not on desktop
  if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            backgroundColor: 'rgba(79, 209, 197, 0.2)',
            filter: 'blur(1px)',
            opacity: 0,
            willChange: 'transform, opacity'
          }}
        />
      ))}
      
      {/* Main cursor companion */}
      <div
        className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-[#FF9A8B] to-[#4FD1C5] 
          opacity-50 blur-[1px] pointer-events-none"
        style={{
          willChange: 'transform'
        }}
      />
    </div>
  );
};

export default memo(GentleTrail);
