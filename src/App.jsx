import './App.css';
import './styles/variables.css';
import NetworkStatus from './components/NetworkStatus/NetworkStatus';
import MobileBottomNav from './components/MobileBottomNav/MobileBottomNav';
import PushManager from './components/PushManager/PushManager';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import FileViewer from './components/FileViewer/FileViewer';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { PlatformProvider } from './context/PlatformContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlatformProvider>
          <ScrollToTop />
          <NetworkStatus />
          <AppRoutes />
          <MobileBottomNav />
          <PushManager />
          <FileViewer />
        </PlatformProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
