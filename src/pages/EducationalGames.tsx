import React, { useState, useMemo } from 'react';
import DigitalWellnessGame from '@/components/DigitalWellnessGame';
import CyberSafeQuiz from '@/components/CyberSafeQuiz';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  ShieldCheck, 
  ArrowLeft, 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  ExternalLink,
  Sparkles,
  MousePointer2,
  Lock,
  MessageSquare,
  Shield,
  Smartphone,
  CheckCircle2,
  XCircle,
  Eye,
  Settings
} from 'lucide-react';
import { cn } from "@/lib/utils";

type GameCategory = 'all' | 'kids' | 'teens' | 'parents';

interface Game {
  id: string;
  title: string;
  description: string;
  category: GameCategory[];
  icon: React.ElementType;
  color: string;
  accentColor: string;
  isExternal?: boolean;
  url?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Game' | 'Quiz' | 'Simulation';
}

const GAMES: Game[] = [
  {
    id: 'wellness-bubble',
    title: 'Digital Wellness Pop',
    description: 'A fast-paced reflex game! Pop green "FOCUS" bubbles to reduce stress while avoiding red "ALERTS" traps.',
    category: ['kids', 'teens'],
    icon: Target,
    color: 'from-green-500 to-emerald-600',
    accentColor: 'text-green-400',
    difficulty: 'Easy',
    type: 'Game'
  },
  {
    id: 'cyber-quiz',
    title: 'Cyber Defense Mission',
    description: 'A multi-level strategic mission to test your cyber intelligence. Earn your "Digital Guardian" badge through 3 elite levels.',
    category: ['kids', 'teens'],
    icon: ShieldCheck,
    color: 'from-blue-500 to-indigo-600',
    accentColor: 'text-blue-400',
    difficulty: 'Medium',
    type: 'Quiz'
  },
  {
    id: 'privacy-pro',
    title: 'Privacy Architect',
    description: 'Configure the safety protocols of a new social app. Make the right choices to protect your users from data leaks.',
    category: ['teens', 'parents'],
    icon: Settings,
    color: 'from-purple-500 to-violet-600',
    accentColor: 'text-purple-400',
    difficulty: 'Hard',
    type: 'Simulation'
  },
  {
    id: 'social-sim',
    title: 'Social Navigator',
    description: 'Practice responding to tricky online social situations. Learn how to diffuse conflict and stay respectful.',
    category: ['teens'],
    icon: MessageSquare,
    color: 'from-pink-500 to-rose-600',
    accentColor: 'text-pink-400',
    difficulty: 'Medium',
    type: 'Simulation'
  },
  {
    id: 'interland',
    title: 'Google Interland',
    description: 'An amazing 3D world by Google that teaches kids to be confident explorers of the online world.',
    category: ['kids'],
    icon: Sparkles,
    color: 'from-orange-500 to-yellow-600',
    accentColor: 'text-orange-400',
    isExternal: true,
    url: 'https://beinternetawesome.withgoogle.com/en_us/interland',
    difficulty: 'Medium',
    type: 'Game'
  },
  {
    id: 'digital-passport',
    title: 'Digital Passport',
    description: 'Common Sense Media\'s suite of games helping kids ages 7-11 build essential digital citizenship skills.',
    category: ['kids'],
    icon: Shield,
    color: 'from-cyan-500 to-blue-600',
    accentColor: 'text-cyan-400',
    isExternal: true,
    url: 'https://www.commonsense.org/education/digital-passport',
    difficulty: 'Easy',
    type: 'Game'
  },
  {
    id: 'parent-challenge',
    title: 'The Tech-Savvy Parent',
    description: 'Think you know your TikTok from your Twitch? A fast-paced trend quiz for the modern parent.',
    category: ['parents'],
    icon: Smartphone,
    color: 'from-slate-600 to-slate-800',
    accentColor: 'text-slate-300',
    difficulty: 'Medium',
    type: 'Quiz'
  }
];

// --- Mini Simulation Components ---

const PrivacyArchitect = () => {
  const [step, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const levels = [
    {
      task: "User Profile Visibility",
      options: [
        { text: "Public to everyone", impact: -10, feedback: "Exposes kids to strangers." },
        { text: "Friends only by default", impact: 10, feedback: "Safer for younger users." }
      ]
    },
    {
      task: "Data Sharing with Ads",
      options: [
        { text: "Allow all tracking", impact: -10, feedback: "Violates user privacy." },
        { text: "Restrict third-party data", impact: 10, feedback: "Respects data sovereignty." }
      ]
    },
    {
      task: "Location Services",
      options: [
        { text: "Precise GPS always on", impact: -10, feedback: "Huge safety risk!" },
        { text: "Approximate location only", impact: 10, feedback: "Good balance of utility/privacy." }
      ]
    },
    {
      task: "Password Requirements",
      options: [
        { text: "Simple 4-digit PIN", impact: -5, feedback: "Too easy to crack." },
        { text: "8+ characters with symbols", impact: 10, feedback: "Ensures account security." }
      ]
    },
    {
      task: "Direct Messaging",
      options: [
        { text: "Open to anyone", impact: -15, feedback: "Invites unwanted contact." },
        { text: "Verified contacts only", impact: 10, feedback: "Protects against strangers." }
      ]
    }
  ];

  const handleChoice = (impact: number) => {
    setScore(s => s + impact);
    if (step < levels.length - 1) setLevel(step + 1);
    else setIsDone(true);
  };

  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-8">
      <h2 className="text-3xl font-black text-purple-400 uppercase tracking-tighter">Privacy Architect</h2>
      {isDone ? (
        <div className="space-y-6">
          <Badge className="bg-purple-500 text-white px-4 py-2">Mission Complete</Badge>
          <p className="text-4xl font-bold">Safety Score: {score}</p>
          <p className="text-gray-400">Your architecture decisions have {score > 30 ? "perfectly secured" : score > 0 ? "moderately protected" : "compromised"} the app's integrity.</p>
          <Button onClick={() => { setLevel(0); setScore(0); setIsDone(false); }} className="bg-purple-600">Re-Architect</Button>
        </div>
      ) : (
        <Card className="bg-gray-900 border-purple-500/30 p-8">
          <p className="text-gray-500 text-xs font-bold uppercase mb-4">Task {step + 1} of {levels.length}</p>
          <h3 className="text-2xl font-bold text-white mb-8">{levels[step].task}</h3>
          <div className="grid gap-4">
            {levels[step].options.map((opt, i) => (
              <Button key={i} variant="outline" onClick={() => handleChoice(opt.impact)} className="border-white/10 hover:border-purple-500 h-16 text-lg whitespace-normal px-4">
                {opt.text}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const SocialNavigator = () => {
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [totalSuccess, setTotalSuccess] = useState(0);

  const scenarios = [
    {
      text: "A friend posts something mean about another friend. They ask you to 'like' it. What do you do?",
      options: [
        { text: "Like it to stay in the group.", result: "Bad move. You encouraged bullying.", ok: false },
        { text: "Ignore it and talk to them privately.", result: "Great choice! You didn't escalate and showed maturity.", ok: true }
      ]
    },
    {
      text: "A stranger in a game offers you 'free credits' if you click a link and login. What is your response?",
      options: [
        { text: "Click it—I need the credits!", result: "Phishing attack! Your account was stolen.", ok: false },
        { text: "Report the player and ignore the link.", result: "Perfect! You recognized a scam and protected your data.", ok: true }
      ]
    },
    {
      text: "Your sibling leaves their phone unlocked. You see an embarrassing text. What do you do?",
      options: [
        { text: "Take a photo and send it to your friends.", result: "Privacy violation. This destroys trust and could lead to trouble.", ok: false },
        { text: "Lock the phone and respect their privacy.", result: "Honorable! You treated their digital space with respect.", ok: true }
      ]
    },
    {
      text: "You want to post a photo of your friends, but one of them looks bad in it. They didn't see it yet.",
      options: [
        { text: "Post it anyway, I look great!", result: "Disrespectful. Always ask for consent before posting others.", ok: false },
        { text: "Ask them if they're okay with you posting it.", result: "Consent is key! Your friends appreciate the respect.", ok: true }
      ]
    }
  ];

  const handleChoice = (opt: any) => {
    setOutcome(opt.result);
    if (opt.ok) setTotalSuccess(s => s + 1);
  };

  const nextScenario = () => {
    setOutcome(null);
    setStep(s => s + 1);
  };

  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-8">
      <h2 className="text-3xl font-black text-pink-400 uppercase tracking-tighter">Social Navigator</h2>
      {step >= scenarios.length ? (
        <div className="space-y-6">
          <Badge className="bg-pink-500 text-white px-4 py-2">Simulation Over</Badge>
          <p className="text-4xl font-bold">{totalSuccess}/{scenarios.length} Safe Choices</p>
          <Button onClick={() => { setStep(0); setTotalSuccess(0); }} className="bg-pink-600">Restart Simulation</Button>
        </div>
      ) : outcome ? (
        <div className="space-y-6 animate-in zoom-in duration-300">
          <div className={cn("p-8 rounded-3xl border-2", outcome.includes("Great") || outcome.includes("Perfect") || outcome.includes("Honorable") || outcome.includes("Consent") ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
            <p className="text-xl font-bold">{outcome}</p>
          </div>
          <Button onClick={nextScenario} className="bg-white text-black font-bold px-8 py-4 rounded-xl">
            Next Scenario
          </Button>
        </div>
      ) : (
        <Card className="bg-gray-900 border-pink-500/30 p-8">
          <p className="text-gray-500 text-xs font-bold uppercase mb-4">Scenario {step + 1} of {scenarios.length}</p>
          <h3 className="text-xl text-white leading-relaxed">{scenarios[step].text}</h3>
          <div className="grid gap-4 mt-8">
            {scenarios[step].options.map((opt, i) => (
              <Button key={i} variant="outline" onClick={() => handleChoice(opt)} className="border-white/10 hover:border-pink-500 h-auto whitespace-normal text-left px-6 py-4">
                {opt.text}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

const TechSavvyQuiz = () => {
  const [q, setQ] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const questions = [
    { q: "What does 'Ghost Mode' on Snapchat do?", a: ["Hides your location", "Deletes your account", "Mutes notifications"], correct: 0 },
    { q: "Which app is most known for 'BeReal' notifications?", a: ["Instagram", "TikTok", "BeReal"], correct: 2 },
    { q: "What is a 'Finsta'?", a: ["A fish filter", "A fake Instagram account", "A premium subscription"], correct: 1 },
    { q: "What is 'Doomscrolling'?", a: ["Scrolling through bad news for a long time", "A new game on Steam", "Using a phone in the dark"], correct: 0 },
    { q: "What is the 'TikTok Algorithm' primarily designed to do?", a: ["Find the most educational content", "Keep you on the app as long as possible", "Help you connect with family"], correct: 1 },
    { q: "What does 'DM' stand for?", a: ["Digital Message", "Direct Message", "Daily Monitor"], correct: 1 },
    { q: "What is a 'Deepfake'?", a: ["A very long blog post", "AI-generated realistic fake video/audio", "A professional gamer"], correct: 1 },
    { q: "What is 'Twitch' mostly used for?", a: ["Live streaming games/hobbies", "Editing professional photos", "Shopping for tech gear"], correct: 0 }
  ];

  const handleAnswer = (i: number) => {
    if (i === questions[q].correct) setScore(s => s + 1);
    if (q < questions.length - 1) setQ(q + 1);
    else setDone(true);
  };

  return (
    <div className="max-w-xl mx-auto py-12 text-center space-y-8 text-white">
      <h2 className="text-3xl font-black text-slate-400 uppercase tracking-tighter">Tech-Savvy Parent Quiz</h2>
      {done ? (
        <div className="space-y-6">
          <p className="text-4xl font-black">{score}/{questions.length} Correct</p>
          <p className="text-gray-400">{score >= 6 ? "You're a trend-setting genius!" : "Keep up! The digital world moves fast."}</p>
          <Button onClick={() => { setQ(0); setScore(0); setDone(false); }} className="bg-slate-700">Retake Quiz</Button>
        </div>
      ) : (
        <Card className="bg-gray-900 border-white/10 p-8">
          <p className="text-gray-500 text-xs font-bold uppercase mb-4">Question {q + 1} of {questions.length}</p>
          <h3 className="text-xl font-bold mb-8">{questions[q].q}</h3>
          <div className="grid gap-3">
            {questions[q].a.map((opt, i) => (
              <Button key={i} variant="outline" onClick={() => handleAnswer(i)} className="border-white/10 hover:bg-white/5 h-14 whitespace-normal py-2 px-4">
                {opt}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// --- Main Page ---

const EducationalGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [filter, setFilter] = useState<GameCategory>('all');

  const filteredGames = useMemo(() => {
    if (filter === 'all') return GAMES;
    return GAMES.filter(game => game.category.includes(filter));
  }, [filter]);

  if (activeGame) {
    const game = GAMES.find(g => g.id === activeGame);
    const GameIcon = game?.icon || Gamepad2;
    return (
      <div className="container mx-auto px-6 py-32 animate-in fade-in duration-500">
        <Button 
          variant="ghost" 
          onClick={() => setActiveGame(null)}
          className="mb-8 text-gray-400 hover:text-white hover:bg-white/5 gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Game Library
        </Button>
        
        <div className="bg-black/40 border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl min-h-[500px] flex items-center justify-center">
          {activeGame === 'wellness-bubble' && <DigitalWellnessGame />}
          {activeGame === 'cyber-quiz' && <CyberSafeQuiz />}
          {activeGame === 'privacy-pro' && <PrivacyArchitect />}
          {activeGame === 'social-sim' && <SocialNavigator />}
          {activeGame === 'parent-challenge' && <TechSavvyQuiz />}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-32">
      <div className="text-center mb-16 space-y-6">
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-1.5 text-sm uppercase tracking-widest font-bold">
          Play to Learn
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
          Arcade <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Academy</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Level up your digital wellness skills through fun challenges, interactive simulations, and expert-designed games.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {(['all', 'kids', 'teens', 'parents'] as GameCategory[]).map((cat) => (
          <Button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "rounded-full px-8 py-6 text-lg font-bold transition-all duration-300 border-2 uppercase tracking-wide",
              filter === cat 
                ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" 
                : "bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white"
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGames.map((game) => {
          const GameIcon = game.icon;
          return (
            <Card 
              key={game.id}
              className="group relative bg-black/40 border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5 flex flex-col h-full"
              onClick={() => {
                if (game.isExternal) {
                  window.open(game.url, '_blank');
                } else {
                  setActiveGame(game.id);
                }
              }}
            >
              <div className={cn("absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br", game.color)} />
              
              <CardHeader className="relative space-y-4">
                <div className="flex justify-between items-start">
                  <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform duration-500", game.accentColor)}>
                    <GameIcon className="h-8 w-8" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-gray-500">
                      {game.type}
                    </Badge>
                    <Badge className="bg-black/60 text-[10px] text-gray-400 border-white/5">
                      {game.difficulty}
                    </Badge>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl text-white font-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r transition-all duration-300 group-hover:from-white group-hover:to-gray-400">
                    {game.title}
                  </CardTitle>
                  <div className="flex gap-1 mt-2">
                    {game.category.map(c => (
                      <span key={c} className="text-[10px] text-gray-500 uppercase tracking-tighter">#{c} </span>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative flex-grow">
                <p className="text-gray-400 leading-relaxed line-clamp-3">
                  {game.description}
                </p>
              </CardContent>
              
              <CardFooter className="relative pt-4">
                <div className="w-full flex items-center justify-between text-sm font-bold">
                  <span className={cn("flex items-center gap-2 uppercase tracking-widest", game.accentColor)}>
                    {game.isExternal ? 'Explore' : 'Launch'} 
                    {game.isExternal ? <ExternalLink className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MousePointer2 className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-32 p-12 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-[3rem] border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="relative flex flex-col md:flex-row items-center gap-12">
          <div className="bg-yellow-500/20 p-8 rounded-full border-4 border-yellow-500/20 animate-pulse">
            <Trophy className="h-20 w-20 text-yellow-500" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">The Guardian Trophy</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Complete all missions in the Arcade Academy to unlock the ultimate Digital Guardian Achievement. 
              Over 1,200 families have already leveled up!
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">1.2k Players</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-300">450 Champions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalGames;
