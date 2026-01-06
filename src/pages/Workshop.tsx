import React from 'react';

const Workshop: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-32">
      <h1 className="text-4xl font-bold text-center text-white mb-8">Workshops</h1>
      <p className="text-lg text-center text-gray-200 mb-12">
        Join our interactive workshops to learn more about digital wellness and online safety.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Workshop 1 */}
        <div className="bg-black/70 border border-green-500/30 rounded-lg shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Navigating Social Media</h2>
          <p className="text-gray-300 mb-4">
            Learn how to use social media in a healthy and positive way.
          </p>
          <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">
            Learn More
          </button>
        </div>

        {/* Workshop 2 */}
        <div className="bg-black/70 border border-blue-500/30 rounded-lg shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Cybersecurity for Families</h2>
          <p className="text-gray-300 mb-4">
            Protect your family from online threats and build a secure digital home.
          </p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            Learn More
          </button>
        </div>

        {/* Workshop 3 */}
        <div className="bg-black/70 border border-purple-500/30 rounded-lg shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Managing Screen Time</h2>
          <p className="text-gray-300 mb-4">
            Develop healthy habits for screen time and find a better digital balance.
          </p>
          <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workshop;
