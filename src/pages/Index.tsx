import { FC } from "react";
import PredictiveHero from "../components/PredictiveHero";
import { Services } from "@/components/Services";
import { Stats } from "@/components/Stats";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";

const Index: FC = () => {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative z-10">
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
