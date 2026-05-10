import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { trackPageView } from './lib/analytics';
import AppRoutes from './AppRoutes';

function AnalyticsRouteTracker() {
  const location = useLocation();
  const isFirstNavigation = useRef(true);

  useEffect(() => {
    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      return;
    }
    trackPageView(pagePath, document.title);
  }, [location.pathname, location.search, location.hash]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnalyticsRouteTracker />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
