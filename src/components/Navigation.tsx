
import { Heart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-slate-800">DigitalGuard</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-slate-600 hover:text-green-600 transition-colors font-medium">Home</a>
            <a href="#about" className="text-slate-600 hover:text-green-600 transition-colors font-medium">About</a>
            <a href="#resources" className="text-slate-600 hover:text-green-600 transition-colors font-medium">Resources</a>
            <a href="#support" className="text-slate-600 hover:text-green-600 transition-colors font-medium">Support</a>
            <a href="#contact" className="text-slate-600 hover:text-green-600 transition-colors font-medium">Contact</a>
          </div>
          
          <Link to="/workshop">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
