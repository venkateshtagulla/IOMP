import React from 'react';
import { useQuery } from 'react-query';
import { Sparkles, Brain, TrendingUp } from 'lucide-react';
import { usersApi } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

function Recommendations() {
  const { data: recommendations, isLoading } =/*useQuery(
  'recommendations',
  usersApi.getRecommendations,
  {
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // keep in memory for 10 minutes
    refetchOnMount: false, // don’t refetch every time component mounts
    refetchOnWindowFocus: false // don’t refetch when switching tabs
  }
);*/

  useQuery(
    'recommendations',
    usersApi.getRecommendations,
    {
      select: (response) => response.data
    }
  );

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Sparkles className="h-8 w-8 text-purple-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">AI Recommendations</h1>
        </div>
        <p className="text-gray-400">
          Personalized event suggestions based on your interests and behavior.
        </p>
      </div>

      {/* How it Works */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-400" />
          How Our AI Works
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-500/20 rounded-lg p-4 mb-3">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto" />
            </div>
            <h3 className="font-medium text-white mb-2">Content-Based Filtering</h3>
            <p className="text-sm text-gray-400">
              Analyzes event descriptions and matches them to your interests and skills.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-500/20 rounded-lg p-4 mb-3">
              <Sparkles className="h-8 w-8 text-purple-400 mx-auto" />
            </div>
            <h3 className="font-medium text-white mb-2">Collaborative Filtering</h3>
            <p className="text-sm text-gray-400">
              Finds patterns from similar students' event attendance history.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-500/20 rounded-lg p-4 mb-3">
              <Brain className="h-8 w-8 text-green-400 mx-auto" />
            </div>
            <h3 className="font-medium text-white mb-2">Hybrid Approach</h3>
            <p className="text-sm text-gray-400">
              Combines both methods for the most accurate recommendations.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((event: any, index: number) => (
            <div key={event._id} className="relative">
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No recommendations yet</h3>
          <p className="text-gray-400 mb-4">
            Attend a few events and update your profile to get personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
}

export default Recommendations;