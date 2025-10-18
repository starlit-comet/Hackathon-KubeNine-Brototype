import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
      <AppContent />
    </AuthProvider>
     </ErrorBoundary>
  );
}

export default App;
