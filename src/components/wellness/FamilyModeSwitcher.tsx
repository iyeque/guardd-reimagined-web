import { motion, AnimatePresence } from 'framer-motion';
import { FC, useState } from 'react';

import type { FamilyMode } from '@/lib/profiles';

interface FamilyModeSwitcherProps {
  currentMode: FamilyMode;
  onModeChange: (mode: FamilyMode) => void;
}

export const FamilyModeSwitcher: FC<FamilyModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  const [isHovered, setIsHovered] = useState(false);

  const modes: { id: FamilyMode; label: string; icon: string; color: string; desc: string }[] = [
    { id: 'parent', label: 'Parent', icon: '🌿', color: '#4FD1C5', desc: 'Tools' },
    { id: 'child', label: 'Kids', icon: '🎨', color: '#FF9A8B', desc: 'Fun' },
    { id: 'family', label: 'Together', icon: '❤️', color: '#F6E05E', desc: 'Shared' },
  ];

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-tour="family-mode-switcher"
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-2 no-print"
      initial={false}
    >
      <motion.div 
        className="flex flex-col gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full shadow-2xl border border-white/20 overflow-hidden"
        animate={{ width: isHovered ? 'auto' : '52px' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {modes.map((mode) => (
          <motion.button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`relative h-10 rounded-full flex items-center transition-all ${
              currentMode === mode.id 
                ? 'text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={mode.label}
            style={{ minWidth: '40px' }}
          >
            {currentMode === mode.id && (
              <motion.div
                layoutId="activeModeBG"
                className="absolute inset-0 rounded-full shadow-lg"
                style={{ backgroundColor: mode.color }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 w-10 flex items-center justify-center text-xl">{mode.icon}</span>
            <AnimatePresence>
              {isHovered && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="relative z-10 font-black text-xs pr-4 whitespace-nowrap"
                >
                  {mode.label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </motion.div>
      
      {/* Tiny mode indicator dot */}
      {!isHovered && (
        <motion.div 
          layoutId="activeDot"
          className="w-2 h-2 rounded-full mr-5"
          style={{ backgroundColor: modes.find(m => m.id === currentMode)?.color }}
        />
      )}
    </motion.div>
  );
};
