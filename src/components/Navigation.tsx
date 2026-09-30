import { useState } from "react";
import { Menu, X, Sun, Moon, GraduationCap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "@/context/useTheme";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import { resumeOnboardingTour, resetOnboardingSeen, restartOnboardingTour } from "@/lib/onboarding";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      const id = href.substring(1);
      if (location.pathname !== '/') {
        navigate('/#' + id);
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      navigate(href);
    }
  };

  const navItems = [
    { label: "About", href: "#about" },
    { label: "Resources", href: "#resources" },
    { label: "Support", href: "#support" },
    { label: "Blog", href: "/educational-blog" },
    { label: "Commitments", href: "/family-commitments" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 dark:bg-black/10 backdrop-blur-md border-b border-border transition-all duration-300">
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <button onClick={() => handleNavClick('#home')} className="flex items-center space-x-2 group">
            <img src="/dg-logo.png" alt="DigitalGuard" className="h-8 w-8 rounded-md object-contain group-hover:scale-110 transition-transform duration-300" />
            <span className="text-2xl font-black text-foreground tracking-tight uppercase">DigitalGuard</span>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.filter(item => item.label !== "Blog").map((item) => (
              <button 
                key={item.label}
                onClick={() => handleNavClick(item.href)} 
                className="text-xs font-black text-muted-foreground hover:text-foreground transition-all uppercase tracking-widest"
              >
                {item.label}
              </button>
            ))}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground hover:bg-muted rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                restartOnboardingTour(navigate)
              }}
              className={`text-foreground hover:bg-muted rounded-full transition-colors ${
                location.pathname !== "/" ? "hidden" : ""
              }`}
              aria-label="Replay onboarding tour"
              title="Replay tour"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-2">
              <ProfileSwitcher />
              <Link to="/workshop">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black shadow-xl shadow-green-500/20 transition-all duration-300 rounded-xl">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ProfileSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                restartOnboardingTour(navigate)
              }}
              className={`text-foreground hover:text-white hover:bg-white/10 rounded-full transition-colors ${
                location.pathname !== "/" ? "hidden" : ""
              }`}
              aria-label="Replay onboarding tour"
              title="Replay tour"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
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
              <button 
                onClick={() => handleNavClick('#home')} 
                className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold uppercase tracking-wider"
              >
                Home
              </button>
              {navItems.filter(item => item.label !== "Blog").map((item) => (
                <button 
                  key={item.label}
                  onClick={() => handleNavClick(item.href)} 
                  className="text-left text-lg text-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold uppercase tracking-wider"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-2">
                <ProfileSwitcher />
              </div>
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
