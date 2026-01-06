import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

const questions = [
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
    explanation: "Strong passwords use a mix of letters, numbers, and symbols, and don't contain easily guessable personal info."
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
    explanation: "If it sounds too good to be true, it's likely a scam or virus. Don't click suspicious links."
  },
  {
    id: 5,
    question: "How long should you keep your social media profile public?",
    options: [
      { text: "Always, so I can get famous.", correct: false },
      { text: "Only on weekends.", correct: false },
      { text: "It's safer to keep it private for friends only.", correct: true },
      { text: "Until I turn 18.", correct: false }
    ],
    explanation: "Keeping profiles private gives you control over who sees your photos and posts, keeping you safer."
  }
];

const CyberSafeQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (index: number, isCorrect: boolean) => {
    setSelectedOption(index);
    setIsAnswered(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  if (showResult) {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-black/70 border border-blue-500/30 backdrop-blur-sm text-white p-8">
        <CardContent className="flex flex-col items-center text-center space-y-6">
          <ShieldCheck className="w-24 h-24 text-green-400 mb-4" />
          <h2 className="text-3xl font-bold">Quiz Completed!</h2>
          <p className="text-xl text-gray-200">
            You scored <span className="text-blue-400 font-bold">{score}</span> out of <span className="text-blue-400 font-bold">{questions.length}</span>
          </p>
          <p className="text-gray-300 max-w-md">
            {score === questions.length 
              ? "Amazing! You are a Cyber Safety Expert." 
              : score >= questions.length / 2 
                ? "Good job! You know the basics, but stay alert." 
                : "Keep learning! Review the safety tips to protect yourself better."}
          </p>
          <Button onClick={restartQuiz} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/70 border border-blue-500/30 backdrop-blur-sm text-white">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 text-sm">Question {currentQuestion + 1} of {questions.length}</span>
          <span className="text-blue-400 font-bold">Score: {score}</span>
        </div>
        <CardTitle className="text-2xl text-white">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isAnswered && handleAnswer(index, option.correct)}
              disabled={isAnswered}
              className={`
                w-full text-left p-4 rounded-lg border transition-all duration-200 flex justify-between items-center
                ${isAnswered 
                  ? option.correct 
                    ? "bg-green-500/20 border-green-500 text-green-100" 
                    : selectedOption === index 
                      ? "bg-red-500/20 border-red-500 text-red-100"
                      : "bg-gray-800/50 border-gray-700 text-gray-400 opacity-50"
                  : "bg-gray-800/50 border-gray-700 hover:bg-blue-900/30 hover:border-blue-500/50 text-gray-200"}
              `}
            >
              <span>{option.text}</span>
              {isAnswered && option.correct && <CheckCircle className="w-5 h-5 text-green-400" />}
              {isAnswered && selectedOption === index && !option.correct && <XCircle className="w-5 h-5 text-red-400" />}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
              <div>
                <h4 className="font-bold text-blue-300 mb-1">Did you know?</h4>
                <p className="text-gray-300 text-sm">{question.explanation}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={nextQuestion} className="bg-blue-500 hover:bg-blue-600 text-white">
                {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CyberSafeQuiz;
