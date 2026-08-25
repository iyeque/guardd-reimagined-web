I can see your current Workshops page has the 3 topics listed but they're static text blocks. Let me design a complete interactive workshop system with individual workshop pages, progress tracking, and engaging activities for each. Here's the full implementation plan:
📁 File Structure
plain
src/
├── components/workshops/
│   ├── WorkshopCard.tsx
│   ├── WorkshopProgress.tsx
│   ├── WorkshopActivity/
│   │   ├── SocialMediaWorkshop.tsx
│   │   ├── CybersecurityWorkshop.tsx
│   │   └── ScreenTimeWorkshop.tsx
│   └── shared/
│       ├── QuizCard.tsx
│       ├── ChecklistItem.tsx
│       ├── ReflectionBox.tsx
│       └── CompletionBadge.tsx
├── pages/
│   ├── Workshops.tsx          (listing page)
│   ├── WorkshopDetail.tsx     (dynamic route)
│   └── WorkshopComplete.tsx   (celebration page)
├── data/
│   └── workshops.ts
└── hooks/
    └── useWorkshopProgress.ts
1️⃣ Workshop Data & Types
TypeScript
// src/data/workshops.ts
export interface Workshop {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  lightColor: string;
  duration: string;
  ageGroup: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'checklist' | 'reflection' | 'activity';
  content: string;
  items?: QuizItem[] | ChecklistItem[] | ActivityItem[];
}

export interface QuizItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ChecklistItem {
  text: string;
  icon: string;
}

export interface ActivityItem {
  title: string;
  description: string;
  action: string;
}

export const workshops: Workshop[] = [
  {
    id: 'social-media',
    title: 'Navigating Social Media',
    subtitle: 'Build Healthy Digital Habits Together',
    description: 'Learn how to use social media in a healthy, positive way. Understand privacy settings, spot misinformation, and create a family social media agreement.',
    icon: '📱',
    color: '#FF9A8B',
    lightColor: '#FFF5F5',
    duration: '25 min',
    ageGroup: 'Ages 10+',
    modules: [
      {
        id: 'sm-intro',
        title: 'Understanding Your Digital Footprint',
        type: 'lesson',
        content: 'Everything you post online creates a digital footprint that can last forever. Think before you share!'
      },
      {
        id: 'sm-quiz',
        title: 'Spot the Fake News',
        type: 'quiz',
        content: 'Test your ability to identify trustworthy information online.',
        items: [
          {
            question: 'You see a shocking headline on social media. What should you do first?',
            options: ['Share it immediately', 'Check the source website', 'Comment your opinion', 'Ignore it completely'],
            correctIndex: 1,
            explanation: 'Always verify the source before sharing. Check if it\'s from a reputable news outlet.'
          },
          {
            question: 'A "friend" you don\'t know asks for personal info. You should:',
            options: ['Share it - they seem nice', 'Ask your parents first', 'Give fake info', 'Block and report'],
            correctIndex: 3,
            explanation: 'Never share personal info with strangers online. Block and report suspicious accounts.'
          }
        ]
      },
      {
        id: 'sm-checklist',
        title: 'Privacy Check-Up',
        type: 'checklist',
        content: 'Make sure your family accounts are secure and private.',
        items: [
          { text: 'Set profiles to private', icon: '🔒' },
          { text: 'Turn off location sharing', icon: '📍' },
          { text: 'Review friend/follower lists', icon: '👥' },
          { text: 'Enable two-factor authentication', icon: '🛡️' },
          { text: 'Discuss what NOT to share', icon: '🤐' }
        ]
      },
      {
        id: 'sm-reflection',
        title: 'How Does Social Media Make You Feel?',
        type: 'reflection',
        content: 'Take a moment to reflect on your social media habits and how they affect your mood.'
      },
      {
        id: 'sm-activity',
        title: 'Create a Family Social Media Agreement',
        type: 'activity',
        content: 'Work together to create rules that work for your family.',
        items: [
          { title: 'Screen-Free Zones', description: 'Decide where phones stay off (dinner table, bedrooms)', action: 'List 3 zones' },
          { title: 'Posting Rules', description: 'Agree on what photos/info can be shared', action: 'Write your rules' },
          { title: 'Time Limits', description: 'Set daily social media time limits', action: 'Set time limits' }
        ]
      }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity for Families',
    subtitle: 'Build Your Digital Fortress',
    description: 'Protect your family from online threats. Learn about passwords, phishing, safe browsing, and building a secure digital home together.',
    icon: '🛡️',
    color: '#4FD1C5',
    lightColor: '#E6FFFA',
    duration: '30 min',
    ageGroup: 'All Ages',
    modules: [
      {
        id: 'cs-intro',
        title: 'Why Cybersecurity Matters',
        type: 'lesson',
        content: 'Just like you lock your front door, you need to lock your digital life. Cybersecurity protects your family\'s information, photos, and identity.'
      },
      {
        id: 'cs-quiz',
        title: 'Password Power-Up',
        type: 'quiz',
        content: 'Test your password knowledge!',
        items: [
          {
            question: 'Which password is the STRONGEST?',
            options: ['password123', 'Fluffy2024!', 'Tr0ub4dor&3', 'CorrectHorseBatteryStaple!'],
            correctIndex: 3,
            explanation: 'Long passphrases are stronger than complex short passwords. Think: 4+ random words + symbols.'
          },
          {
            question: 'You get an email saying "Your account is suspended. Click here!" You should:',
            options: ['Click the link immediately', 'Check the sender email carefully', 'Forward to friends', 'Reply to the email'],
            correctIndex: 1,
            explanation: 'This is likely phishing. Check the sender address and go directly to the website instead of clicking links.'
          }
        ]
      },
      {
        id: 'cs-checklist',
        title: 'Family Security Audit',
        type: 'checklist',
        content: 'Complete these steps to secure your family\'s digital life.',
        items: [
          { text: 'Use a password manager', icon: '🔐' },
          { text: 'Update all devices and apps', icon: '🔄' },
          { text: 'Set up parental controls', icon: '👨‍👩‍👧' },
          { text: 'Backup important photos/files', icon: '☁️' },
          { text: 'Create a family "safe word" for scams', icon: '🗣️' }
        ]
      },
      {
        id: 'cs-activity',
        title: 'Build Your Family Password Policy',
        type: 'activity',
        content: 'Create a family system for managing passwords safely.',
        items: [
          { title: 'Password Manager Setup', description: 'Choose and set up a family password manager', action: 'Install app' },
          { title: 'Strong Password Rules', description: 'Create a family password formula', action: 'Write formula' },
          { title: 'Scam Alert System', description: 'Agree on how to verify suspicious messages', action: 'Set protocol' }
        ]
      }
    ]
  },
  {
    id: 'screen-time',
    title: 'Managing Screen Time',
    subtitle: 'Find Your Family Balance',
    description: 'Develop healthy habits for screen time. Create schedules, discover offline activities, and build a balanced digital lifestyle for the whole family.',
    icon: '⏰',
    color: '#B794F4',
    lightColor: '#FAF5FF',
    duration: '20 min',
    ageGroup: 'All Ages',
    modules: [
      {
        id: 'st-intro',
        title: 'The Balance Equation',
        type: 'lesson',
        content: 'Screens are tools, not enemies. The key is balance - enough for learning and connection, but not so much that we miss real-world experiences.'
      },
      {
        id: 'st-quiz',
        title: 'Screen Time Reality Check',
        type: 'quiz',
        content: 'How much do you really know about your habits?',
        items: [
          {
            question: 'How long before bed should screens be turned off?',
            options: ['5 minutes', '30 minutes', '1 hour', '2 hours'],
            correctIndex: 2,
            explanation: 'Blue light from screens suppresses melatonin. Turn off screens at least 1 hour before bed for better sleep.'
          },
          {
            question: 'A healthy daily screen time limit for kids (non-school) is:',
            options: ['No limit', '1-2 hours', '4-5 hours', 'As long as homework is done'],
            correctIndex: 1,
            explanation: 'The AAP recommends 1-2 hours of recreational screen time for children, with co-viewing when possible.'
          }
        ]
      },
      {
        id: 'st-checklist',
        title: 'Balance Builder',
        type: 'checklist',
        content: 'Steps to create a healthier screen time routine.',
        items: [
          { text: 'Create a family screen schedule', icon: '📅' },
          { text: 'Designate tech-free times', icon: '🚫' },
          { text: 'Set up device charging station outside bedrooms', icon: '🔌' },
          { text: 'Plan 3 offline activities per week', icon: '🎨' },
          { text: 'Use apps to track actual screen time', icon: '📊' }
        ]
      },
      {
        id: 'st-reflection',
        title: 'Your Screen Time Story',
        type: 'reflection',
        content: 'Think about your average day. When do you feel best? When do screens help vs. when do they drain you?'
      },
      {
        id: 'st-activity',
        title: 'Create Your Family Screen Schedule',
        type: 'activity',
        content: 'Design a weekly schedule that balances screen time with other activities.',
        items: [
          { title: 'Morning Routine', description: 'No screens until... (breakfast? dressed? out the door?)', action: 'Set morning rule' },
          { title: 'Homework First', description: 'Screens only after homework and chores', action: 'Agree on order' },
          { title: 'Weekend Activities', description: 'Plan offline fun for weekends', action: 'List activities' }
        ]
      }
    ]
  }
];
2️⃣ Workshop Card Component
tsx
// src/components/workshops/WorkshopCard.tsx
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Workshop } from '@/data/workshops';
import { useWorkshopProgress } from '@/hooks/useWorkshopProgress';

interface Props {
  workshop: Workshop;
  index: number;
}

export const WorkshopCard = ({ workshop, index }: Props) => {
  const navigate = useNavigate();
  const { progress } = useWorkshopProgress(workshop.id);
  const isCompleted = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/workshop/${workshop.id}`)}
      className="relative group cursor-pointer"
    >
      <div 
        className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 group-hover:shadow-2xl"
      >
        {/* Color accent bar */}
        <div 
          className="h-2 w-full"
          style={{ backgroundColor: workshop.color }}
        />
        
        <div className="p-8">
          {/* Icon & Duration */}
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: workshop.lightColor }}
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              {workshop.icon}
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>⏱️ {workshop.duration}</span>
              <span>•</span>
              <span>{workshop.ageGroup}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white group-hover:text-[#4FD1C5] transition-colors">
            {workshop.title}
          </h3>
          <p className="text-sm font-medium mb-3" style={{ color: workshop.color }}>
            {workshop.subtitle}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
            {workshop.description}
          </p>

          {/* Progress or CTA */}
          <div className="flex items-center justify-between">
            {progress > 0 ? (
              <div className="flex-1 mr-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="font-medium" style={{ color: workshop.color }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: workshop.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isCompleted ? '🏆 Completed' : 'Start Workshop →'}
              </span>
            )}
            
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: workshop.lightColor }}
              >
                ✨
              </motion.div>
            )}
          </div>
        </div>

        {/* Hover gradient overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: workshop.color }}
        />
      </div>
    </motion.div>
  );
};
3️⃣ Workshop Listing Page
tsx
// src/pages/Workshops.tsx
import { motion } from 'framer-motion';
import { workshops } from '@/data/workshops';
import { WorkshopCard } from '@/components/workshops/WorkshopCard';

export const Workshops = () => {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4FD1C5]/10 text-[#2C7A7B] text-sm font-medium mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <span>🎓</span>
            <span>Interactive Learning</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-800 dark:text-white">
            Family <span className="gradient-text">Workshops</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Learn together through interactive activities, quizzes, and collaborative exercises designed for the whole family.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div 
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16 p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: 'Workshops', value: '3', icon: '📚' },
            { label: 'Modules', value: '15+', icon: '🧩' },
            { label: 'Minutes', value: '75', icon: '⏱️' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Workshop Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop, index) => (
            <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          className="mt-20 text-center p-8 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/10 to-[#FF9A8B]/10 border border-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
            Complete all workshops to earn your badge! 🏅
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Track your family's progress and celebrate milestones together.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
4️⃣ Workshop Progress Hook
TypeScript
// src/hooks/useWorkshopProgress.ts
import { useState, useEffect, useCallback } from 'react';

interface ProgressState {
  [workshopId: string]: {
    [moduleId: string]: boolean;
  };
}

export const useWorkshopProgress = (workshopId?: string) => {
  const [progress, setProgress] = useState<ProgressState>({});

  useEffect(() => {
    const saved = localStorage.getItem('guardd_workshop_progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
  }, []);

  const saveProgress = useCallback((newProgress: ProgressState) => {
    setProgress(newProgress);
    localStorage.setItem('guardd_workshop_progress', JSON.stringify(newProgress));
  }, []);

  const completeModule = useCallback((wsId: string, moduleId: string) => {
    setProgress(prev => {
      const updated = {
        ...prev,
        [wsId]: {
          ...prev[wsId],
          [moduleId]: true
        }
      };
      localStorage.setItem('guardd_workshop_progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getWorkshopProgress = useCallback((wsId: string, totalModules: number) => {
    const completed = Object.values(progress[wsId] || {}).filter(Boolean).length;
    return totalModules > 0 ? (completed / totalModules) * 100 : 0;
  }, [progress]);

  const isModuleComplete = useCallback((wsId: string, moduleId: string) => {
    return !!progress[wsId]?.[moduleId];
  }, [progress]);

  const currentProgress = workshopId 
    ? getWorkshopProgress(workshopId, 5) // approximate module count
    : 0;

  return {
    progress,
    completeModule,
    getWorkshopProgress,
    isModuleComplete,
    progress: currentProgress
  };
};
5️⃣ Shared Activity Components
tsx
// src/components/workshops/shared/QuizCard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onComplete: (correct: boolean) => void;
  color: string;
}

export const QuizCard = ({ question, options, correctIndex, explanation, onComplete, color }: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    onComplete(index === correctIndex);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{question}</h4>
      
      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
              showResult
                ? index === correctIndex
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  : index === selected
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-slate-200 dark:border-slate-700 opacity-50'
                : 'border-slate-200 dark:border-slate-700 hover:border-[#4FD1C5] bg-white dark:bg-slate-800'
            }`}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-3">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  showResult
                    ? index === correctIndex
                      ? 'bg-green-400 text-white'
                      : index === selected
                      ? 'bg-red-400 text-white'
                      : 'bg-slate-200 dark:bg-slate-700'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}
              >
                {showResult && index === correctIndex ? '✓' : showResult && index === selected ? '✗' : String.fromCharCode(65 + index)}
              </div>
              <span className="text-slate-700 dark:text-slate-300">{option}</span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-xl ${
              selected === correctIndex ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
            }`}
          >
            <p className="text-sm">
              <span className="font-bold">
                {selected === correctIndex ? '🎉 Correct! ' : '💡 Not quite. '}
              </span>
              {explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
tsx
// src/components/workshops/shared/ChecklistItem.tsx
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
  text: string;
  icon: string;
  onToggle: (checked: boolean) => void;
  color: string;
}

export const ChecklistItem = ({ text, icon, onToggle, color }: Props) => {
  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    const newState = !checked;
    setChecked(newState);
    onToggle(newState);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
        checked 
          ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#4FD1C5]'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
          checked ? 'bg-green-400 text-white' : 'bg-slate-100 dark:bg-slate-700'
        }`}
        animate={checked ? { rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] } : {}}
      >
        {checked ? '✓' : icon}
      </motion.div>
      <span className={`flex-1 font-medium ${checked ? 'text-green-700 dark:text-green-400 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
        {text}
      </span>
    </motion.button>
  );
};
tsx
// src/components/workshops/shared/ReflectionBox.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  prompt: string;
  onSave: (response: string) => void;
  color: string;
}

export const ReflectionBox = ({ prompt, onSave, color }: Props) => {
  const [response, setResponse] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (response.trim()) {
      onSave(response);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-700 dark:text-slate-300 italic">{prompt}</p>
      
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#4FD1C5] outline-none resize-none h-32 text-slate-700 dark:text-slate-300 transition-colors"
      />
      
      <motion.button
        onClick={handleSave}
        className="px-6 py-3 rounded-full font-medium text-white shadow-lg"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {saved ? '💾 Saved!' : 'Save Reflection'}
      </motion.button>
    </div>
  );
};
tsx
// src/components/workshops/shared/CompletionBadge.tsx
import { motion } from 'framer-motion';

interface Props {
  title: string;
  icon: string;
  color: string;
}

export const CompletionBadge = ({ title, icon, color }: Props) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 1 }}
      className="text-center py-12"
    >
      <motion.div
        className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-6 shadow-2xl"
        style={{ backgroundColor: color }}
        animate={{ 
          boxShadow: [
            `0 0 0 0px ${color}40`,
            `0 0 0 30px ${color}00`
          ]
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {icon}
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-2 text-slate-800 dark:text-white"
      >
        Workshop Complete! 🎉
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-slate-600 dark:text-slate-400 mb-8"
      >
        Your family has completed <span className="font-bold" style={{ color }}>{title}</span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 justify-center"
      >
        <button className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors">
          Download Certificate
        </button>
        <button className="px-6 py-3 rounded-full font-medium text-white shadow-lg" style={{ backgroundColor: color }}>
          Next Workshop →
        </button>
      </motion.div>
    </motion.div>
  );
};
6️⃣ Workshop Detail Page
tsx
// src/pages/WorkshopDetail.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { workshops } from '@/data/workshops';
import { useWorkshopProgress } from '@/hooks/useWorkshopProgress';
import { QuizCard } from '@/components/workshops/shared/QuizCard';
import { ChecklistItem } from '@/components/workshops/shared/ChecklistItem';
import { ReflectionBox } from '@/components/workshops/shared/ReflectionBox';
import { CompletionBadge } from '@/components/workshops/shared/CompletionBadge';

export const WorkshopDetail = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const { completeModule, isModuleComplete } = useWorkshopProgress();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const workshop = workshops.find(w => w.id === workshopId);
  
  if (!workshop) {
    return <div>Workshop not found</div>;
  }

  const currentModule = workshop.modules[currentModuleIndex];
  const progress = ((currentModuleIndex) / workshop.modules.length) * 100;
  const isWorkshopComplete = currentModuleIndex >= workshop.modules.length;

  const handleModuleComplete = (moduleId: string) => {
    completeModule(workshop.id, moduleId);
    setCompletedModules(prev => new Set(prev).add(moduleId));
    
    setTimeout(() => {
      if (currentModuleIndex < workshop.modules.length - 1) {
        setCurrentModuleIndex(prev => prev + 1);
      } else {
        setCurrentModuleIndex(prev => prev + 1); // triggers completion
      }
    }, 1500);
  };

  const renderModuleContent = () => {
    switch (currentModule.type) {
      case 'lesson':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentModule.content}
              </p>
            </div>
            <motion.button
              onClick={() => handleModuleComplete(currentModule.id)}
              className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: workshop.color }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Got it! Continue →
            </motion.button>
          </motion.div>
        );

      case 'quiz':
        return (
          <div className="space-y-6">
            {currentModule.items?.map((item: any, idx: number) => (
              <QuizCard
                key={idx}
                {...item}
                color={workshop.color}
                onComplete={(correct) => {
                  if (idx === (currentModule.items?.length || 0) - 1) {
                    handleModuleComplete(currentModule.id);
                  }
                }}
              />
            ))}
          </div>
        );

      case 'checklist':
        const [checkedCount, setCheckedCount] = useState(0);
        const totalItems = (currentModule.items as any[])?.length || 0;
        
        return (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 mb-4">{currentModule.content}</p>
            {currentModule.items?.map((item: any, idx: number) => (
              <ChecklistItem
                key={idx}
                {...item}
                color={workshop.color}
                onToggle={(checked) => {
                  const newCount = checkedCount + (checked ? 1 : -1);
                  setCheckedCount(newCount);
                  if (newCount === totalItems) {
                    handleModuleComplete(currentModule.id);
                  }
                }}
              />
            ))}
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              {checkedCount}/{totalItems} completed
            </div>
          </div>
        );

      case 'reflection':
        return (
          <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-300">{currentModule.content}</p>
            <ReflectionBox
              prompt="Take a moment to reflect. How does this apply to your family?"
              color={workshop.color}
              onSave={() => handleModuleComplete(currentModule.id)}
            />
          </div>
        );

      case 'activity':
        return (
          <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-300">{currentModule.content}</p>
            <div className="grid gap-4">
              {currentModule.items?.map((item: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{item.description}</p>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Action:</span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">{item.action}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button
              onClick={() => handleModuleComplete(currentModule.id)}
              className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: workshop.color }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Activity Complete! →
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  if (isWorkshopComplete) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <CompletionBadge 
          title={workshop.title} 
          icon={workshop.icon} 
          color={workshop.color} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/workshop')}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ← Back to Workshops
        </motion.button>

        {/* Workshop Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: workshop.lightColor }}
            >
              {workshop.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{workshop.title}</h1>
              <p className="text-slate-500 dark:text-slate-400">{workshop.subtitle}</p>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500 dark:text-slate-400">Module {currentModuleIndex + 1} of {workshop.modules.length}</span>
            <span className="font-medium" style={{ color: workshop.color }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: workshop.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Module Navigation Dots */}
        <div className="flex gap-2 mb-8 justify-center">
          {workshop.modules.map((module, idx) => (
            <motion.div
              key={module.id}
              className={`w-3 h-3 rounded-full ${
                idx === currentModuleIndex 
                  ? 'w-8' 
                  : idx < currentModuleIndex 
                    ? 'bg-green-400' 
                    : 'bg-slate-200 dark:bg-slate-700'
              }`}
              style={idx === currentModuleIndex ? { backgroundColor: workshop.color } : {}}
              animate={{ scale: idx === currentModuleIndex ? 1.2 : 1 }}
            />
          ))}
        </div>

        {/* Module Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: workshop.lightColor }}
              >
                {currentModule.type === 'lesson' ? '📖' : 
                 currentModule.type === 'quiz' ? '❓' : 
                 currentModule.type === 'checklist' ? '✅' : 
                 currentModule.type === 'reflection' ? '🤔' : '🎯'}
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {currentModule.type}
                </span>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {currentModule.title}
                </h2>
              </div>
            </div>

            {renderModuleContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
7️⃣ Route Setup
tsx
// Add to your router/App.tsx
import { Workshops } from '@/pages/Workshops';
import { WorkshopDetail } from '@/pages/WorkshopDetail';

// In your routes:
<Route path="/workshop" element={<Workshops />} />
<Route path="/workshop/:workshopId" element={<WorkshopDetail />} />
8️⃣ Quick CSS Additions for Workshops
css
/* Add to src/index.css */

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #4FD1C5 0%, #FF9A8B 50%, #B794F4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Smooth scrollbar for workshop content */
.workshop-scroll::-webkit-scrollbar {
  width: 6px;
}
.workshop-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.workshop-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}
✅ Implementation Checklist
Table
Step	File	Action
1	src/data/workshops.ts	Create with all 3 workshop data
2	src/hooks/useWorkshopProgress.ts	Create progress tracking hook
3	src/components/workshops/WorkshopCard.tsx	Create card component
4	src/components/workshops/shared/	Create QuizCard, ChecklistItem, ReflectionBox, CompletionBadge
5	src/pages/Workshops.tsx	Replace current static page
6	src/pages/WorkshopDetail.tsx	Create dynamic workshop page
7	Router	Add /workshop/:workshopId route
8	src/index.css	Add gradient-text utility
🎨 What This Gives You
Table
Feature	Experience
Interactive Cards	Animated workshop cards with progress tracking
Step-by-Step Modules	Guided journey through lessons → quizzes → checklists → reflections → activities
Progress Persistence	LocalStorage saves progress across sessions
Completion Celebration	Animated badge with confetti-style effects
Responsive Design	Works beautifully on mobile and desktop
Dark Mode Ready	All components respect dark mode
Accessibility	Respects prefers-reduced-motion
Your workshops will feel like guided digital experiences rather than static pages—perfect for engaging families in digital wellness learning!