import { useState, FC, ReactNode, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface AgreementJourneyProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (index: number) => void;
  children: ReactNode;
}

export const AgreementJourney: FC<AgreementJourneyProps> = memo(({ steps, currentStep, onStepChange, children }) => {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Path - Visual journey tracker */}
      <div className="relative mb-16 px-4">
        <div className="absolute top-6 left-12 right-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-teal-400 via-rose-400 to-purple-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "circOut" }}
          />
        </div>
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <motion.button
              key={step.id}
              className={cn(
                "relative flex flex-col items-center gap-3 transition-all duration-500",
                index <= currentStep ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
              )}
              onClick={() => onStepChange(index)}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-4 transition-colors duration-500",
                  index === currentStep 
                    ? "border-white dark:border-slate-900 ring-4" 
                    : "border-transparent"
                )}
                style={{ 
                  backgroundColor: index <= currentStep ? step.color : 'rgb(226, 232, 240)',
                  boxShadow: index === currentStep ? `0 0 30px ${step.color}60` : 'none',
                  // @ts-expect-error - ringColor is a custom property for motion
                  ringColor: step.color
                }}
                animate={index === currentStep ? { 
                  y: [0, -4, 0],
                  rotate: [0, 5, -5, 0]
                } : {}}
                transition={index === currentStep ? { 
                  repeat: Infinity, 
                  duration: 3,
                  ease: "easeInOut"
                } : {}}
              >
                {step.icon}
              </motion.div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest hidden md:block transition-colors duration-500",
                index === currentStep ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[400px]"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

AgreementJourney.displayName = 'AgreementJourney';
