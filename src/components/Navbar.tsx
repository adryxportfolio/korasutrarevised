import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const DUKAAN_STORE = 'https://mydukaan.io/korasutra';

const mobileNavLinks = [
  { name: 'Home', href: '/', isInternal: true },
  { name: 'All Collections', href: 'https://mydukaan.io/korasutra/categories/default', isInternal: false },
  { name: 'Fabrics', href: 'https://mydukaan.io/korasutra/categories/fabric-3417', isInternal: false },
  { name: 'Patterns', href: 'https://mydukaan.io/korasutra/categories/pattern', isInternal: false },
  { name: 'Occasions', href: 'https://mydukaan.io/korasutra/categories/occasion', isInternal: false },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${DUKAAN_STORE}?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'bg-background/80 backdrop-blur-md shadow-soft' : 'bg-transparent'
        }`}
      >
        {/* Announcement Bar */}
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-widest font-body">
          FREE SHIPPING ALL OVER INDIA
        </div>

        <nav className="container mx-auto px-4 md:px-6 py-4 bg-transparent">
          <div className="flex items-center justify-between flex-nowrap">
            {/* Mobile: Search Left | Desktop: Hamburger Left */}
            <div className="flex items-center shrink-0">
              {/* Hamburger - Hidden on mobile, visible on desktop */}
              <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex p-2 hover:bg-secondary/50 rounded-md transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              {/* Search - Visible on mobile (left side), hidden on desktop */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden p-2 hover:bg-secondary/50 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Logo - Centered */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={logo} alt="Kora Sutra" className="h-12 md:h-18 w-auto" />
            </Link>

            {/* CTA - Right */}
            <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
              {/* Search - Hidden on mobile, visible on desktop */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex p-2 hover:bg-secondary/50 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <a
                href={DUKAAN_STORE}
                className="px-2 md:px-4 py-2 bg-primary text-primary-foreground text-xs md:text-sm font-body tracking-wide rounded-sm hover:bg-primary/90 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span className="hidden sm:inline">Continue to</span> Store
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSearch}
                className="mt-4 overflow-hidden"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for sarees..."
                    className="flex-1 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-accent"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-body rounded-sm hover:bg-primary/90 transition-colors"
                  >
                    Search
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background z-[70] shadow-2xl"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <img src={logo} alt="Kora Sutra" className="h-12 w-auto" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-6 overflow-y-auto h-[calc(100%-180px)]">
              <ul className="space-y-1">
                {mobileNavLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.isInternal ? (
                      <Link
                        to={link.href}
                        className="flex items-center justify-between py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors group border-b border-border/50"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="flex items-center justify-between py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors group border-b border-border/50"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                        <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </a>
                    )}
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-secondary/30">
              <a
                href={DUKAAN_STORE}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground text-sm font-body tracking-wide rounded-sm hover:bg-primary/90 transition-colors"
              >
                Continue to Store
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
