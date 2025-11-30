import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Sparkles, TrendingUp, Users } from 'lucide-react';
import { useQuery } from 'react-query';
import { eventsApi, usersApi } from '../services/api';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const { user } = useAuth();

  const { data: recentEvents, isLoading: eventsLoading } = useQuery(
    'recentEvents',
    () => eventsApi.getAll({ limit: 4, sort: '-date' }),
    {
      select: (response) => response.data
    }
  );

  const { data: recommendations, isLoading: recLoading } =
   useQuery(
    'recommendations',
    usersApi.getRecommendations,
    {
      select: (response) => response.data,
      enabled: user?.role === 'student'
    }
  );
  /*const { data: recommendations, isLoading: recLoading } = useQuery(
  'recommendations',
  usersApi.getRecommendations,
  {
    select: (response) => response.data,
    enabled: user?.role === 'student',
    staleTime: 5 * 60 * 1000, // cache data for 5 minutes
    cacheTime: 10 * 60 * 1000, // keep unused data in memory for 10 minutes
    refetchOnMount: false,     // don’t refetch every mount
    refetchOnWindowFocus: false // don’t refetch on tab/window focus
  }
);*/


  if (eventsLoading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-400">
          Discover events tailored to your interests and expand your horizons.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{recentEvents?.events?.length || 0}</p>
              <p className="text-blue-300">Available Events</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-md border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">{recommendations?.length || 0}</p>
              <p className="text-purple-300">AI Recommendations</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-md border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-green-300">Events Attended</p>
            </div>
          </div>
        </div>
      </div>
      {/* AI Recommendations */}

      
      {user?.role === 'student' && recommendations && recommendations.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-400" />
              AI Recommended for You
            </h2>
            <Link
              to="/recommendations"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((event: any) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Events</h2>
          <Link
            to="/events"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All Events
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentEvents?.events?.map((event: any) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/events"
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-all duration-300 group"
          >
            <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">Browse Events</p>
          </Link>
          
          <Link
            to="/recommendations"
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-all duration-300 group"
          >
            <Sparkles className="h-6 w-6 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">Get Recommendations</p>
          </Link>
          
          <Link
            to="/profile"
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-all duration-300 group"
          >
            <Users className="h-6 w-6 mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
            <p className="text-white text-sm">Update Profile</p>
          </Link>
          
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg p-4 text-center transition-all duration-300 group"
            >
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-red-400 group-hover:scale-110 transition-transform" />
              <p className="text-white text-sm">Admin Panel</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;