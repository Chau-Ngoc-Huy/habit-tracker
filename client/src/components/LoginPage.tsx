import React, { useState } from 'react';
import { User } from '../types';
import { useAuth, AuthContextType } from '../contexts/AuthContext';

interface LoginPageProps {
  users: Record<string, User>;
  onLogin: (username: string) => void;
}

// Separate wrapper component to handle auth context gracefully
const LoginPageWithAuth: React.FC<LoginPageProps> = (props) => {
  // Always call useAuth unconditionally at the top level
  const auth = useAuth();
  
  return <LoginPageContent {...props} auth={auth} />;
};

// Inner component that doesn't call hooks conditionally
interface LoginPageContentProps extends LoginPageProps {
  auth: AuthContextType;
}

const LoginPageContent: React.FC<LoginPageContentProps> = ({ users, onLogin, auth }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to migrate existing users to Supabase
  const tryRegisterExistingUser = async () => {
    try {
      // First try to register the user with Supabase
      await auth.signUp(email || `${username}@example.com`, password, username);
      return true;
    } catch (error) {
      console.error('Error auto-registering user:', error);
      return false;
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      try {
        // Try to sign in with Supabase
        await auth.signIn(email || `${username}@example.com`, password);
        onLogin(username);
      } catch (loginError) {
        // If login fails and we have a valid email, try to register the user
        if (email && users[username]) {
          const registered = await tryRegisterExistingUser();
          if (registered) {
            // If registration was successful, try login again
            await auth.signIn(email, password);
            onLogin(username);
          } else {
            throw loginError;
          }
        } else {
          // Fallback to the demo mode
          if (users[username]) {
            onLogin(username);
          } else {
            setError('Tên đăng nhập không tồn tại!');
          }
        }
      }
    } catch (error) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !email) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await auth.signUp(email, password, username);
      // Switch back to login view after successful registration
      setIsRegistering(false);
      setError(null);
    } catch (error) {
      setError('Đăng ký thất bại. Vui lòng thử lại!');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleView = () => {
    setIsRegistering(!isRegistering);
    setError(null);
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
            {isRegistering ? 'Đăng ký tài khoản mới' : 'Đăng nhập để tiếp tục'}
          </div>
        </div>
        
        <div className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Nhập địa chỉ email"
              />
            </div>
          )}
          
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
          
          {!isRegistering && (
            <div>
              <label className="block text-gray-700 mb-2" htmlFor="loginEmail">Email (nếu đã đăng ký)</label>
              <input 
                id="loginEmail" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="Nhập email (tùy chọn)"
              />
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <button 
            onClick={isRegistering ? handleRegister : handleLogin}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            {loading 
              ? 'Đang xử lý...' 
              : isRegistering 
                ? 'Đăng ký' 
                : 'Đăng nhập'
            }
          </button>
        </div>
        
        <div className="mt-6 flex justify-between text-sm">
          <button className="text-indigo-600 hover:underline">
            {isRegistering ? '' : 'Quên mật khẩu?'}
          </button>
          <button 
            onClick={toggleView} 
            className="text-indigo-600 hover:underline"
          >
            {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Đăng ký tài khoản mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

// For backward compatibility with App.tsx which expects LoginPage
const LoginPage: React.FC<LoginPageProps> = (props) => {
  try {
    return <LoginPageWithAuth {...props} />;
  } catch (e) {
    // If AuthContext is not available, use local data
    console.warn('Auth context not available, using local data only');
    const dummyAuth: AuthContextType = {
      user: null,
      session: null,
      loading: false,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
      getCurrentUser: async () => {},
    };
    return <LoginPageContent {...props} auth={dummyAuth} />;
  }
};

export default LoginPage; 