import { lazy, Suspense } from "react";
import type { FC } from "react";
import PredictiveHero from "../components/PredictiveHero";
import { Services } from "@/components/Services";
import { Stats } from "@/components/Stats";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Navigation } from "@/components/Navigation";

const Galaxy = lazy(() => import("../components/Galaxy"));

const Index: FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="fixed inset-0 z-0">
        <Suspense fallback={
          <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="text-white text-lg animate-pulse">Loading Galaxy...</div>
          </div>
        }>
          <Galaxy
            className="w-full h-full"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            focal={[0.5, 0.5]}
            rotation={[1, 0]}
            starSpeed={0.5}
            density={1.2}
            hueShift={140}
            speed={1.2}
            mouseInteraction={false}
            glowIntensity={0.25}
            saturation={0.3}
            mouseRepulsion={false}
            twinkleIntensity={0.5}
            rotationSpeed={0.15}
            repulsionStrength={0.8}
            autoCenterRepulsion={0}
            transparent={true}
          />
        </Suspense>
      </div>
      <div className="relative z-10">
        <Navigation />
        <section className="hero relative min-h-screen overflow-hidden bg-transparent">
          <PredictiveHero />
        </section>
        <Stats />
        <Services />
        <About />
        <Contact />
      </div>
    </div>
  );
};

export default Index;
