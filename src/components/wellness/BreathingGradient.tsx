import { FC } from 'react';

export const BreathingGradient: FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient that shifts slowly */}
      <div className="absolute inset-0 animate-breathe bg-gradient-to-br 
        from-[#FFF5F5] via-[#F0FFF4] to-[#E6FFFA] 
        dark:from-[#1A202C] dark:via-[#2D3748] dark:to-[#1A202C] 
        transition-colors duration-1000" 
      />
      
      {/* Moving color orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 
          bg-[#FF9A8B] rounded-full mix-blend-multiply filter blur-3xl 
          opacity-30 animate-drift-1 dark:opacity-15 dark:mix-blend-screen" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 
          bg-[#4FD1C5] rounded-full mix-blend-multiply filter blur-3xl 
          opacity-30 animate-drift-2 dark:opacity-15 dark:mix-blend-screen" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 
          bg-[#B794F4] rounded-full mix-blend-multiply filter blur-3xl 
          opacity-30 animate-drift-3 dark:opacity-15 dark:mix-blend-screen" />
      </div>

      {/* Soft noise texture for warmth */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] 
        bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
    </div>
  );
};
