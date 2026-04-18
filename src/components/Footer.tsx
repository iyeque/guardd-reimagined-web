import { Link } from "react-router-dom";
import { Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-950 border-t border-border py-12 px-6 mt-20">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div className="space-y-4">
          <h3 className="text-xl font-black tracking-tighter">Digital Guardd</h3>
          <p className="text-sm text-muted-foreground font-medium">
            © 2026 Digital Guardd. All rights reserved.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Legal</h4>
          <div className="flex flex-col gap-2">
            <Link to="/terms" className="text-sm hover:text-blue-600 transition-colors">Terms of Service & User Agreement</Link>
            <Link to="/privacy" className="text-sm hover:text-blue-600 transition-colors">Privacy & Copyright Policy</Link>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Contact</h4>
          <div className="flex flex-col gap-3 items-center md:items-start">
            <a href="mailto:socialbywilma@gmail.com" className="flex items-center gap-2 text-sm hover:text-blue-600">
              <Mail className="w-4 h-4" /> socialbywilma@gmail.com
            </a>
            <a href="https://www.linkedin.com/company/digital-guardian-wellness-initiative/" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:text-blue-600">
              <Linkedin className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
