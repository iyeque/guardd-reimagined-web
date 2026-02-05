import { useState } from "react";
import { Heart, Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/useTheme";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-sm border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <Heart className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-bold text-foreground tracking-tight">DigitalGuard</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#home" className="text-foreground hover:text-green-400 transition-colors font-medium">Home</a>
            <a href="/#about" className="text-foreground hover:text-green-400 transition-colors font-medium">About</a>
            <a href="/#resources" className="text-foreground hover:text-green-400 transition-colors font-medium">Resources</a>
            <a href="/#support" className="text-foreground hover:text-green-400 transition-colors font-medium">Support</a>
            <a href="/#contact" className="text-foreground hover:text-green-400 transition-colors font-medium">Contact</a>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Link to="/workshop">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all duration-300">
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
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col space-y-4 p-6">
              <a href="/#home" onClick={toggleMenu} className="text-lg text-foreground hover:text-green-400 transition-colors font-medium">Home</a>
              <a href="/#about" onClick={toggleMenu} className="text-lg text-foreground hover:text-green-400 transition-colors font-medium">About</a>
              <a href="/#resources" onClick={toggleMenu} className="text-lg text-foreground hover:text-green-400 transition-colors font-medium">Resources</a>
              <a href="/#support" onClick={toggleMenu} className="text-lg text-foreground hover:text-green-400 transition-colors font-medium">Support</a>
              <a href="/#contact" onClick={toggleMenu} className="text-lg text-foreground hover:text-green-400 transition-colors font-medium">Contact</a>
              <Link to="/workshop" onClick={toggleMenu} className="pt-2">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg">
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