import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, User, Settings, LogOut, Sparkles, Home, Shield } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold text-white">EduEvents</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/events"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/events') 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Events</span>
            </Link>

            <Link
              to="/recommendations"
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                isActive('/recommendations') 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Recommendations</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/admin') 
                    ? 'bg-purple-500/20 text-purple-300' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <User className="h-5 w-5" />
              <span className="hidden md:inline">{user.name}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-gray-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;