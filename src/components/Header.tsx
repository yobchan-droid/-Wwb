import { useState, useEffect } from 'react';
import { Scissors, Menu, X, Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  onScrollTo: (id: string) => void;
}

export default function Header({ onScrollTo }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { id: 'services', label: '服務項目 / Services' },
    { id: 'designers', label: '設計師 / Stylists' },
    { id: 'gallery', label: '作品 / Gallery' },
    { id: 'testimonials', label: '好評 / Reviews' },
    { id: 'booking', label: '預約 / Booking' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollTo(id);
  };

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-artistic-bg/95 backdrop-blur-md py-4 shadow-sm border-b border-artistic-dark/10 text-artistic-dark'
          : 'bg-artistic-bg/30 backdrop-blur-xs py-7 border-b border-artistic-dark/5 text-artistic-dark'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          
          {/* Logo with Artistic Serif flair */}
          <div 
            id="header-logo"
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="p-2 border border-artistic-dark/20 group-hover:border-artistic-accent rounded-full transition-all duration-500">
              <Scissors className="w-4 h-4 text-artistic-dark group-hover:text-artistic-accent rotate-45 group-hover:rotate-90 transition-transform duration-500" />
            </div>
            <div className="text-left">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tighter text-artistic-dark block">
                SCREEN <span className="text-artistic-accent font-medium">HAIR</span>
              </span>
              <span className="text-[9px] tracking-[0.25em] font-sans text-artistic-dark/60 block -mt-1 uppercase">
                Artisanal Studio / Linkou
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className="text-artistic-dark/70 hover:text-artistic-accent text-xs font-sans uppercase tracking-widest font-semibold transition-colors duration-300 relative py-1 group cursor-pointer"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-artistic-accent transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Booking Button (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              id="cta-header-booking"
              onClick={() => handleNavClick('booking')}
              className="flex items-center space-x-2 px-6 py-2.5 text-xs uppercase tracking-widest font-sans font-bold text-white bg-artistic-dark hover:bg-neutral-800 border border-transparent hover:border-artistic-accent/30 rounded-none transition-all duration-300 shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>立即預訂</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-artistic-dark hover:text-artistic-accent p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-artistic-bg border-b border-artistic-dark/10"
          >
            <div className="px-6 pt-2 pb-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className="block w-full text-left px-4 py-3 text-artistic-dark/80 hover:text-artistic-accent hover:bg-artistic-dark/5 rounded-none text-sm font-sans tracking-widest font-medium transition-all"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-4 px-4">
                <button
                  id="mobile-cta-booking"
                  onClick={() => handleNavClick('booking')}
                  className="w-full flex items-center justify-center space-x-2 py-3 text-xs tracking-widest font-sans uppercase font-bold text-white bg-artistic-dark hover:bg-neutral-800 rounded-none shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>立即線上預約</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
