import React, { useState, useEffect, useMemo, memo, useCallback, useRef } from 'react';
import { 
  Baby, 
  Gamepad2, 
  Smartphone,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Heart,
  Clock,
  Shield,
  Users,
  Download
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import { RuleCard } from '@/components/agreements/RuleCard';
import { AgreementJourney } from '@/components/agreements/AgreementJourney';
import { FamilySignature } from '@/components/agreements/FamilySignature';
// @ts-expect-error - html2pdf doesn't have official types in some environments
import html2pdf from 'html2pdf.js';

type AgeGroup = 'toddler' | 'child' | 'teen';

interface AgreementSection {
  id: string;
  title: string;
  stepTitle: string;
  icon: string;
  category: 'screen' | 'safety' | 'comms' | 'custom';
  color: string;
  items: {
    id: string;
    label: string;
    description: string;
    whyItMatters: string;
    defaultChecked: boolean;
    ageGroups: AgeGroup[];
  }[];
}

const agreementData: AgreementSection[] = [
  {
    id: 'screen-time',
    stepTitle: 'Screen Time',
    title: 'Digital Balance',
    icon: '⏰',
    category: 'screen',
    color: '#4FD1C5',
    items: [
      { id: 'meals', label: 'Tech-Free Meals', description: 'No devices during family breakfast, lunch, or dinner.', whyItMatters: 'Fosters real conversation and connection.', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'bedtime', label: 'Wind-Down Window', description: 'All screens off at least 60 minutes before sleep.', whyItMatters: 'Blue light disrupts sleep cycles and brain rest.', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'activities', label: 'Presence First', description: 'Devices away during shared family games or outings.', whyItMatters: 'Shows respect for the people you are with.', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'homework-first', label: 'Priority Learning', description: 'Complete school tasks before entertainment screen time.', whyItMatters: 'Builds discipline and focus management.', defaultChecked: true, ageGroups: ['child', 'teen'] },
    ]
  },
  {
    id: 'safety',
    stepTitle: 'Safety',
    title: 'Online Safety',
    icon: '🛡️',
    category: 'safety',
    color: '#FF9A8B',
    items: [
      { id: 'no-personal-info', label: 'Privacy Guard', description: 'Never share address, school, or phone numbers.', whyItMatters: 'Prevents identity theft and tracking.', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'report-unsafe', label: 'Open Door Policy', description: 'Tell an adult immediately if anything feels scary.', whyItMatters: 'Parents are your safety net, not judges.', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'no-strangers', label: 'Real Friends Only', description: 'Only connect with people you know in the real world.', whyItMatters: 'Protects against online grooming.', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'permission-apps', label: 'App Approval', description: 'Ask before downloading any new software or games.', whyItMatters: 'Ensures content is age-appropriate.', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
    ]
  },
  {
    id: 'communication',
    stepTitle: 'Respect',
    title: 'Communication',
    icon: '💬',
    category: 'comms',
    color: '#B794F4',
    items: [
      { id: 'open-dialogue', label: 'Share the Joy', description: 'Talk about the cool things you find or do online.', whyItMatters: 'Makes tech a shared family interest.', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'respect-privacy', label: 'Digital Space', description: 'Respect each other\'s devices and private messages.', whyItMatters: 'Builds mutual trust and maturity.', defaultChecked: true, ageGroups: ['teen'] },
      { id: 'no-shame', label: 'Safe Mistakes', description: 'Mistakes happen; come to us without fear of punishment.', whyItMatters: 'Honesty is safer than hiding digital errors.', defaultChecked: true, ageGroups: ['child', 'teen'] },
    ]
  }
];

const FamilyDigitalAgreements: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeAge, setActiveAge] = useState<AgeGroup>('child');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [agreementDate, setAgreementDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatures, setSignatures] = useState({ parent: '', child: '' });
  const agreementRef = useRef<HTMLDivElement>(null);

  const steps = useMemo(() => [
    ...agreementData.map(s => ({ id: s.id, title: s.stepTitle, icon: s.icon, color: s.color })),
    { id: 'custom', title: 'Your Rules', icon: '✨', color: '#F6E05E' },
    { id: 'seal', title: 'Seal', icon: '📜', color: '#68D391' }
  ], []);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    agreementData.forEach(section => {
      section.items.forEach(item => {
        if (item.ageGroups.includes(activeAge)) {
          initial[item.id] = item.defaultChecked;
        }
      });
    });
    setSelectedItems(initial);
  }, [activeAge]);

  const agreementProgress = useMemo(() => {
    const totalPossible = agreementData.reduce((acc, s) => acc + s.items.filter(i => i.ageGroups.includes(activeAge)).length, 0);
    const selected = Object.values(selectedItems).filter(Boolean).length;
    return selected / (totalPossible || 1);
  }, [selectedItems, activeAge]);

  const addCustomRule = useCallback(() => {
    if (newRule.trim()) {
      setCustomRules(prev => [...prev, newRule.trim()]);
      setNewRule('');
      toast.success("Added custom rule");
    }
  }, [newRule]);

  const handleDownload = useCallback(() => {
    if (!agreementRef.current) return;
    
    const element = agreementRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${familyName || 'Family'}_Media_Agreement.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    toast.promise(html2pdf().from(element).set(opt).save(), {
      loading: 'Generating your PDF...',
      success: 'Agreement downloaded successfully! ❤️',
      error: 'Failed to generate PDF. Please try again.'
    });
  }, [familyName]);

  useEffect(() => {
    if (isPreview) {
      const timer = setTimeout(() => {
        handleDownload();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPreview, handleDownload]);

  if (isPreview) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-12 print:p-0 print:bg-white text-slate-900">
        <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 no-print sticky top-4 z-50 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
           <Button variant="ghost" onClick={() => setIsPreview(false)} className="gap-2 text-slate-600 hover:text-slate-900 font-bold">
              <ArrowLeft className="h-4 w-4" /> Back to Editor
           </Button>
           <div className="flex gap-2 w-full sm:w-auto">
             <Button onClick={handleDownload} className="flex-1 sm:flex-none gap-2 bg-teal-600 text-white hover:bg-teal-700 shadow-lg font-black rounded-xl px-8">
                <Download className="h-4 w-4" /> Save as PDF
             </Button>
           </div>
        </div>

        <div ref={agreementRef} className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none p-8 md:p-16 space-y-12 rounded-[2rem] print:rounded-none relative overflow-hidden text-slate-900">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 no-print" data-html2canvas-ignore="true" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full -ml-16 -mb-16 no-print" data-html2canvas-ignore="true" />

          <div className="text-center space-y-6 relative border-b-4 border-slate-100 pb-12">
            <div className="inline-block px-6 py-2 rounded-full bg-teal-100 text-teal-700 text-xs font-black uppercase tracking-widest mb-2">
              Official Family Charter
            </div>
            <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
              {familyName ? `${familyName}'s` : 'Family'} Media <span className="text-teal-600">Agreement</span>
            </h1>
            <p className="text-slate-500 text-xl font-bold uppercase tracking-widest">
              Established: {new Date(agreementDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {agreementData.map((section) => {
              const selectedInSection = section.items.filter(i => selectedItems[i.id]);
              if (selectedInSection.length === 0) return null;
              return (
                <div key={section.id} className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter text-left">
                    <span className="text-4xl">{section.icon}</span>
                    {section.title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedInSection.map(item => (
                      <div key={item.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left">
                        <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {customRules.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter text-left">
                  <span className="text-4xl">✨</span>
                  Special Family Rules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customRules.map((rule, i) => (
                    <div key={i} className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 text-left">
                      <p className="font-bold text-slate-900 leading-tight">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-16 mt-12 border-t-4 border-slate-100 space-y-16">
             <div className="grid grid-cols-2 gap-20">
                <div className="text-center space-y-4">
                  <div className="text-3xl font-black text-teal-600 italic tracking-tighter mb-4 h-12 flex items-end justify-center underline decoration-slate-300">
                    {signatures.child}
                  </div>
                  <div className="border-b-4 border-slate-200 w-full" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Child Signature</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-3xl font-black text-teal-600 italic tracking-tighter mb-4 h-12 flex items-end justify-center underline decoration-slate-300">
                    {signatures.parent}
                  </div>
                  <div className="border-b-4 border-slate-200 w-full" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Parent/Caregiver Signature</p>
                </div>
             </div>
             <p className="text-center text-slate-400 italic font-bold max-w-lg mx-auto leading-relaxed">
               "We agree to revisit and update this agreement as we grow and gain more responsibility."
             </p>
             <div className="text-center pt-8 text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                Verified Digital Wellness Document • DigitalGuard 2026
             </div>
          </div>
        </div>

        <style>{`
          @media print {
            .no-print, nav, footer, header { display: none !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; color: #0f172a !important; }
            .min-h-screen { background: white !important; padding: 0 !important; min-height: 0 !important; }
            .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
            .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; }
            .rounded-[2rem], .rounded-3xl, .rounded-2xl { border-radius: 0 !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-24 left-8 w-20 h-20 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl flex items-center justify-center z-40 border border-white/20 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors" />
        <svg className="w-16 h-16 transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-200 dark:text-slate-800" />
          <motion.circle 
            cx="32" cy="32" r="28" 
            stroke="#14b8a6" 
            strokeWidth="6" 
            fill="none"
            strokeLinecap="round"
            strokeDasharray="175.8"
            animate={{ strokeDashoffset: 175.8 - (agreementProgress * 175.8) }}
            transition={{ duration: 1, ease: "circOut" }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-lg font-black text-foreground leading-none">{Math.round(agreementProgress * 100)}%</span>
          <span className="text-[8px] font-black uppercase text-teal-600 dark:text-teal-400">Score</span>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-32 no-print relative z-10">
        <div className="flex flex-col gap-12 max-w-5xl mx-auto">
          <motion.header 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-4 h-4 animate-pulse" />
              2026 Interactive Builder
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter leading-tight">
              Family Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-rose-400 to-purple-500">Agreement</span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <AgeButton active={activeAge === 'toddler'} onClick={() => setActiveAge('toddler')} icon={Baby} label="Toddler" sub="Ages 0-5" />
              <AgeButton active={activeAge === 'child'} onClick={() => setActiveAge('child')} icon={Gamepad2} label="Child" sub="Ages 6-12" />
              <AgeButton active={activeAge === 'teen'} onClick={() => setActiveAge('teen')} icon={Smartphone} label="Teen" sub="Ages 13+" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/40 dark:bg-black/40 p-8 rounded-[2.5rem] border border-border backdrop-blur-md max-w-3xl mx-auto text-left">
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Family Name</label>
                <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="e.g., The Smith Family" className="bg-white/50 dark:bg-background/50 h-14 rounded-2xl border-2 focus:border-teal-500 font-bold text-foreground" />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Agreement Date</label>
                <Input type="date" value={agreementDate} onChange={(e) => setAgreementDate(e.target.value)} className="bg-white/50 dark:bg-background/50 h-14 rounded-2xl border-2 focus:border-teal-500 font-bold text-foreground" />
              </div>
            </div>
          </motion.header>

          <AgreementJourney steps={steps} currentStep={currentStep} onStepChange={setCurrentStep}>
            {currentStep < 3 ? (
              <div className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">Step {currentStep + 1}: {agreementData[currentStep].title}</h2>
                  <div className="h-1.5 w-24 bg-teal-500 mx-auto rounded-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {agreementData[currentStep].items
                    .filter(item => item.ageGroups.includes(activeAge))
                    .map(item => (
                      <RuleCard 
                        key={item.id}
                        title={item.label}
                        description={item.description}
                        whyItMatters={item.whyItMatters}
                        icon={agreementData[currentStep].icon}
                        category={agreementData[currentStep].category}
                        isAgreed={!!selectedItems[item.id]}
                        onAgree={(agreed) => setSelectedItems(prev => ({...prev, [item.id]: agreed}))}
                      />
                    ))
                  }
                </div>
                <div className="flex justify-center pt-8">
                   <Button onClick={() => setCurrentStep(prev => prev + 1)} className="h-16 px-12 bg-foreground text-background font-black text-xl rounded-2xl hover:opacity-90 group">
                     Next Step <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
              </div>
            ) : currentStep === 3 ? (
              <div className="space-y-12">
                <div className="text-center">
                  <h2 className="text-4xl font-black text-foreground mb-4 uppercase tracking-tighter">✨ Special Family Rules</h2>
                  <p className="text-muted-foreground font-medium">Add rules that are unique to your household.</p>
                </div>
                
                <Card className="bg-white/60 dark:bg-black/40 border-border p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl max-w-2xl mx-auto">
                  <div className="flex gap-4">
                    <Input placeholder="e.g., No phones while walking the dog..." value={newRule} onChange={(e) => setNewRule(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomRule()} className="h-16 rounded-2xl border-2 focus:border-yellow-500 text-lg font-bold text-foreground" />
                    <Button onClick={addCustomRule} className="h-16 px-8 bg-yellow-500 hover:bg-yellow-600 text-white font-black rounded-2xl text-lg">Add</Button>
                  </div>
                  
                  <AnimatePresence>
                    {customRules.length > 0 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-10 space-y-4">
                        {customRules.map((rule, i) => (
                          <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-4 p-5 bg-white/80 dark:bg-white/5 rounded-2xl border-2 border-yellow-200 dark:border-yellow-900/30 shadow-sm group">
                            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            <span className="font-bold text-lg text-foreground flex-1">{rule}</span>
                            <button onClick={() => setCustomRules(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 p-2 transition-all">✕</button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>

                <div className="flex justify-center">
                   <Button onClick={() => setCurrentStep(4)} className="h-16 px-12 bg-foreground text-background font-black text-xl rounded-2xl hover:opacity-90 group">
                     Continue to Seal <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
              </div>
            ) : (
              <FamilySignature 
                familyName={familyName}
                onComplete={(sigs) => setSignatures(sigs)}
                onDownload={() => setIsPreview(true)}
              />
            )}
          </AgreementJourney>
        </div>
      </div>
    </div>
  );
};

const AgeButton = ({ active, onClick, icon: Icon, label, sub }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ElementType; 
  label: string; 
  sub: string; 
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 min-w-[160px] p-6 rounded-[2rem] border-2 transition-all duration-500 text-left space-y-2 backdrop-blur-md",
      active 
        ? "bg-foreground text-background border-foreground shadow-2xl scale-105" 
        : "bg-white/40 dark:bg-black/20 border-border hover:border-primary/30 text-foreground"
    )}
  >
    <Icon className={cn("h-8 w-8 mb-2", active ? "text-background" : "text-teal-500")} />
    <div className="font-black text-lg uppercase tracking-tighter leading-none">{label}</div>
    <div className={cn("text-[10px] font-black uppercase tracking-widest opacity-60", active ? "text-background" : "text-muted-foreground")}>{sub}</div>
  </button>
);

export default memo(FamilyDigitalAgreements);
