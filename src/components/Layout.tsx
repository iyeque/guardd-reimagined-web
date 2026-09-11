import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import UnifiedBackground from "./wellness/UnifiedBackground";
import WellnessParticles from "./wellness/WellnessParticles";
import GentleTrail from "./wellness/GentleTrail";
import { MoodColorShift } from "./wellness/MoodColorShift";
import OrganicTexture from "./wellness/OrganicTexture";
import { WellnessCompanion } from "./wellness/WellnessCompanion";
import { FamilyModeSwitcher } from "./wellness/FamilyModeSwitcher";
import { useWellness } from "@/context/WellnessContext";
import Footer from "./Footer";
import CookieConsentBanner from "./CookieConsentBanner";

const Layout = () => {
  const { mode, setMode } = useWellness();

  return (
    <div className="relative min-h-screen bg-transparent transition-colors duration-700">
      {/* Optimized Unified Background - Replaces BreathingGradient and PlayfulBlobs */}
      <UnifiedBackground />

      {/* Dynamic Mood Ambiance - Subtle Overlay */}
      <MoodColorShift />
      
      {/* Optimized Organic Textures */}
      <OrganicTexture />

      {/* Optimized Wellness Particles */}
      <WellnessParticles />
      
      <Navigation />
      
      {/* Personalized Experience Switcher */}
      <FamilyModeSwitcher currentMode={mode} onModeChange={setMode} />

      <main className="relative">
        <Outlet />
      </main>
      
      {/* AI Wellness Companion */}
      <WellnessCompanion />

      {/* Optimized Cursor Trail (Auto-disables on mobile) */}
      <GentleTrail />
      
      {/* Fixed See-Through Footer */}
      <Footer />
      
      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
};

export default Layout;