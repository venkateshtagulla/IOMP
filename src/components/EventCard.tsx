import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

interface Event {
  _id: string;
  name: string;
  description: string;
  category: string;
  date: string;
  location: string;
  tags: string[];
  registeredCount?: number;
  averageRating?: number;
}

interface EventCardProps {
  event: Event;
  showRegisterButton?: boolean;
}

function EventCard({ event, showRegisterButton = true }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white line-clamp-2">{event.name}</h3>
        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
          {event.category}
        </span>
      </div>
      
      <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-400 text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <MapPin className="h-4 w-4 mr-2" />
          {event.location}
        </div>
        {event.registeredCount !== undefined && (
          <div className="flex items-center text-gray-400 text-sm">
            <Users className="h-4 w-4 mr-2" />
            {event.registeredCount} registered
          </div>
        )}
        {event.averageRating && (
          <div className="flex items-center text-gray-400 text-sm">
            <Star className="h-4 w-4 mr-2 text-yellow-400" />
            {event.averageRating.toFixed(1)} / 5.0
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {event.tags.map((tag, index) => (
          <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
            {tag}
          </span>
        ))}
      </div>
      
      <Link
        to={`/events/${event._id}`}
        className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
      >
        View Details
      </Link>
    </div>
  );
}

export default EventCard;
