import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  users: Record<string, User>;
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('HG');
  const [password, setPassword] = useState('password');

  const handleLogin = () => {
    if (username && password) {
      if (users[username]) {
        onLogin(username);
      } else {
        alert('Tên đăng nhập không tồn tại!');
      }
    } else {
      alert('Vui lòng nhập tên đăng nhập và mật khẩu!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-bg p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Habit Tracker</h1>
          <p className="text-gray-500 mt-2">Theo dõi thói quen hàng ngày của bạn</p>
        </div>
        
        <div className="mb-6 text-center">
          <div className="bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg inline-block mb-4">
            Demo - Không yêu cầu đăng ký thực
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="username">Tên đăng nhập</label>
            <input 
              id="username" 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="password">Mật khẩu</label>
            <input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            Đăng nhập
          </button>
        </div>
        
        <div className="mt-6 flex justify-between text-sm">
          <button className="text-indigo-600 hover:underline">Quên mật khẩu?</button>
          <button className="text-indigo-600 hover:underline">Đăng ký</button>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <div className="flex space-x-4 justify-center">
            <button 
              onClick={() => setUsername('HG')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>HG</span>
            </button>
            <button 
              onClick={() => setUsername('HC')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <span>HC</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 