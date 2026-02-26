import React from 'react';

const Workshop: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-32">
      <h1 className="text-4xl md:text-6xl font-black text-center text-foreground mb-8">Workshops</h1>
      <p className="text-xl text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Join our interactive workshops to learn more about digital wellness and online safety.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Workshop 1 */}
        <div className="bg-white/60 dark:bg-black/40 border border-border rounded-2xl shadow-lg p-8 backdrop-blur-md transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-foreground mb-4">Navigating Social Media</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Learn how to use social media in a healthy and positive way.
          </p>
          <button className="bg-green-600 dark:bg-green-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors w-full">
            Learn More
          </button>
        </div>

        {/* Workshop 2 */}
        <div className="bg-white/60 dark:bg-black/40 border border-border rounded-2xl shadow-lg p-8 backdrop-blur-md transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-foreground mb-4">Cybersecurity for Families</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Protect your family from online threats and build a secure digital home.
          </p>
          <button className="bg-blue-600 dark:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors w-full">
            Learn More
          </button>
        </div>

        {/* Workshop 3 */}
        <div className="bg-white/60 dark:bg-black/40 border border-border rounded-2xl shadow-lg p-8 backdrop-blur-md transition-all hover:scale-105">
          <h2 className="text-2xl font-bold text-foreground mb-4">Managing Screen Time</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Develop healthy habits for screen time and find a better digital balance.
          </p>
          <button className="bg-purple-600 dark:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-colors w-full">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workshop;
