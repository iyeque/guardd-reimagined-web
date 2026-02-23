import React, { useEffect, useRef, useState } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  text: string;
  isWellness: boolean;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const DigitalWellnessPop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [score, setScore] = useState(0);
  const [stress, setStress] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  const createParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color
      });
    }
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  };

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = (time - lastTimeRef.current) / 1000;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Clear with slight trail
      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
        else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color.replace(')', `, ${p.life})`).replace('rgb', 'rgba');
          ctx.fill();
        }
      });

      // Update and draw bubbles
      bubblesRef.current.forEach((b, i) => {
        b.y -= b.speed * 60 * deltaTime;
        if (b.y < -b.radius) bubblesRef.current.splice(i, 1);
        else {
          ctx.beginPath();
          const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
          gradient.addColorStop(0, b.color);
          gradient.addColorStop(1, 'rgba(255,255,255,0.1)');
          
          ctx.fillStyle = gradient;
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = 'white';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(b.text, b.x, b.y + 4);
        }
      });

      // Spawn bubbles
      if (Math.random() < 0.03) {
        const isWellness = Math.random() > 0.4;
        const radius = Math.random() * 25 + 20;
        bubblesRef.current.push({
          x: Math.random() * (width - radius * 2) + radius,
          y: height + radius,
          radius,
          speed: (Math.random() * 2 + 1.5) + (score / 500),
          color: isWellness ? 'rgb(74, 222, 128)' : 'rgb(248, 113, 113)',
          text: isWellness ? 'FOCUS' : 'ALERTS',
          isWellness,
          opacity: 1
        });
      }

      // Smoothly update stress
      setStress(prev => {
        const next = prev + 0.08;
        if (next >= 100) setGameOver(true);
        return next;
      });
    }
    
    lastTimeRef.current = time;
    if (!gameOver) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameOver, score]);

  const handlePointer = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    bubblesRef.current.forEach((b, i) => {
      const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2);
      if (dist < b.radius) {
        createParticles(b.x, b.y, b.color);
        if (b.isWellness) {
          setScore(s => s + 10);
          setStress(prev => Math.max(0, prev - 8));
        } else {
          setStress(prev => Math.min(100, prev + 15));
        }
        bubblesRef.current.splice(i, 1);
      }
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-1">Total Score</div>
          <div className="text-4xl font-black text-green-400">{score}</div>
        </div>
        <div className="w-48">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-red-400">DIGITAL STRESS</span>
            <span>{Math.floor(stress)}%</span>
          </div>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
              style={{ width: `${stress}%` }}
            />
          </div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className="relative aspect-video bg-gray-900 rounded-[2rem] border border-white/10 overflow-hidden cursor-crosshair shadow-2xl shadow-black"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          onPointerDown={handlePointer}
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
            <div className="space-y-6">
              <h2 className="text-5xl font-black text-white italic tracking-tighter">SCREEN OVERLOAD!</h2>
              <p className="text-gray-400 text-lg">You maintained balance for a total score of <span className="text-green-400 font-bold">{score}</span>.</p>
              <Button 
                onClick={() => {
                  setScore(0);
                  setStress(0);
                  setGameOver(false);
                  bubblesRef.current = [];
                  lastTimeRef.current = undefined;
                }}
                className="bg-green-500 hover:bg-green-600 text-black font-black px-12 py-8 text-xl rounded-full shadow-[0_0_30px_rgba(74,222,128,0.4)]"
              >
                TRY AGAIN
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-center text-gray-500 text-sm italic">
        Pop the green <span className="text-green-400 font-bold">FOCUS</span> bubbles to stay calm. Avoid <span className="text-red-400 font-bold">ALERTS</span>!
      </p>
    </div>
  );
};

export default DigitalWellnessPop;
