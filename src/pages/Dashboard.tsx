import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard (Placeholder)</h1>
          <p className="text-gray-600 mb-4">Welcome, {user?.username || 'User'}!</p>
          <button onClick={handleLogout} className="btn-primary">
            Logout
          </button>
          <p className="mt-4 text-sm text-gray-500">
            Chat interface will be implemented in Iteration 6
          </p>
        </div>
      </div>
    </div>
  );
};