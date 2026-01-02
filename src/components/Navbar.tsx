import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { CartDrawer } from '@/components/CartDrawer';

const SHOPIFY_STORE = 'https://shop.korasutra.com';

// Collection categories with subcategories
const collectionCategories = {
  fabric: {
    label: 'Shop by Fabric',
    items: [
      { name: 'Tussar', href: `${SHOPIFY_STORE}/collections/tussar` },
      { name: 'Matka', href: `${SHOPIFY_STORE}/collections/matka` },
      { name: 'Muslin', href: `${SHOPIFY_STORE}/collections/muslin` },
      { name: 'Pure Silk', href: `${SHOPIFY_STORE}/collections/pure-silk` },
      { name: 'Katan Silk', href: `${SHOPIFY_STORE}/collections/katan-silk` },
      { name: 'Linen', href: `${SHOPIFY_STORE}/collections/linen` },
      { name: 'Cotton', href: `${SHOPIFY_STORE}/collections/cotton` },
    ],
  },
  patterns: {
    label: 'Shop by Patterns',
    items: [
      { name: 'Jamdani', href: `${SHOPIFY_STORE}/collections/jamdani` },
      { name: 'Kantha Stitch', href: `${SHOPIFY_STORE}/collections/kantha-stitch` },
      { name: 'Baluchari', href: `${SHOPIFY_STORE}/collections/baluchari` },
      { name: 'Hand Paint', href: `${SHOPIFY_STORE}/collections/hand-paint` },
      { name: 'Block Print', href: `${SHOPIFY_STORE}/collections/block-print` },
      { name: 'Batik', href: `${SHOPIFY_STORE}/collections/batik` },
      { name: 'Digital Print', href: `${SHOPIFY_STORE}/collections/digital-print` },
      { name: 'Paithani', href: `${SHOPIFY_STORE}/collections/paithani` },
    ],
  },
  occasions: {
    label: 'Shop by Occasions',
    items: [
      { name: 'Mummy ki Almari (Traditional)', href: `${SHOPIFY_STORE}/collections/traditional` },
      { name: 'Bas Yun Hi (Casual)', href: `${SHOPIFY_STORE}/collections/casual` },
      { name: 'Desk Se Dil Tak (Office Wear)', href: `${SHOPIFY_STORE}/collections/office-wear` },
      { name: 'Aj Main Upar (Party Wear)', href: `${SHOPIFY_STORE}/collections/party-wear` },
    ],
  },
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);

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
      window.location.href = `${SHOPIFY_STORE}/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
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
            {/* Left: Hamburger Menu */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:bg-secondary/50 rounded-md transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo - Centered, slightly larger */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={logo} alt="Kora Sutra" className="h-14 md:h-20 w-auto" />
            </Link>

            {/* Right: Account, Search, Cart */}
            <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
              {/* Account */}
              <a
                href={`${SHOPIFY_STORE}/account`}
                className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                aria-label="Account"
              >
                <User className="w-5 h-5" />
              </a>
              
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              
              {/* Cart */}
              <CartDrawer />
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
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background z-[70] shadow-2xl flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
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
            <nav className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-1">
                {/* Home */}
                <li>
                  <Link
                    to="/"
                    className="flex items-center justify-between py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50"
                    onClick={() => setIsOpen(false)}
                  >
                    Home
                  </Link>
                </li>

                {/* Collection - Expandable */}
                <li>
                  <button
                    onClick={() => setCollectionsExpanded(!collectionsExpanded)}
                    className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50"
                  >
                    Collection
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${collectionsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {collectionsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-2 space-y-2">
                          {/* Shop by Fabric */}
                          <div>
                            <button
                              onClick={() => toggleCategory('fabric')}
                              className="flex items-center justify-between w-full py-2 text-base font-body text-foreground/80 hover:text-accent transition-colors"
                            >
                              {collectionCategories.fabric.label}
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'fabric' ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === 'fabric' && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden pl-4 space-y-1"
                                >
                                  {collectionCategories.fabric.items.map((item) => (
                                    <li key={item.name}>
                                      <a
                                        href={item.href}
                                        className="block py-2 text-sm font-body text-muted-foreground hover:text-accent transition-colors"
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {item.name}
                                      </a>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Shop by Patterns */}
                          <div>
                            <button
                              onClick={() => toggleCategory('patterns')}
                              className="flex items-center justify-between w-full py-2 text-base font-body text-foreground/80 hover:text-accent transition-colors"
                            >
                              {collectionCategories.patterns.label}
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'patterns' ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === 'patterns' && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden pl-4 space-y-1"
                                >
                                  {collectionCategories.patterns.items.map((item) => (
                                    <li key={item.name}>
                                      <a
                                        href={item.href}
                                        className="block py-2 text-sm font-body text-muted-foreground hover:text-accent transition-colors"
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {item.name}
                                      </a>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Shop by Occasions */}
                          <div>
                            <button
                              onClick={() => toggleCategory('occasions')}
                              className="flex items-center justify-between w-full py-2 text-base font-body text-foreground/80 hover:text-accent transition-colors"
                            >
                              {collectionCategories.occasions.label}
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'occasions' ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === 'occasions' && (
                                <motion.ul
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden pl-4 space-y-1"
                                >
                                  {collectionCategories.occasions.items.map((item) => (
                                    <li key={item.name}>
                                      <a
                                        href={item.href}
                                        className="block py-2 text-sm font-body text-muted-foreground hover:text-accent transition-colors"
                                        onClick={() => setIsOpen(false)}
                                      >
                                        {item.name}
                                      </a>
                                    </li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>

                {/* Best Sellers */}
                <li>
                  <a
                    href={`${SHOPIFY_STORE}/collections/best-sellers`}
                    className="flex items-center justify-between py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50"
                    onClick={() => setIsOpen(false)}
                  >
                    Best Sellers
                  </a>
                </li>

                {/* About Us */}
                <li>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50 text-left"
                  >
                    About Us
                  </button>
                </li>

                {/* Contact */}
                <li>
                  <Link
                    to="/contact"
                    className="flex items-center justify-between py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
