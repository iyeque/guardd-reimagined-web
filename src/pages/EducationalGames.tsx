import React from 'react';
import DigitalWellnessGame from '@/components/DigitalWellnessGame';

const EducationalGames: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold text-center text-slate-800 mb-8">Educational Games & Activities</h1>
      <DigitalWellnessGame />
    </div>
  );
};

export default EducationalGames;