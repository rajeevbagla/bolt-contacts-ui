import React from 'react';
import { Toaster } from 'react-hot-toast';
import { setApiBase, getApiBase } from './api';
import { TopBar } from './components/TopBar';
import { ContactsCard } from './components/ContactsCard';
import { useAuth } from './hooks/useAuth';
import { useContacts } from './hooks/useContacts';

function App() {
  const { user, isLoggingIn, login, logout } = useAuth();
  const contactsHook = useContacts(user);

  // Configure API base URL - change this to match your backend
  React.useEffect(() => {
    // Initialize API base URL from localStorage or default
    const currentApiBase = getApiBase();
    console.log('Initialized API base URL:', currentApiBase);
  }, []);

  const handleLoginSuccess = () => {
    // This will trigger the contacts to be fetched via the useEffect in ContactsCard
  };

  const handleApiSettingsChange = () => {
    // Reload data if user is logged in
    if (user) {
      contactsHook.refreshContacts();
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <TopBar 
          user={user} 
          isLoggingIn={isLoggingIn} 
          onLogin={login} 
          onLogout={logout}
          onLoginSuccess={handleLoginSuccess}
          onApiSettingsChange={handleApiSettingsChange}
        />
        <ContactsCard user={user} contactsHook={contactsHook} />
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;