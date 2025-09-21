import React, { useState } from 'react';
import { User as UserIcon, LogIn, LogOut, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { User } from '../types/Contact';
import { ApiStatus } from './ApiStatus';
import { ApiSettingsModal } from './ApiSettingsModal';

interface TopBarProps {
  user: User | null;
  isLoggingIn: boolean;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onLogout: () => void;
  onLoginSuccess?: () => void;
  onApiSettingsChange?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  user, 
  isLoggingIn, 
  onLogin, 
  onLogout, 
  onLoginSuccess,
  onApiSettingsChange 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await onLogin(username, password);
    if (success) {
      setUsername('');
      setPassword('');
      onLoginSuccess?.();
    }
  };

  const handleApiSettingsSave = () => {
    onApiSettingsChange?.();
  };

  return (
    <>
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Contacts Manager</h1>
          </div>

          <div className="flex items-center space-x-4">
            <ApiStatus />
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              title="API Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <UserIcon className="w-4 h-4" />
                  <span>Welcome, {user.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-1" />
                      Login
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    
    <ApiSettingsModal
      isOpen={isSettingsOpen}
      onClose={() => setIsSettingsOpen(false)}
      onSave={handleApiSettingsSave}
    />
    </>
  );
};