import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import UnifiedBackground from "./wellness/UnifiedBackground";
import WellnessParticles from "./wellness/WellnessParticles";
import GentleTrail from "./wellness/GentleTrail";
import { MoodColorShift } from "./wellness/MoodColorShift";
import OrganicTexture from "./wellness/OrganicTexture";
import { WellnessCompanion } from "./wellness/WellnessCompanion";
import { FamilyModeSwitcher } from "./wellness/FamilyModeSwitcher";
import { useProfile } from "@/context/ProfileContext";
import { type FamilyMode } from "@/lib/profiles";
import Footer from "./Footer";
import CookieConsentBanner from "./CookieConsentBanner";

const Layout = ({ children }: { children?: ReactNode }) => {
  const { currentProfile, updateCurrentProfile } = useProfile();
  const mode = currentProfile?.mode ?? ("family" as FamilyMode);

  const handleModeChange = (newMode: FamilyMode) => {
    if (!currentProfile) return;
    updateCurrentProfile({ mode: newMode });
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-transparent transition-colors duration-700">
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
      <FamilyModeSwitcher currentMode={mode} onModeChange={handleModeChange} />

      <main className="relative flex-1">
        {children ?? <Outlet />}
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
