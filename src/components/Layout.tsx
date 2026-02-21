import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Music, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0D0B1E] text-[#F8F7FF] font-sans selection:bg-[#7C3AED] selection:text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0D0B1E]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#A855F7] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Musicifal</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Home</Link>
            <Link to="/pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Pricing</Link>
            <Button variant="musicifal" size="sm" asChild>
              <Link to="/analyze">Get Started</Link>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#0D0B1E] pt-20 px-4 md:hidden"
          >
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-lg font-medium text-gray-300 py-2 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/pricing" 
                className="text-lg font-medium text-gray-300 py-2 border-b border-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Button variant="musicifal" className="w-full mt-4" asChild>
                <Link to="/analyze" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16 min-h-screen">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-12 bg-[#0D0B1E]">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Musicifal. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
