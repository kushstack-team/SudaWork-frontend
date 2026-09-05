import React from 'react';
import './App.css';
import './styles/variables.css';
import NetworkStatus from './components/NetworkStatus/NetworkStatus';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NetworkStatus />
        <AppRoutes />
        <MobileBottomNav />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
