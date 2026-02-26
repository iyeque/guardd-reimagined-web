import { useEffect, useRef, FC, memo } from 'react';

/**
 * Optimized Unified Background
 * Combines PlayfulBlobs and BreathingGradient into a single layer
 * Reductes total blur operations and DOM elements
 */
const UnifiedBackground: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    const blobs = containerRef.current?.querySelectorAll<HTMLDivElement>('.unified-blob');

    const updateParallax = () => {
      if (!blobs) return;
      
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (mouseX - centerX) / 60; // Slightly reduced movement for better performance
      const moveY = (mouseY - centerY) / 60;

      blobs.forEach((blob, index) => {
        const speed = (index + 1) * 0.4;
        // Using translate3d for hardware acceleration
        blob.style.transform = `translate3d(${moveX * speed}px, ${moveY * speed}px, 0)`;
      });

      rafRef.current = requestAnimationFrame(updateParallax);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Only enable parallax on non-touch devices to save mobile battery
    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      rafRef.current = requestAnimationFrame(updateParallax);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-background">
      {/* Base ambient gradient - Static and cheap */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F5] via-[#F0FFF4] to-[#E6FFFA] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]" />
      
      {/* Primary Animated Blobs - Reduced count and optimized blur */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Coral/Peach Blob */}
        <div className="unified-blob absolute -top-[10%] -left-[10%] w-[45vw] h-[45vw] 
          bg-[#FF9A8B]/30 dark:bg-[#FF9A8B]/15 rounded-full blur-[60px] 
          animate-drift-1" style={{ willChange: 'transform' }} />
        
        {/* Mint/Teal Blob */}
        <div className="unified-blob absolute top-[20%] -right-[10%] w-[35vw] h-[35vw] 
          bg-[#4FD1C5]/25 dark:bg-[#4FD1C5]/10 rounded-full blur-[50px] 
          animate-drift-2" style={{ willChange: 'transform' }} />
        
        {/* Lavender Blob */}
        <div className="unified-blob absolute -bottom-[10%] left-[20%] w-[40vw] h-[40vw] 
          bg-[#B794F4]/25 dark:bg-[#B794F4]/15 rounded-full blur-[60px] 
          animate-drift-3" style={{ willChange: 'transform' }} />
      </div>

      {/* Subtle Noise Overlay - Single layer instead of two */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9Im4iPjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIuNzUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSInbm9pc2VGZWUnIGZpbHRlcj0idXJsKCNuKSIvPjwvc3ZnPg==')]" />
    </div>
  );
};

export default memo(UnifiedBackground);
