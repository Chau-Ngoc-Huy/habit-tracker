import React from 'react';
import { User } from '../types';

interface HeaderProps {
  user: User;
  users: Record<string, User>;
  onLogout: () => void;
  onUserSelect: (userId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, users, onLogout, onUserSelect }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Habit Tracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={user.id}
              onChange={(e) => onUserSelect(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.entries(users).map(([id, userData]) => (
                <option key={id} value={id}>
                  {userData.name}
                </option>
              ))}
            </select>
            <button 
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 