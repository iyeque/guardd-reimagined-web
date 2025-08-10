import React from 'react';

export const EducationalGames = () => {
  return (
    <section id="educational-games" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Educational Games & Activities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Placeholder for game/activity cards */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Game Title 1</h3>
            <p className="text-gray-600">Short description of the educational game or activity. Focus on digital wellness concepts.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Play Now</button>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Activity Title 1</h3>
            <p className="text-gray-600">Short description of the educational game or activity. Focus on digital wellness concepts.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Learn More</button>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-gray-700">Game Title 2</h3>
            <p className="text-gray-600">Short description of the educational game or activity. Focus on digital wellness concepts.</p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Play Now</button>
          </div>
        </div>
      </div>
    </section>
  );
};