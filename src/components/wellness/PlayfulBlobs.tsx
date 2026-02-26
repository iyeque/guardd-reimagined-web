import { useEffect, useRef, FC } from 'react';

export const PlayfulBlobs: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    const blobs = containerRef.current?.querySelectorAll<HTMLDivElement>('.blob');

    const updateParallax = () => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const moveX = (mouseX - centerX) / 50;
      const moveY = (mouseY - centerY) / 50;

      blobs?.forEach((blob, index) => {
        const speed = (index + 1) * 0.5;
        blob.style.transform = `translate(${moveX * speed}px, ${moveY * speed}px)`;
      });

      rafRef.current = requestAnimationFrame(updateParallax);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Blob 1 - Coral/Peach */}
      <div className="blob absolute -top-[10%] -left-[10%] w-[500px] h-[500px] 
        bg-gradient-to-br from-[#FF9A8B] to-[#FF6B9D] rounded-full 
        opacity-40 dark:opacity-25 blur-[80px] animate-blob-1 transition-opacity duration-700
        will-change-transform" style={{ willChange: 'transform' }} />
      
      {/* Blob 2 - Mint/Teal */}
      <div className="blob absolute top-[20%] -right-[10%] w-[400px] h-[400px] 
        bg-gradient-to-br from-[#4FD1C5] to-[#38B2AC] rounded-full 
        opacity-30 dark:opacity-20 blur-[70px] animate-blob-2 transition-opacity duration-700
        will-change-transform" style={{ willChange: 'transform' }} />
      
      {/* Blob 3 - Lavender */}
      <div className="blob absolute -bottom-[10%] left-[20%] w-[450px] h-[450px] 
        bg-gradient-to-br from-[#B794F4] to-[#9F7AEA] rounded-full 
        opacity-35 dark:opacity-20 blur-[75px] animate-blob-3 transition-opacity duration-700
        will-change-transform" style={{ willChange: 'transform' }} />
      
      {/* Blob 4 - Sunny Yellow (smaller accent) */}
      <div className="blob absolute top-[60%] right-[20%] w-[200px] h-[200px] 
        bg-gradient-to-br from-[#F6E05E] to-[#D69E2E] rounded-full 
        opacity-25 dark:opacity-15 blur-[50px] animate-blob-4 transition-opacity duration-700
        will-change-transform" style={{ willChange: 'transform' }} />

      {/* Soft Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.02)_1px,_transparent_1px)] 
        bg-[size:24px_24px] dark:bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.015)_1px,_transparent_1px)]" />
    </div>
  );
};
