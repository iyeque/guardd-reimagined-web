import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Printer, 
  Shield, 
  Clock, 
  Heart, 
  Users, 
  ChevronRight, 
  Baby, 
  Gamepad2, 
  Smartphone,
  Info,
  Edit3,
  ArrowLeft,
  Download,
  FileDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AgeGroup = 'toddler' | 'child' | 'teen';

interface AgreementSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  bgColor: string;
  items: {
    id: string;
    label: string;
    defaultChecked: boolean;
    ageGroups: AgeGroup[];
  }[];
}

const agreementData: AgreementSection[] = [
  {
    id: 'screen-time',
    title: 'Screen Time & Balance',
    icon: Clock,
    color: 'text-blue-600',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50/50',
    items: [
      { id: 'meals', label: 'During meals', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'bedtime', label: 'One hour before bed', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'activities', label: 'During family activities', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'co-viewing', label: 'We will watch or play together', defaultChecked: true, ageGroups: ['toddler'] },
      { id: 'homework-first', label: 'Finish homework before using entertainment screens', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'device-free-zones', label: 'Keep bedrooms as tech-free zones', defaultChecked: false, ageGroups: ['child', 'teen'] },
    ]
  },
  {
    id: 'safety',
    title: 'Safety & Privacy Rules',
    icon: Shield,
    color: 'text-green-600',
    borderColor: 'border-green-200',
    bgColor: 'bg-green-50/50',
    items: [
      { id: 'no-personal-info', label: 'Never share full name, school, address, or phone number', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'parent-passwords', label: 'Share all passwords with parents/caregivers', defaultChecked: true, ageGroups: ['toddler', 'child'] },
      { id: 'no-strangers', label: 'Never talk to or accept requests from people I don’t know in real life', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'report-unsafe', label: 'Tell an adult if I see anything upsetting or unsafe', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'permission-apps', label: 'Ask permission before downloading new apps or games', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'reputation', label: 'Think before I post: how will this affect my future or others?', defaultChecked: true, ageGroups: ['teen'] },
    ]
  },
  {
    id: 'communication',
    title: 'Communication & Responsibility',
    icon: Users,
    color: 'text-purple-600',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50/50',
    items: [
      { id: 'open-dialogue', label: 'Talk regularly about what we’re doing online', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'breaks', label: 'Take breaks from screens when asked or needed', defaultChecked: true, ageGroups: ['toddler', 'child', 'teen'] },
      { id: 'no-shame', label: 'I can come to a trusted adult with mistakes without fear of punishment', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'parent-check', label: 'Parents may check accounts but will let me know when and why', defaultChecked: true, ageGroups: ['child', 'teen'] },
      { id: 'respect-privacy', label: 'We will respect each other’s digital space and privacy', defaultChecked: true, ageGroups: ['teen'] },
    ]
  }
];

const FamilyDigitalAgreements: React.FC = () => {
  const [activeAge, setActiveAge] = useState<AgeGroup>('child');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [weekdays, setWeekdays] = useState('1');
  const [weekends, setWeekends] = useState('2');
  const [customRules, setCustomRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  // Initialize selected items based on age group
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

  const toggleItem = (id: string) => {
    setSelectedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addCustomRule = () => {
    if (newRule.trim()) {
      setCustomRules([...customRules, newRule.trim()]);
      setNewRule('');
      toast.success("Added custom rule");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    toast.info("Opening print dialog. Please select 'Save as PDF' as your printer destination.");
    setIsPreview(true);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-12 print:p-0 print:bg-white">
        {/* Navigation / Toolbar - HIDDEN DURING PRINT */}
        <div className="max-w-4xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 no-print sticky top-4 z-50 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl">
           <Button variant="ghost" onClick={() => setIsPreview(false)} className="gap-2 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Back to Editor
           </Button>
           <div className="flex gap-2 w-full sm:w-auto">
             <Button onClick={handlePrint} className="flex-1 sm:flex-none gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                <Printer className="h-4 w-4" /> Print Document
             </Button>
             <Button variant="outline" onClick={handlePrint} className="flex-1 sm:flex-none gap-2 border-slate-300 text-slate-700">
                <FileDown className="h-4 w-4" /> Save as PDF
             </Button>
           </div>
        </div>

        {/* The Document */}
        <div className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none p-8 md:p-16 space-y-12 rounded-[2rem] print:rounded-none relative overflow-hidden">
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 no-print" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full -ml-16 -mb-16 no-print" />

          <div className="text-center space-y-6 relative">
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold uppercase tracking-wider mb-2">
              Official Family Charter
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Family Media <span className="text-blue-600">Agreement</span>
            </h1>
            <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto leading-relaxed italic">
              "A collaborative commitment to safe, respectful, and balanced technology use in our home."
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* Screen Time Section */}
            <div className="border-2 border-blue-100 bg-blue-50/30 rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                Screen Time Expectations
              </h2>
              <div className="grid grid-cols-2 gap-8 text-lg">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
                  <p className="text-sm text-blue-600 font-bold uppercase mb-1">Weekdays</p>
                  <p className="text-3xl font-black text-slate-900">{weekdays} <span className="text-sm font-normal text-slate-500">hours/day</span></p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100">
                  <p className="text-sm text-blue-600 font-bold uppercase mb-1">Weekends</p>
                  <p className="text-3xl font-black text-slate-900">{weekends} <span className="text-sm font-normal text-slate-500">hours/day</span></p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-blue-900">We agree to tech-free times:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {agreementData[0].items
                    .filter(item => selectedItems[item.id])
                    .map(item => (
                      <div key={item.id} className="flex items-center gap-3 text-slate-700">
                        <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* Safety Section */}
            <div className="border-2 border-green-100 bg-green-50/30 rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-green-800 flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                Safety & Privacy Rules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agreementData[1].items
                  .filter(item => selectedItems[item.id])
                  .map(item => (
                    <div key={item.id} className="flex items-start gap-3 text-slate-700 leading-tight">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{item.label}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Communication Section */}
            <div className="border-2 border-purple-100 bg-purple-50/30 rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-bold text-purple-800 flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-xl">
                  <Users className="h-6 w-6 text-white" />
                </div>
                Communication & Responsibility
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agreementData[2].items
                  .filter(item => selectedItems[item.id])
                  .map(item => (
                    <div key={item.id} className="flex items-start gap-3 text-slate-700 leading-tight">
                      <Check className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>{item.label}</span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Custom Rules */}
            {customRules.length > 0 && (
              <div className="border-2 border-slate-200 bg-slate-50/50 rounded-3xl p-8 space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-slate-700 rounded-xl">
                    <Edit3 className="h-6 w-6 text-white" />
                  </div>
                  Special Family Rules
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customRules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-slate-500 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Signature Block */}
          <div className="pt-16 space-y-12">
             <p className="text-center text-slate-500 italic font-medium">
               "We agree to revisit and update this agreement as we grow and gain more responsibility."
             </p>
             <div className="grid grid-cols-2 gap-20">
                <div className="text-center space-y-4">
                  <div className="border-b-2 border-slate-300 h-12 w-full" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Child Signature</p>
                </div>
                <div className="text-center space-y-4">
                  <div className="border-b-2 border-slate-300 h-12 w-full" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parent/Caregiver Signature</p>
                </div>
             </div>
             <div className="text-center pt-8 text-[10px] text-slate-300 uppercase tracking-tighter">
                Generated via DigitalGuard Wellness Platform • Based on American SPCC Framework
             </div>
          </div>
        </div>

        {/* CSS for print to hide everything else */}
        <style>{`
          @media print {
            .no-print, nav, footer, header { display: none !important; }
            body { background: white !important; margin: 0 !important; padding: 0 !important; }
            .min-h-screen { background: white !important; padding: 0 !important; min-height: 0 !important; }
            .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
            .shadow-2xl, .shadow-xl, .shadow-sm { box-shadow: none !important; }
            .rounded-[2rem], .rounded-3xl, .rounded-2xl { border-radius: 0 !important; }
            .bg-slate-100 { background: white !important; }
            .border-blue-100, .border-green-100, .border-purple-100 { border-color: #eee !important; }
            .bg-blue-50/30, .bg-green-50/30, .bg-purple-50/30 { background: transparent !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-32 no-print">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content Area */}
          <div className="lg:w-2/3 space-y-12">
            <header className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                Family Media Agreement
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                A collaborative commitment to safe, respectful, and balanced technology use in our home.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <AgeButton 
                  active={activeAge === 'toddler'} 
                  onClick={() => setActiveAge('toddler')}
                  icon={Baby}
                  label="Toddler"
                  sub="Ages 0-5"
                />
                <AgeButton 
                  active={activeAge === 'child'} 
                  onClick={() => setActiveAge('child')}
                  icon={Gamepad2}
                  label="Child"
                  sub="Ages 6-12"
                />
                <AgeButton 
                  active={activeAge === 'teen'} 
                  onClick={() => setActiveAge('teen')}
                  icon={Smartphone}
                  label="Teen"
                  sub="Ages 13+"
                />
              </div>
            </header>

            <section className="space-y-8">
              {/* Expectations */}
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Clock className="h-6 w-6 text-blue-400" />
                    Screen Time Expectations
                  </CardTitle>
                  <CardDescription>We understand that screen time should be balanced with sleep, school, and play.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Weekdays (hours/day)</label>
                      <Input 
                        type="number" 
                        value={weekdays} 
                        onChange={(e) => setWeekdays(e.target.value)}
                        className="bg-background/50 text-lg py-6"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Weekends (hours/day)</label>
                      <Input 
                        type="number" 
                        value={weekends} 
                        onChange={(e) => setWeekends(e.target.value)}
                        className="bg-background/50 text-lg py-6"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-400" />
                      We agree to tech-free times:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {agreementData[0].items
                        .filter(item => item.ageGroups.includes(activeAge))
                        .map(item => (
                          <AgreementCheckbox 
                            key={item.id}
                            checked={!!selectedItems[item.id]}
                            label={item.label}
                            onToggle={() => toggleItem(item.id)}
                          />
                        ))
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Section */}
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-400" />
                    Safety & Privacy Rules
                  </CardTitle>
                  <CardDescription>We agree to stay safe and smart online by following these rules.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {agreementData[1].items
                      .filter(item => item.ageGroups.includes(activeAge))
                      .map(item => (
                        <AgreementCheckbox 
                          key={item.id}
                          checked={!!selectedItems[item.id]}
                          label={item.label}
                          onToggle={() => toggleItem(item.id)}
                        />
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Communication Section */}
              <Card className="border-none bg-card/50 backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-400" />
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-6 w-6 text-purple-400" />
                    Communication & Responsibility
                  </CardTitle>
                  <CardDescription>We agree to keep communication open and respectful.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {agreementData[2].items
                      .filter(item => item.ageGroups.includes(activeAge))
                      .map(item => (
                        <AgreementCheckbox 
                          key={item.id}
                          checked={!!selectedItems[item.id]}
                          label={item.label}
                          onToggle={() => toggleItem(item.id)}
                        />
                      ))
                    }
                  </div>
                </CardContent>
              </Card>

              {/* Custom Rules */}
              <div className="pt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Edit3 className="h-5 w-5 text-orange-400" />
                  Add Your Own Rules
                </h3>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g., No phones while walking the dog"
                    value={newRule}
                    onChange={(e) => setNewRule(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomRule()}
                    className="bg-card/50"
                  />
                  <Button onClick={addCustomRule} className="bg-orange-500 hover:bg-orange-600">
                    Add
                  </Button>
                </div>
                {customRules.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {customRules.map((rule, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-white/60 dark:bg-card/30 rounded-2xl border border-border shadow-sm font-bold">
                        <Check className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar / Actions */}
          <div className="lg:w-1/3">
            <div className="sticky top-32 space-y-6">
              <Card className="bg-white/60 dark:bg-black/40 border-border shadow-2xl backdrop-blur-md rounded-3xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardHeader>
                  <CardTitle className="text-foreground font-black">Ready to Commit?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    Review your agreement in preview mode, then print to sign or save as a PDF.
                  </p>
                  <div className="space-y-3">
                    <Button onClick={() => setIsPreview(true)} className="w-full h-14 text-lg gap-2 bg-foreground text-background hover:opacity-90 font-black rounded-xl">
                      <Printer className="h-5 w-5" />
                      Print Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadPDF}
                      className="w-full border-border text-foreground hover:bg-muted h-12 font-bold rounded-xl"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download as PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="p-8 bg-white/40 dark:bg-card/40 border border-border rounded-3xl space-y-4 shadow-lg backdrop-blur-sm">
                <h4 className="font-black flex items-center gap-3 text-foreground italic">
                  <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400 animate-pulse" />
                  Why this matters
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                  Collaborative agreements lead to higher compliance and less conflict compared to imposed rules.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AgeButton = ({ active, onClick, icon: Icon, label, sub }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 min-w-[140px] p-4 rounded-2xl border-2 transition-all duration-300 text-left space-y-1",
      active 
        ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" 
        : "bg-card/50 border-white/5 hover:border-white/20"
    )}
  >
    <Icon className={cn("h-6 w-6 mb-2", active ? "text-primary" : "text-muted-foreground")} />
    <div className="font-bold text-foreground">{label}</div>
    <div className="text-xs text-muted-foreground">{sub}</div>
  </button>
);

const AgreementCheckbox = ({ checked, label, onToggle }: any) => (
  <div 
    onClick={onToggle}
    className={cn(
      "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
      checked 
        ? "bg-primary/5 border-primary/30" 
        : "bg-transparent border-white/5 hover:bg-white/5"
    )}
  >
    <div className={cn(
      "mt-1 h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors",
      checked ? "bg-primary border-primary" : "border-muted-foreground/30"
    )}>
      {checked && <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />}
    </div>
    <span className={cn("text-sm leading-tight", checked ? "text-foreground font-medium" : "text-muted-foreground")}>
      {label}
    </span>
  </div>
);

export default FamilyDigitalAgreements;
