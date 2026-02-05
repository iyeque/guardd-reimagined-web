import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";
import Galaxy from "./Galaxy";
import { SunnySky } from "./SunnySky";
import { Suspense } from "react";
import { useTheme } from "@/context/useTheme";

const Layout = () => {
  const { theme } = useTheme();

  return (
    <div className="relative min-h-screen bg-background">
      <div className="fixed inset-0 z-0">
        {theme === 'dark' ? (
          <Suspense fallback={
            <div className="w-full h-full bg-black flex items-center justify-center">
              <div className="text-white text-lg animate-pulse">Loading Galaxy...</div>
            </div>
          }>
            <Galaxy
              className="w-full h-full"
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}
              focal={[0.5, 0.5]}
              rotation={[1, 0]}
              starSpeed={0.2}
              density={1.2} // Reduced from 1.7 for better performance
              hueShift={140}
              speed={0.3}
              mouseInteraction={true}
              glowIntensity={0.4}
              saturation={0.3}
              mouseRepulsion={true}
              twinkleIntensity={0.5}
              rotationSpeed={0.03}
              repulsionStrength={0.8}
              autoCenterRepulsion={0}
              transparent={false}
            />
          </Suspense>
        ) : (
          <SunnySky />
        )}
      </div>
      <Navigation />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;