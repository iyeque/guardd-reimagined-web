import { motion } from 'framer-motion';
import { FC, ReactNode, MouseEventHandler } from 'react';

interface BreathingButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const BreathingButton: FC<BreathingButtonProps> = ({ children, onClick, className = "" }) => {
  return (
    <motion.button
      className={`relative px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden group ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Breathing ring animation on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl border-2 border-[#4FD1C5] opacity-0 group-hover:opacity-100"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-[#4FD1C5]/20 rounded-2xl"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
      
      <span className="relative z-10 font-medium text-slate-700 dark:text-slate-200">
        {children}
      </span>
    </motion.button>
  );
};
