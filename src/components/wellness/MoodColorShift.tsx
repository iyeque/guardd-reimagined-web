import { useEffect, useState, FC, memo } from 'react';
import { motion } from 'framer-motion';

type Mood = 'calm' | 'focus' | 'play' | 'rest';

export const MoodColorShift: FC = () => {
  const [mood, setMood] = useState<Mood>('calm');
// ... rest same
  const moodPalettes: Record<Mood, { primary: string; secondary: string; accent: string }> = {
    calm: { primary: '#FF9A8B', secondary: '#4FD1C5', accent: '#B794F4' },
    focus: { primary: '#63B3ED', secondary: '#68D391', accent: '#F6AD55' },
    play: { primary: '#F6E05E', secondary: '#FF6B9D', accent: '#4FD1C5' },
    rest: { primary: '#9F7AEA', secondary: '#A0AEC0', accent: '#4A5568' }
  };

  useEffect(() => {
    const updateMood = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) setMood('focus'); // Morning focus
      else if (hour >= 12 && hour < 17) setMood('play'); // Afternoon play
      else if (hour >= 17 && hour < 20) setMood('calm'); // Evening wind-down
      else setMood('rest'); // Night rest
    };

    updateMood();
    const interval = setInterval(updateMood, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="fixed inset-0 -z-20 pointer-events-none"
      style={{ willChange: 'background' }}
      animate={{
        background: `radial-gradient(circle at 20% 50%, ${moodPalettes[mood].primary}15 0%, transparent 50%),
                     radial-gradient(circle at 80% 80%, ${moodPalettes[mood].secondary}10 0%, transparent 50%)`
      }}
      transition={{ duration: 3, ease: "easeInOut" }}
    />
  );
};

export default memo(MoodColorShift);
