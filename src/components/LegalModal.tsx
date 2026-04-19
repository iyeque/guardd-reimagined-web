import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  const content = {
    terms: {
      title: "Terms of Service & User Agreement",
      date: "April 18, 2026",
      sections: [
        {
          h: "1. Agreement to Terms",
          p: "By accessing the Digital Guardd platform (\"the Service\"), you agree to these Terms of Service. If you disagree with any part of these terms, you may not access the Service."
        },
        {
          h: "2. Use of the Service",
          p: "Digital Guardd is an educational platform focused on digital wellness. You agree to use the platform in accordance with applicable laws and respect the safety and privacy of others within our community."
        },
        {
          h: "3. User Conduct",
          p: "When applying for our mentor programs or contacting our team, you agree to provide accurate and truthful information. We reserve the right to refuse service or terminate access for any user found providing fraudulent data."
        },
        {
          h: "4. Limitation of Liability",
          p: "The content on this platform is for educational and informational purposes only. We are not liable for any actions taken by users based on the resources provided. Digital wellness practices should be implemented at the user's discretion."
        }
      ]
    },
    privacy: {
      title: "Privacy & Copyright Policy",
      date: "April 18, 2026",
      sections: [
        {
          h: "1. Data Privacy",
          p: "We collect only the information necessary to fulfill your requests (Contact/Mentorship). We do not sell, trade, or share your personal data with third-party advertisers or data brokers."
        },
        {
          h: "2. Data Security",
          p: "We implement industry-standard security measures to protect information transmitted through our platform. All data is stored in a secure, encrypted database."
        },
        {
          h: "3. Copyright & Intellectual Property",
          p: "All content, designs, and materials on Digital Guardd are the intellectual property of the Digital Guardian Wellness Initiative. Unauthorized reproduction is strictly prohibited."
        },
        {
          h: "4. Analytics",
          p: "We use Vercel Web Analytics to collect anonymized performance data to improve user experience. We do not track individual user behavior for marketing."
        }
      ]
    }
  };

  const active = content[type];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground tracking-tight uppercase italic mb-2">{active.title}</h2>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Last Updated: {active.date}</p>
          </div>

          <div className="space-y-8">
            {active.sections.map((s, i) => (
              <div key={i} className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">{s.h}</h3>
                <p className="text-muted-foreground leading-relaxed font-medium">{s.p}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 pt-8 border-t border-border">
            <Button onClick={onClose} className="w-full h-14 rounded-xl font-black uppercase tracking-widest">
              Close Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
