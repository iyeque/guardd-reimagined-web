
import PredictiveHero from "../components/PredictiveHero";
import { Services } from "@/components/Services";
import { Stats } from "@/components/Stats";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Navigation } from "@/components/Navigation";
import { EducationalGames } from "@/components/EducationalGames";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation />
      <PredictiveHero />
      <Stats />
      <Services />
      <EducationalGames />
      <About />
      <Contact />
    </div>
  );
};

export default Index;
