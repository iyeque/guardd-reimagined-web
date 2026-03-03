import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Zap, Heart, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  text: string;
  type: 'focus' | 'alert' | 'bonus' | 'calm';
  opacity: number;
  pulse: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
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
  const [combo, setCombo] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const bubblesRef = useRef<Bubble[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('wellness-pop-highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  const createFloatingText = (x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({ x, y, text, life: 1.0, color });
  };

  const animate = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    const delta = (time - lastTimeRef.current) / 1000;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particlesRef.current.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.life -= 0.02;
      
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      if (p.life <= 0) particlesRef.current.splice(i, 1);
    });
    ctx.globalAlpha = 1.0;

    // Update and draw floating texts
    floatingTextsRef.current.forEach((t, i) => {
      t.y -= 1;
      t.life -= 0.02;
      ctx.fillStyle = t.color;
      ctx.globalAlpha = t.life;
      ctx.font = 'bold 20px Montserrat, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      if (t.life <= 0) floatingTextsRef.current.splice(i, 1);
    });
    ctx.globalAlpha = 1.0;

    // Update and draw bubbles
    bubblesRef.current.forEach((b, i) => {
      b.y -= b.speed;
      b.pulse += 0.05;
      const pulseScale = 1 + Math.sin(b.pulse) * 0.1;
      
      if (b.y < -b.radius) {
        if (b.type === 'focus') {
           setStress(prev => Math.min(100, prev + 5));
           setCombo(0);
        }
        bubblesRef.current.splice(i, 1);
      } else {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius * pulseScale);
        gradient.addColorStop(0, b.color);
        gradient.addColorStop(1, 'rgba(255,255,255,0.05)');
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = b.color;
        ctx.fillStyle = gradient;
        ctx.arc(b.x, b.y, b.radius * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'black 12px Montserrat, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.text, b.x, b.y + 5);
      }
    });

    // Spawn bubbles
    if (Math.random() < 0.035 + (score / 10000)) {
      const rand = Math.random();
      let type: Bubble['type'] = 'focus';
      let text = 'FOCUS';
      let color = 'rgb(74, 222, 128)';
      
      if (rand < 0.3) {
        type = 'alert';
        text = 'ALERTS';
        color = 'rgb(248, 113, 113)';
      } else if (rand > 0.95) {
        type = 'bonus';
        text = 'ZEN';
        color = 'rgb(129, 140, 248)';
      } else if (rand > 0.9) {
        type = 'calm';
        text = 'CALM';
        color = 'rgb(45, 212, 191)';
      }

      const radius = Math.random() * 20 + 25;
      bubblesRef.current.push({
        x: Math.random() * (width - radius * 2) + radius,
        y: height + radius,
        radius,
        speed: (Math.random() * 1.5 + 1.5) + (score / 1000),
        color,
        text,
        type,
        opacity: 1,
        pulse: Math.random() * Math.PI
      });
    }

    // Smoothly update stress
    setStress(prev => {
      const baseIncrease = 0.05 + (score / 5000);
      const next = prev + baseIncrease;
      if (next >= 100) {
        setGameOver(true);
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('wellness-pop-highscore', score.toString());
        }
      }
      return Math.min(100, next);
    });
    
    lastTimeRef.current = time;
    if (!gameOver && gameStarted) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [gameStarted, gameOver, score, highScore]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameOver, gameStarted, animate]);

  const handlePointer = (e: React.PointerEvent) => {
    if (!gameStarted || gameOver) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hit = false;
    bubblesRef.current.forEach((b, i) => {
      const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2);
      if (dist < b.radius * 1.2) {
        hit = true;
        createParticles(b.x, b.y, b.color, b.type === 'bonus' ? 25 : 12);
        
        if (b.type === 'focus') {
          const comboBonus = Math.min(combo, 10);
          setScore(s => s + 10 + comboBonus);
          setCombo(c => c + 1);
          setStress(prev => Math.max(0, prev - 3));
          createFloatingText(b.x, b.y, `+${10 + comboBonus}`, '#4ade80');
        } else if (b.type === 'alert') {
          setStress(prev => Math.min(100, prev + 15));
          setCombo(0);
          createFloatingText(b.x, b.y, `STRESS!`, '#f87171');
        } else if (b.type === 'bonus') {
          setScore(s => s + 50);
          setStress(prev => Math.max(0, prev - 10));
          createFloatingText(b.x, b.y, `BONUS +50`, '#818cf8');
        } else if (b.type === 'calm') {
          setStress(prev => Math.max(0, prev - 20));
          createFloatingText(b.x, b.y, `CALM -20%`, '#2dd4bf');
        }
        
        bubblesRef.current.splice(i, 1);
      }
    });

    if (!hit) {
      setCombo(0);
    }
  };

  const startGame = () => {
    setScore(0);
    setStress(0);
    setGameOver(false);
    setCombo(0);
    setGameStarted(true);
    bubblesRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    lastTimeRef.current = 0;
  };

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = 500;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 p-4 md:p-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Score</div>
          <div className="text-3xl font-black text-white">{score}</div>
        </Card>
        <Card className="bg-white/5 border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Stress Level</div>
          <div className="w-full bg-white/10 h-3 rounded-full mt-2 overflow-hidden border border-white/5">
            <motion.div 
              className={cn(
                "h-full transition-all duration-300",
                stress > 70 ? "bg-red-500" : stress > 40 ? "bg-orange-500" : "bg-green-500"
              )}
              animate={{ width: `${stress}%` }}
            />
          </div>
        </Card>
        <Card className="bg-white/5 border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Combo</div>
          <div className="text-3xl font-black text-indigo-400">x{combo}</div>
        </Card>
        <Card className="bg-white/5 border-white/10 p-4 rounded-3xl backdrop-blur-md">
          <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">Best</div>
          <div className="text-3xl font-black text-yellow-400">{highScore}</div>
        </Card>
      </div>

      <div 
        ref={containerRef}
        className="relative aspect-video md:aspect-[21/9] bg-slate-900/50 rounded-[3rem] border-4 border-white/10 overflow-hidden backdrop-blur-xl shadow-2xl cursor-crosshair group"
      >
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 z-20 p-8 text-center">
            <div className="bg-green-500/20 p-6 rounded-full mb-6 border-2 border-green-500/20 animate-pulse">
               <Zap className="w-16 h-16 text-green-400" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">Wellness Pop</h2>
            <p className="text-slate-400 max-w-md mb-8 font-medium">Pop the <span className="text-green-400 font-black underline">FOCUS</span> bubbles to keep your stress low. Avoid the red <span className="text-red-400 font-black underline">ALERTS</span> at all costs!</p>
            <Button 
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-8 rounded-2xl font-black text-2xl shadow-xl shadow-green-500/20 transition-transform hover:scale-105"
            >
              START MISSION
            </Button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 z-20 p-8 text-center animate-in fade-in duration-500">
            <div className="bg-red-500/20 p-6 rounded-full mb-6 border-2 border-red-500/20">
               <AlertCircle className="w-16 h-16 text-red-400" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter uppercase italic">Burnout!</h2>
            <p className="text-red-200 text-xl font-bold mb-8">Digital fatigue has set in. Time for a real-world break!</p>
            <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-xs">
              <div className="bg-white/10 p-4 rounded-2xl">
                <div className="text-[10px] uppercase font-black text-red-300">Final Score</div>
                <div className="text-3xl font-black text-white">{score}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl">
                <div className="text-[10px] uppercase font-black text-red-300">High Score</div>
                <div className="text-3xl font-black text-white">{highScore}</div>
              </div>
            </div>
            <Button 
              onClick={startGame}
              className="bg-white text-red-950 hover:bg-slate-100 px-12 py-8 rounded-2xl font-black text-2xl shadow-xl transition-transform hover:scale-105"
            >
              TRY AGAIN
            </Button>
          </div>
        )}

        <canvas 
          ref={canvasRef}
          onPointerDown={handlePointer}
          className="w-full h-full block"
        />

        <div className="absolute top-6 right-6 flex flex-col gap-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Focus +10</span>
           </div>
           <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Alerts +Stress</span>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md">
         <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border-2 border-indigo-500/20">
               <Trophy className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
               <h4 className="text-white font-black uppercase tracking-tighter text-xl">Did You Know?</h4>
               <p className="text-slate-400 text-sm font-medium">Multitasking with notifications can lower your IQ by 10 points.</p>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="flex flex-col items-center">
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</div>
               <div className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20 text-[10px] font-black uppercase">Live Training</div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DigitalWellnessPop;
