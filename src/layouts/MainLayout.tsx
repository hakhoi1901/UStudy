import type { ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

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
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header selectedSemester={selectedSemester} showSemesterSelector={currentPage === 'tuition'} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 relative">
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
