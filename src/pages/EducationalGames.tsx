import React, { useState } from 'react';
import DigitalWellnessGame from '@/components/DigitalWellnessGame';
import CyberSafeQuiz from '@/components/CyberSafeQuiz';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gamepad2, ShieldCheck, ArrowLeft } from 'lucide-react';

const EducationalGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Educational Games
        </h1>
        <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
          Learn about digital wellness and online safety through fun, interactive challenges!
        </p>
        
        {activeGame && (
          <Button 
            variant="ghost" 
            onClick={() => setActiveGame(null)}
            className="text-gray-300 hover:text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Games List
          </Button>
        )}
      </div>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Game Card 1 */}
          <Card 
            className="bg-black/60 border-green-500/30 hover:border-green-500/60 hover:bg-black/70 transition-all cursor-pointer group"
            onClick={() => setActiveGame('wellness-bubble')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-green-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="h-12 w-12 text-green-400" />
              </div>
              <CardTitle className="text-2xl text-white">Digital Wellness Pop</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">
                Balance your digital life! Pop the green "Wellness" bubbles to reduce stress, but avoid the red "Distraction" bubbles.
              </p>
              <Button className="bg-green-600 hover:bg-green-700 text-white w-full rounded-full">
                Play Now
              </Button>
            </CardContent>
          </Card>

          {/* Game Card 2 */}
          <Card 
            className="bg-black/60 border-blue-500/30 hover:border-blue-500/60 hover:bg-black/70 transition-all cursor-pointer group"
            onClick={() => setActiveGame('cyber-quiz')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto bg-blue-500/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-12 w-12 text-blue-400" />
              </div>
              <CardTitle className="text-2xl text-white">Cyber Defense Quiz</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-6">
                Test your knowledge on passwords, privacy, and online stranger danger. Can you get a perfect score?
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-full">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeGame === 'wellness-bubble' && <DigitalWellnessGame />}
          {activeGame === 'cyber-quiz' && <CyberSafeQuiz />}
        </div>
      )}
    </div>
  );
};

export default EducationalGames;