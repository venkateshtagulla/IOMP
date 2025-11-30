import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { User, Mail, Building, GraduationCap, Tag, Save } from 'lucide-react';
import { usersApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

function Profile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    interests: '',
    skills: '',
  });

  const { data: profile, isLoading } = useQuery(
    'profile',
    usersApi.getProfile,
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        setFormData({
          name: data.name || '',
          department: data.department || '',
          year: data.year?.toString() || '',
          interests: data.interests?.join(', ') || '',
          skills: data.skills?.join(', ') || '',
        });
      }
    }
  );

  const updateMutation = useMutation(
    (data: any) => usersApi.updateProfile(data),
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        queryClient.invalidateQueries('profile');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Update failed');
      }
    }
  );

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical',
    'Business Administration',
    'Arts',
    'Science'
  ];

  if (isLoading) {
    return <LoadingSpinner size="large" />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      department: formData.department,
      year: formData.year ? parseInt(formData.year) : undefined,
      interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
    };

    updateMutation.mutate(updateData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
        <div className="p-8">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
                <p className="text-gray-400">{profile?.email}</p>
                <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs font-medium mt-1 inline-block">
                  {profile?.role}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Year
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interests (comma-separated)
                  </label>
                  <textarea
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Programming, Design, Music, Sports"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skills to Learn (comma-separated)
                  </label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-800/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, Machine Learning, Public Speaking"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{updateMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-8">
              {/* Profile Info */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-5 w-5 mr-3 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p>{profile?.email}</p>
                      </div>
                    </div>
                    
                    {profile?.department && (
                      <div className="flex items-center text-gray-300">
                        <Building className="h-5 w-5 mr-3 text-green-400" />
                        <div>
                          <p className="text-sm text-gray-400">Department</p>
                          <p>{profile.department}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.year && (
                      <div className="flex items-center text-gray-300">
                        <GraduationCap className="h-5 w-5 mr-3 text-purple-400" />
                        <div>
                          <p className="text-sm text-gray-400">Year</p>
                          <p>{profile.year}th Year</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="space-y-6">
                    {profile?.interests && profile.interests.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2 flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          Interests
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.interests.map((interest: string, index: number) => (
                            <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md text-xs">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {profile?.skills && profile.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-2 flex items-center">
                          <Tag className="h-4 w-4 mr-2" />
                          Skills to Learn
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill: string, index: number) => (
                            <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;