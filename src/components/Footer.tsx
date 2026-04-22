import { useState } from "react";
import { Linkedin, Mail } from "lucide-react";
import { LegalModal } from "./LegalModal";

export const Footer = () => {
  const [modalType, setModalType] = useState<'terms' | 'privacy' | null>(null);

  return (
    <>
      <footer className="w-full bg-slate-50 dark:bg-slate-950 border-t border-border py-12 px-6 mt-20">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tighter">DigitalGuard</h3>
            <p className="text-sm text-muted-foreground font-medium">
              © 2026 DigitalGuard. All rights reserved.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Legal</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setModalType('terms')}
                className="text-sm hover:text-blue-600 transition-colors text-left"
              >
                Terms of Service & User Agreement
              </button>
              <button 
                onClick={() => setModalType('privacy')}
                className="text-sm hover:text-blue-600 transition-colors text-left"
              >
                Privacy & Copyright Policy
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Contact</h4>
            <div className="flex flex-col gap-3 items-center md:items-start">
              <a href="https://www.linkedin.com/company/digital-guardian-wellness-initiative/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-blue-600">
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType || 'terms'} 
      />
    </>
  );
};
