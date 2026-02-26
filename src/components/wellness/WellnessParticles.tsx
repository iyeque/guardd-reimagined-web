import { useRef, FC, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const PARTICLE_CONFIG = [
  { color: '#FF9A8B', size: 12, delay: 0, x: '10%', y: '20%' },
  { color: '#4FD1C5', size: 8, delay: 0.5, x: '80%', y: '15%' },
  { color: '#B794F4', size: 10, delay: 1, x: '70%', y: '60%' },
  { color: '#F6E05E', size: 6, delay: 1.5, x: '20%', y: '70%' },
];

export const WellnessParticles: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  
  // Different scroll speeds for parallax depth
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-5 pointer-events-none overflow-hidden">
      {PARTICLE_CONFIG.map((particle, index) => {
        const yTransform = index % 2 === 0 ? y1 : y2;
        
        return (
          <motion.div
            key={index}
            className="absolute rounded-full blur-[1px]"
            style={{
              backgroundColor: particle.color,
              width: particle.size * 4,
              height: particle.size * 4,
              left: particle.x,
              top: particle.y,
              y: yTransform,
              opacity: 0.5,
              willChange: 'transform'
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 5, -5, 0],
            }}
            transition={{
              duration: 10 + particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay: particle.delay,
            }}
          />
        );
      })}
    </div>
  );
};

export default memo(WellnessParticles);
