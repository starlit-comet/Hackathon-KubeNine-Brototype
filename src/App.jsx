import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { Login } from './components/auth';
import { ChatLayout } from './components/layout';
import './App.css';
import { ErrorBoundary } from './components/common';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? <ChatLayout /> : <Login />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
