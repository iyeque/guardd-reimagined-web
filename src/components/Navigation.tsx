import { useState } from "react";
import { Heart, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/context/useTheme";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (sectionId: string) => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + sectionId);
    } else {
      const element = document.querySelector(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <Heart className="h-8 w-8 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-black text-foreground tracking-tight">DigitalGuard</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleNavClick('#home')} className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Home</button>
            <button onClick={() => handleNavClick('#about')} className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">About</button>
            <button onClick={() => handleNavClick('#resources')} className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Resources</button>
            <button onClick={() => handleNavClick('#support')} className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Support</button>
            <button onClick={() => handleNavClick('#contact')} className="text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Contact</button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link to="/workshop">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black shadow-xl shadow-green-500/20 transition-all duration-300 rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <button 
              onClick={toggleMenu}
              className="text-foreground hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-black/95 backdrop-blur-xl border-b border-border shadow-2xl animate-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col space-y-4 p-6">
              <button onClick={() => handleNavClick('#home')} className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Home</button>
              <button onClick={() => handleNavClick('#about')} className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">About</button>
              <button onClick={() => handleNavClick('#resources')} className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Resources</button>
              <button onClick={() => handleNavClick('#support')} className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Support</button>
              <button onClick={() => handleNavClick('#contact')} className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold">Contact</button>
              <Link to="/workshop" onClick={toggleMenu} className="pt-2">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black shadow-lg rounded-xl h-12">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
