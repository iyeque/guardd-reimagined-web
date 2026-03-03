import { motion, AnimatePresence } from 'framer-motion';
import { useState, FC, memo } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RuleCardProps {
  title: string;
  description: string;
  whyItMatters: string;
  icon: string;
  category: 'screen' | 'safety' | 'comms' | 'custom';
  isAgreed: boolean;
  onAgree: (agreed: boolean) => void;
}

const categoryColors = {
  screen: { bg: '#4FD1C5', light: 'bg-teal-50 dark:bg-teal-950/30', border: 'border-teal-200 dark:border-teal-800' },
  safety: { bg: '#FF9A8B', light: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800' },
  comms: { bg: '#B794F4', light: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800' },
  custom: { bg: '#F6E05E', light: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800' },
};

export const RuleCard: FC<RuleCardProps> = memo(({ title, description, whyItMatters, icon, category, isAgreed, onAgree }) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = categoryColors[category];

  return (
    <motion.div
      className={cn(
        "relative p-6 rounded-3xl cursor-pointer overflow-hidden border-2 transition-all duration-300",
        isAgreed ? cn(colors.light, colors.border) : "bg-white/60 dark:bg-black/20 border-border hover:border-primary/30"
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onAgree(!isAgreed)}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated background fill on agree */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: colors.bg, opacity: 0.05 }}
        initial={{ scale: 0, borderRadius: '100%' }}
        animate={{ 
          scale: isAgreed ? 3 : 0,
        }}
        transition={{ duration: 0.5 }}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Animated checkbox */}
        <motion.div
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1"
          style={{ borderColor: isAgreed ? colors.bg : '#cbd5e0' }}
          animate={{ 
            backgroundColor: isAgreed ? colors.bg : 'transparent',
            scale: isAgreed ? [1, 1.1, 1] : 1
          }}
        >
          {isAgreed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-6 h-6 text-white stroke-[4]" />
            </motion.div>
          )}
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl" role="img" aria-label="icon">{icon}</span>
            <h3 className="font-black text-xl text-slate-900 dark:text-white tracking-tight">{title}</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
        </div>
      </div>

      {/* Hover reveal - "Why this matters" */}
      <AnimatePresence>
        {(isHovered || isAgreed) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400 italic font-bold">
              💡 {whyItMatters}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

RuleCard.displayName = 'RuleCard';
