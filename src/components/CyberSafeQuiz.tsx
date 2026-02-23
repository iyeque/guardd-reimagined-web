import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, Trophy, Lock, Zap, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: { text: string; correct: boolean }[];
  explanation: string;
}

interface Level {
  name: string;
  minScore: number;
  questions: Question[];
}

const LEVELS: Level[] = [
  {
    name: "Level 1: The Basics",
    minScore: 3,
    questions: [
      {
        id: 1,
        question: "You receive a message from a stranger asking for your school name. What should you do?",
        options: [
          { text: "Tell them, it's public info anyway.", correct: false },
          { text: "Ignore it and tell a parent/guardian.", correct: true },
          { text: "Ask them why they want to know.", correct: false },
          { text: "Make up a fake school name.", correct: false }
        ],
        explanation: "Never share personal information like your school, address, or phone number with strangers online."
      },
      {
        id: 2,
        question: "Which of these is the strongest password?",
        options: [
          { text: "password123", correct: false },
          { text: "MyNameIsAlex", correct: false },
          { text: "Tr0ub4dor&3", correct: true },
          { text: "12345678", correct: false }
        ],
        explanation: "Strong passwords use a mix of letters, numbers, and symbols, and don't contain easily guessable info."
      },
      {
        id: 3,
        question: "A friend posts a mean photo of a classmate. What is the best action?",
        options: [
          { text: "Like and share it.", correct: false },
          { text: "Comment that it's funny.", correct: false },
          { text: "Ask them to take it down and don't share it.", correct: true },
          { text: "Save it to show others later.", correct: false }
        ],
        explanation: "Sharing or encouraging bullying makes you part of the problem. Standing up for others helps stop it."
      },
      {
        id: 4,
        question: "You see a pop-up saying you won a free iPhone. You should:",
        options: [
          { text: "Click it immediately!", correct: false },
          { text: "Enter your email to claim it.", correct: false },
          { text: "Close the window/tab immediately.", correct: true },
          { text: "Forward it to a friend.", correct: false }
        ],
        explanation: "If it sounds too good to be true, it's likely a scam. Don't click suspicious links."
      }
    ]
  },
  {
    name: "Level 2: Privacy Expert",
    minScore: 3,
    questions: [
      {
        id: 5,
        question: "What is 2FA (Two-Factor Authentication)?",
        options: [
          { text: "Two different passwords.", correct: false },
          { text: "A password plus a code sent to your phone.", correct: true },
          { text: "Logging in on two devices at once.", correct: false },
          { text: "Sharing your account with a friend.", correct: false }
        ],
        explanation: "2FA adds an extra layer of security by requiring a second form of identification."
      },
      {
        id: 6,
        question: "Is it safe to use public WiFi for banking or shopping?",
        options: [
          { text: "Yes, if the signal is strong.", correct: false },
          { text: "Yes, public WiFi is always encrypted.", correct: false },
          { text: "No, hackers can easily steal your info.", correct: true },
          { text: "Only on tablets, not phones.", correct: false }
        ],
        explanation: "Public WiFi is often unsecured. Use a VPN or wait until you're on a trusted network."
      },
      {
        id: 7,
        question: "What should you do before downloading a new app?",
        options: [
          { text: "Check its ratings only.", correct: false },
          { text: "Download it and see if it works.", correct: false },
          { text: "Review its privacy permissions.", correct: true },
          { text: "Make sure it has a cool icon.", correct: false }
        ],
        explanation: "Many apps collect more data than they need. Always check what data they access."
      },
      {
        id: 8,
        question: "What is a 'Digital Footprint'?",
        options: [
          { text: "The size of your computer screen.", correct: false },
          { text: "A list of all the apps you own.", correct: false },
          { text: "The trail of data you leave online.", correct: true },
          { text: "The amount of electricity your PC uses.", correct: false }
        ],
        explanation: "Everything you do online—posts, likes, searches—contributes to your permanent digital history."
      }
    ]
  },
  {
    name: "Level 3: Cyber Guardian",
    minScore: 3,
    questions: [
      {
        id: 9,
        question: "What is a 'Phishing' attack?",
        options: [
          { text: "A game about catching fish.", correct: false },
          { text: "A fake email designed to steal passwords.", correct: true },
          { text: "When your internet connection is slow.", correct: false },
          { text: "Updating your social media status.", correct: false }
        ],
        explanation: "Phishing emails look like they're from trusted companies but lead to fake login pages."
      },
      {
        id: 10,
        question: "You get a friend request from someone with no profile picture and 0 friends. You should:",
        options: [
          { text: "Accept it to be nice.", correct: false },
          { text: "Decline and block the account.", correct: true },
          { text: "Message them to ask who they are.", correct: false },
          { text: "Add them to a group chat.", correct: false }
        ],
        explanation: "Fake or bot accounts are often used to spread spam or harvest personal information."
      },
      {
        id: 11,
        question: "Which of the following is true about 'Terms of Service'?",
        options: [
          { text: "They are all the same, so no need to read.", correct: false },
          { text: "They explain how a company uses your data.", correct: true },
          { text: "They are only for adults to read.", correct: false },
          { text: "They protect the user more than the company.", correct: false }
        ],
        explanation: "ToS agreements define your rights and how your personal data is handled by the service."
      },
      {
        id: 12,
        question: "If you realize you've been hacked, what's the FIRST step?",
        options: [
          { text: "Delete the app.", correct: false },
          { text: "Wait and see what happens.", correct: false },
          { text: "Change your password immediately.", correct: true },
          { text: "Tell all your friends.", correct: false }
        ],
        explanation: "Securing your account with a new, strong password is the most urgent priority when compromised."
      }
    ]
  }
];

const CyberSafeQuiz: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'level-complete' | 'game-over' | 'victory'>('intro');

  const level = LEVELS[currentLevel];
  const question = level.questions[currentQuestion];

  const handleAnswer = (index: number, isCorrect: boolean) => {
    setSelectedOption(index);
    setIsAnswered(true);
    if (isCorrect) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < level.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Level complete check
      if (score >= level.minScore) {
        setGameState('level-complete');
      } else {
        setGameState('game-over');
      }
    }
  };

  const startNextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      setCurrentLevel(currentLevel + 1);
      setCurrentQuestion(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setGameState('playing');
    } else {
      setGameState('victory');
    }
  };

  const restart = () => {
    setCurrentLevel(0);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setGameState('intro');
  };

  if (gameState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <div className="bg-blue-500/20 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border-2 border-blue-500/30 animate-bounce">
          <ShieldCheck className="w-12 h-12 text-blue-400" />
        </div>
        <h2 className="text-5xl font-black text-white tracking-tight">MISSION: <span className="text-blue-500">SAFEGUARD</span></h2>
        <p className="text-gray-400 text-lg">Complete all 3 levels of cyber intelligence to earn your Guardian Badge.</p>
        <Button onClick={() => setGameState('playing')} className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-12 py-8 rounded-full font-bold shadow-xl shadow-blue-900/20">
          BEGIN MISSION
        </Button>
      </div>
    );
  }

  if (gameState === 'level-complete') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12 animate-in zoom-in duration-300">
        <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
        <h2 className="text-4xl font-black text-white">{level.name} PASSED!</h2>
        <p className="text-gray-400 text-xl">Score: {score}/{level.questions.length}</p>
        <Button onClick={startNextLevel} className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full font-bold flex items-center gap-2 mx-auto">
          NEXT LEVEL <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  if (gameState === 'game-over') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12 animate-in shake-1 duration-300">
        <Lock className="w-24 h-24 text-red-500 mx-auto" />
        <h2 className="text-4xl font-black text-white uppercase">Access Denied</h2>
        <p className="text-gray-400">You need at least {level.minScore} correct answers to pass this level.</p>
        <Button onClick={restart} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold">
          RETRY MISSION
        </Button>
      </div>
    );
  }

  if (gameState === 'victory') {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12 animate-in zoom-in-95 duration-500">
        <div className="relative">
          <ShieldCheck className="w-32 h-32 text-green-400 mx-auto" />
          <Zap className="w-12 h-12 text-yellow-400 absolute top-0 right-1/2 -mr-20 animate-pulse" />
        </div>
        <h2 className="text-5xl font-black text-white">CYBER GUARDIAN</h2>
        <p className="text-gray-400 text-xl italic">"The internet is safer because of you."</p>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
          <p className="text-green-400 font-bold uppercase tracking-widest text-sm mb-2">Achievement Unlocked</p>
          <p className="text-white text-lg">Elite Digital Safety Status</p>
        </div>
        <Button onClick={restart} variant="outline" className="border-white/20 text-white px-12 py-6 rounded-full">
          PLAY AGAIN
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{level.name}</p>
          <div className="flex gap-1">
            {level.questions.map((_, i) => (
              <div key={i} className={cn("h-1.5 w-8 rounded-full", i <= currentQuestion ? "bg-blue-500" : "bg-gray-800")} />
            ))}
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-500 text-xs font-bold uppercase">Current Score</p>
          <p className="text-2xl font-black text-white">{score}</p>
        </div>
      </div>

      <Card className="bg-gray-900/50 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl md:text-3xl text-white leading-tight font-bold">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="grid gap-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !isAnswered && handleAnswer(index, option.correct)}
                disabled={isAnswered}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 font-medium text-lg flex justify-between items-center group",
                  isAnswered 
                    ? option.correct 
                      ? "bg-green-500/20 border-green-500 text-green-100" 
                      : selectedOption === index 
                        ? "bg-red-500/20 border-red-500 text-red-100"
                        : "bg-gray-800/20 border-transparent text-gray-600 opacity-50"
                    : "bg-white/5 border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-300"
                )}
              >
                <span>{option.text}</span>
                {isAnswered && option.correct && <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />}
                {isAnswered && selectedOption === index && !option.correct && <XCircle className="w-6 h-6 text-red-400 shrink-0" />}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex gap-4">
                <div className="bg-blue-500/20 p-2 rounded-xl h-fit">
                  <AlertTriangle className="w-5 h-5 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-white uppercase text-sm tracking-widest">Did you know?</h4>
                  <p className="text-gray-300 leading-relaxed">{question.explanation}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 font-bold text-lg h-auto shadow-lg shadow-blue-900/40">
                  {currentQuestion < level.questions.length - 1 ? "NEXT TASK" : "LEVEL REPORT"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CyberSafeQuiz;
