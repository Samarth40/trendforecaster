import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { HomeIcon, ChartBarIcon, NewspaperIcon } from '@heroicons/react/24/outline';
import { MessageSquare } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Trends', href: '/dashboard/trends', icon: ChartBarIcon },
  { name: 'News', href: '/dashboard/news', icon: NewspaperIcon },
  { name: 'AI Chat', href: '/dashboard/chat', icon: MessageSquare }
];

function MainLayout() {
  return (
    <div className="min-h-screen bg-[#0F1629]">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0F1629] via-[#162033] to-[#1a2236] pointer-events-none"></div>

      {/* Subtle grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1E293B15_1px,transparent_1px),linear-gradient(to_bottom,#1E293B15_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Content container with solid background */}
            <div className="bg-[#1a2236] rounded-lg shadow-xl">
              {/* Header accent line */}
              <div className="h-1 bg-gradient-to-r from-[#4F46E5] via-[#3B82F6] to-[#06B6D4] rounded-t-lg"></div>
              
              {/* Main content area */}
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout; 