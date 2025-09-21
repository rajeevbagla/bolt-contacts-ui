import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { API_BASE } from '../api';

export const ApiStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        console.log('Checking API status at:', `${API_BASE}/health`);
        const response = await fetch(`${API_BASE}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log('API status check successful');
          setApiStatus('online');
        } else {
          console.log('API status check failed with status:', response.status);
          setApiStatus('offline');
        }
      } catch (error) {
        console.error('API status check error:', error);
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (apiStatus === 'checking') {
    return (
      <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-md text-sm">
        <Wifi className="w-4 h-4 animate-pulse" />
        <span>Checking API connection...</span>
      </div>
    );
  }

  if (apiStatus === 'offline') {
    return (
      <div className="flex items-center space-x-2 text-red-600 bg-red-50 px-3 py-2 rounded-md text-sm">
        <WifiOff className="w-4 h-4" />
        <span>API server offline ({API_BASE})</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-md text-sm">
      <CheckCircle className="w-4 h-4" />
      <span>API connected</span>
    </div>
  );
};