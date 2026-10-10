import './App.css';
import './styles/variables.css';
import NetworkStatus from './components/NetworkStatus/NetworkStatus';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlatformProvider>
          <NetworkStatus />
          <AppRoutes />
          <MobileBottomNav />
        </PlatformProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
