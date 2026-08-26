import React from 'react';
import TrendingBooks from '../components/TrendingBooks';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <TrendingBooks />
        
        {/* Rest of homepage content */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Explore More</h2>
          {/* Add more sections here */}
        </section>
      </div>
    </div>
  );
}