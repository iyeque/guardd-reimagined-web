
import React, { useEffect, useRef, useState } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  color: string;
  text: string;
  isWellness: boolean;
}

const DigitalWellnessGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [stress, setStress] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const bubblesRef = useRef<Bubble[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw bubbles
      bubblesRef.current.forEach((bubble, index) => {
        bubble.y -= bubble.speed;
        if (bubble.y < -bubble.radius) {
          bubblesRef.current.splice(index, 1);
        }

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(bubble.text, bubble.x, bubble.y + 4);
      });

      // Add new bubbles
      if (Math.random() < 0.02) {
        const radius = Math.random() * 20 + 10;
        const x = Math.random() * (canvas.width - radius * 2) + radius;
        const y = canvas.height + radius;
        const speed = Math.random() * 2 + 1;
        const isWellness = Math.random() > 0.3;
        const color = isWellness ? '#4ade80' : '#f87171';
        const text = isWellness ? 'Wellness' : 'Distraction';
        bubblesRef.current.push({ x, y, radius, speed, color, text, isWellness });
      }

      // Update stress
      setStress(prevStress => {
        const newStress = prevStress + 0.1;
        if (newStress >= 100) {
          setGameOver(true);
        }
        return newStress;
      });

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (!gameOver) {
      gameLoop();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameOver]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if a bubble was clicked
    bubblesRef.current.forEach((bubble, index) => {
      const distance = Math.sqrt(Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2));
      if (distance < bubble.radius) {
        if (bubble.isWellness) {
          setScore(prevScore => prevScore + 10);
          setStress(prevStress => Math.max(0, prevStress - 10));
        } else {
          setStress(prevStress => Math.min(100, prevStress + 10));
        }
        bubblesRef.current.splice(index, 1);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-black/70 border border-green-500/30 rounded-lg shadow-lg p-8 backdrop-blur-sm text-white">
      <h2 className="text-2xl font-bold text-center mb-4 text-white">Digital Wellness Game</h2>
      <div className="flex justify-between mb-4">
        <div className="text-green-400 font-bold">Score: {score}</div>
        <div className="text-red-400 font-bold">Stress: {stress.toFixed(0)}%</div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="bg-gray-900 rounded-lg border border-gray-700 w-full"
        onClick={handleCanvasClick}
      ></canvas>
      {gameOver && (
        <div className="text-center mt-4">
          <h3 className="text-xl font-bold text-white">Game Over</h3>
          <p className="text-gray-200">Your final score is {score}</p>
          <button
            className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg"
            onClick={() => {
              setScore(0);
              setStress(0);
              setGameOver(false);
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default DigitalWellnessGame;
