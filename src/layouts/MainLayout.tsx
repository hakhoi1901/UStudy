import type { ReactNode } from 'react';
import { Header, Sidebar } from '../components/layout';
import { ChatbotWidget } from '../features/chatbot';

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  selectedSemester: string;
}

export function MainLayout({
  children,
  currentPage,
  onPageChange,
  selectedSemester
}: MainLayoutProps) {
  return (
    <div className="ustudy-app-shell">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />

      <div className="ustudy-main-column">
        <Header selectedSemester={selectedSemester} showSemesterSelector={currentPage === 'tuition'} />

        <main className="ustudy-main-scroll">
          <div className="ustudy-page-container">
            {children}
          </div>
        </main>
      </div>

      {currentPage !== 'chatbot' && <ChatbotWidget />}
    </div>
  );
}
