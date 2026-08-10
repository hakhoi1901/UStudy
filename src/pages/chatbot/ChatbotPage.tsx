import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { APP_ROUTES } from '../../app/routes';
import { ChatbotWidget } from '../../features/chatbot';

export function ChatbotPage() {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  ));

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (!isMobile) return <Navigate to={APP_ROUTES.dashboard} replace />;

  return (
    <div>
      <ChatbotWidget displayMode="page" />
    </div>
  );
}
