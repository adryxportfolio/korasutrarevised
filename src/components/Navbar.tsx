import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, User, ChevronDown, ChevronRight, Heart, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { CartDrawer } from '@/components/CartDrawer';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

// Common color mapping for the filter
const colorOptions = [
  { name: 'Red', value: 'red', hex: '#DC2626' },
  { name: 'Pink', value: 'pink', hex: '#EC4899' },
  { name: 'Orange', value: 'orange', hex: '#F97316' },
  { name: 'Yellow', value: 'yellow', hex: '#EAB308' },
  { name: 'Gold', value: 'gold', hex: '#D4AF37' },
  { name: 'Green', value: 'green', hex: '#22C55E' },
  { name: 'Blue', value: 'blue', hex: '#3B82F6' },
  { name: 'Purple', value: 'purple', hex: '#A855F7' },
  { name: 'Maroon', value: 'maroon', hex: '#800000' },
  { name: 'Brown', value: 'brown', hex: '#92400E' },
  { name: 'Beige', value: 'beige', hex: '#D4B896' },
  { name: 'White', value: 'white', hex: '#FFFFFF' },
  { name: 'Black', value: 'black', hex: '#1F2937' },
  { name: 'Grey', value: 'grey', hex: '#6B7280' },
];
// Collection categories with subcategories - ALL INTERNAL ROUTES
const collectionCategories = {
  fabric: {
    label: 'Shop by Fabric',
    items: [{
      name: 'Tussar',
      href: '/collections/tussar'
    }, {
      name: 'Matka',
      href: '/collections/matka'
    }, {
      name: 'Muslin',
      href: '/collections/muslin'
    }, {
      name: 'Pure Silk',
      href: '/collections/pure-silk'
    }, {
      name: 'Katan Silk',
      href: '/collections/katan-silk'
    }, {
      name: 'Linen',
      href: '/collections/linen'
    }, {
      name: 'Cotton',
      href: '/collections/cotton'
    }]
  },
  patterns: {
    label: 'Shop by Patterns',
    items: [{
      name: 'Jamdani',
      href: '/collections/jamdani'
    }, {
      name: 'Kantha Stitch',
      href: '/collections/kantha-stitch'
    }, {
      name: 'Baluchari',
      href: '/collections/baluchari'
    }, {
      name: 'Hand Paint',
      href: '/collections/hand-paint'
    }, {
      name: 'Block Print',
      href: '/collections/block-print'
    }, {
      name: 'Batik',
      href: '/collections/batik'
    }, {
      name: 'Digital Print',
      href: '/collections/digital-print'
    }, {
      name: 'Paithani',
      href: '/collections/paithani'
    }]
  },
  occasions: {
    label: 'Shop by Occasions',
    items: [{
      name: 'Mummy ki Almari (Traditional)',
      href: '/collections/traditional'
    }, {
      name: 'Bas Yun Hi (Casual)',
      href: '/collections/casual'
    }, {
      name: 'Desk Se Dil Tak (Office Wear)',
      href: '/collections/office-wear'
    }, {
      name: 'Aj Main Upar (Party Wear)',
      href: '/collections/party-wear'
    }]
  }
};
export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [collectionsExpanded, setCollectionsExpanded] = useState(false);
  const [priceFilterExpanded, setPriceFilterExpanded] = useState(false);
  const [colorFilterExpanded, setColorFilterExpanded] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const navigate = useNavigate();
  const wishlistCount = useWishlistStore(state => state.getTotalItems());
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
      navigate(`/collections/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };
  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  const handleNavigation = (href: string) => {
    setIsOpen(false);
    navigate(href);
  };
  const handlePriceFilterApply = () => {
    setIsOpen(false);
    navigate(`/collections/all?minPrice=${priceRange[0]}&maxPrice=${priceRange[1]}`);
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) 
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const handleColorFilterApply = () => {
    setIsOpen(false);
    if (selectedColors.length > 0) {
      navigate(`/collections/all?colors=${selectedColors.join(',')}`);
    } else {
      navigate('/collections/all');
    }
  };
  return <>
      <motion.header initial={{
      y: -100
    }} animate={{
      y: 0
    }} transition={{
      duration: 0.6,
      ease: 'easeOut'
    }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-background/80 backdrop-blur-md shadow-soft' : 'bg-transparent'}`}>
        {/* Announcement Bar */}
        <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-widest font-body">
          ​Coming Soon! Launching on 26/01/2026    
        </div>

        <nav className="container mx-auto px-4 md:px-6 py-4 bg-transparent">
          <div className="flex items-center justify-between flex-nowrap">
            {/* Left: Hamburger Menu */}
            <div className="flex items-center shrink-0">
              <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-secondary/50 rounded-md transition-colors" aria-label="Open menu">
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Logo - Centered, slightly larger */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <img src={logo} alt="Kora Sutra" className="h-14 md:h-20 w-auto" />
            </Link>

            {/* Right: Wishlist, Account, Search, Cart */}
            <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
              {/* Wishlist */}
              <Link to="/wishlist" className="p-2 hover:bg-secondary/50 rounded-full transition-colors relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-accent">
                    {wishlistCount}
                  </Badge>}
              </Link>
              
              {/* Account - Opens Shopify login */}
              <button onClick={() => window.open('https://korasutrarevised-iv76s.myshopify.com/account/login', '_blank')} className="p-2 hover:bg-secondary/50 rounded-full transition-colors" aria-label="Account">
                <User className="w-5 h-5" />
              </button>
              
              {/* Search */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-secondary/50 rounded-full transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
              
              {/* Cart */}
              <CartDrawer />
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {searchOpen && <motion.form initial={{
            opacity: 0,
            height: 0
          }} animate={{
            opacity: 1,
            height: 'auto'
          }} exit={{
            opacity: 0,
            height: 0
          }} transition={{
            duration: 0.2
          }} onSubmit={handleSearch} className="mt-4 overflow-hidden">
                <div className="flex gap-2">
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search for sarees..." className="flex-1 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-sm text-sm font-body focus:outline-none focus:ring-1 focus:ring-accent" autoFocus />
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-body rounded-sm hover:bg-primary/90 transition-colors">
                    Search
                  </button>
                </div>
              </motion.form>}
          </AnimatePresence>
        </nav>
      </motion.header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.3
      }} className="fixed inset-0 bg-black/50 z-[60]" onClick={() => setIsOpen(false)} />}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        x: '-100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '-100%'
      }} transition={{
        type: 'tween',
        duration: 0.3,
        ease: 'easeInOut'
      }} className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background z-[70] shadow-2xl flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <img src={logo} alt="Kora Sutra" className="h-12 w-auto" />
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors" aria-label="Close menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-6">
              <ul className="space-y-1">
                {/* Home */}
                <li>
                  <button onClick={() => handleNavigation('/')} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50 text-left">
                    Home
                  </button>
                </li>

                {/* Price Filter */}
                <li>
                  <button onClick={() => setPriceFilterExpanded(!priceFilterExpanded)} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50">
                    Filter by Price
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${priceFilterExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {priceFilterExpanded && <motion.div initial={{
                  height: 0,
                  opacity: 0
                }} animate={{
                  height: 'auto',
                  opacity: 1
                }} exit={{
                  height: 0,
                  opacity: 0
                }} transition={{
                  duration: 0.3
                }} className="overflow-hidden">
                        <div className="pl-4 py-4 space-y-4">
                          <Slider value={priceRange} min={0} max={50000} step={500} onValueChange={value => setPriceRange(value as [number, number])} />
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                          </div>
                          <button onClick={handlePriceFilterApply} className="w-full py-2 bg-accent text-accent-foreground text-sm font-body rounded-sm hover:bg-accent/90 transition-colors">
                            Apply Filter
                          </button>
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </li>

                {/* Color Filter */}
                <li>
                  <button onClick={() => setColorFilterExpanded(!colorFilterExpanded)} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50">
                    Filter by Color
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${colorFilterExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {colorFilterExpanded && <motion.div initial={{
                  height: 0,
                  opacity: 0
                }} animate={{
                  height: 'auto',
                  opacity: 1
                }} exit={{
                  height: 0,
                  opacity: 0
                }} transition={{
                  duration: 0.3
                }} className="overflow-hidden">
                        <div className="pl-4 py-4 space-y-4">
                          <div className="grid grid-cols-4 gap-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => toggleColor(color.value)}
                                className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                                  selectedColors.includes(color.value) 
                                    ? 'border-accent scale-110' 
                                    : 'border-border hover:border-accent/50'
                                }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                              >
                                {selectedColors.includes(color.value) && (
                                  <Check className={`absolute inset-0 m-auto w-4 h-4 ${
                                    ['white', 'beige', 'yellow', 'gold'].includes(color.value) 
                                      ? 'text-foreground' 
                                      : 'text-white'
                                  }`} />
                                )}
                              </button>
                            ))}
                          </div>
                          {selectedColors.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {selectedColors.map(c => {
                                const colorObj = colorOptions.find(co => co.value === c);
                                return (
                                  <span key={c} className="text-xs bg-secondary px-2 py-1 rounded-sm">
                                    {colorObj?.name}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <button onClick={handleColorFilterApply} className="w-full py-2 bg-accent text-accent-foreground text-sm font-body rounded-sm hover:bg-accent/90 transition-colors">
                            Apply Filter
                          </button>
                          {selectedColors.length > 0 && (
                            <button onClick={() => setSelectedColors([])} className="w-full py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
                              Clear Selection
                            </button>
                          )}
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </li>

                {/* Collection - Expandable */}
                <li>
                  <button onClick={() => setCollectionsExpanded(!collectionsExpanded)} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50">
                    Collection
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${collectionsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {collectionsExpanded && <motion.div initial={{
                  height: 0,
                  opacity: 0
                }} animate={{
                  height: 'auto',
                  opacity: 1
                }} exit={{
                  height: 0,
                  opacity: 0
                }} transition={{
                  duration: 0.3
                }} className="overflow-hidden">
                        <div className="pl-4 py-2 space-y-2">
                          {/* Shop by Fabric */}
                          <div>
                            <button onClick={() => toggleCategory('fabric')} className="flex items-center justify-between w-full py-2 text-base font-body text-foreground/80 hover:text-accent transition-colors">
                              {collectionCategories.fabric.label}
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'fabric' ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === 'fabric' && <motion.ul initial={{
                          height: 0,
                          opacity: 0
                        }} animate={{
                          height: 'auto',
                          opacity: 1
                        }} exit={{
                          height: 0,
                          opacity: 0
                        }} transition={{
                          duration: 0.2
                        }} className="overflow-hidden pl-4 space-y-1">
                                  {collectionCategories.fabric.items.map(item => <li key={item.name}>
                                      <button onClick={() => handleNavigation(item.href)} className="block py-2 text-sm font-body text-muted-foreground hover:text-accent transition-colors w-full text-left">
                                        {item.name}
                                      </button>
                                    </li>)}
                                </motion.ul>}
                            </AnimatePresence>
                          </div>

                          {/* Shop by Patterns */}
                          <div>
                            <button onClick={() => toggleCategory('patterns')} className="flex items-center justify-between w-full py-2 text-base font-body text-foreground/80 hover:text-accent transition-colors">
                              {collectionCategories.patterns.label}
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'patterns' ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === 'patterns' && <motion.ul initial={{
                          height: 0,
                          opacity: 0
                        }} animate={{
                          height: 'auto',
                          opacity: 1
                        }} exit={{
                          height: 0,
                          opacity: 0
                        }} transition={{
                          duration: 0.2
                        }} className="overflow-hidden pl-4 space-y-1">
                                  {collectionCategories.patterns.items.map(item => <li key={item.name}>
                                      <button onClick={() => handleNavigation(item.href)} className="block py-2 text-sm font-body text-muted-foreground hover:text-accent transition-colors w-full text-left">
                                        {item.name}
                                      </button>
                                    </li>)}
                                </motion.ul>}
                            </AnimatePresence>
                          </div>

                          {/* Shop by Occasions */}
                          <div>
                            <button onClick={() => toggleCategory('occasions')} className="flex items-center justify-between w-full py-2 text-base font-body text-foreground/80 hover:text-accent transition-colors">
                              {collectionCategories.occasions.label}
                              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${expandedCategory === 'occasions' ? 'rotate-90' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {expandedCategory === 'occasions' && <motion.ul initial={{
                          height: 0,
                          opacity: 0
                        }} animate={{
                          height: 'auto',
                          opacity: 1
                        }} exit={{
                          height: 0,
                          opacity: 0
                        }} transition={{
                          duration: 0.2
                        }} className="overflow-hidden pl-4 space-y-1">
                                  {collectionCategories.occasions.items.map(item => <li key={item.name}>
                                      <button onClick={() => handleNavigation(item.href)} className="block py-2 text-sm font-body text-muted-foreground hover:text-accent transition-colors w-full text-left">
                                        {item.name}
                                      </button>
                                    </li>)}
                                </motion.ul>}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>}
                  </AnimatePresence>
                </li>

                {/* Best Sellers - Internal route */}
                <li>
                  <button onClick={() => handleNavigation('/collections/best-sellers')} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50 text-left">
                    Best Sellers
                  </button>
                </li>

                {/* Wishlist */}
                <li>
                  <button onClick={() => handleNavigation('/wishlist')} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50 text-left">
                    <span className="flex items-center gap-2">
                      Wishlist
                      {wishlistCount > 0 && <Badge className="h-5 px-2 bg-accent text-accent-foreground text-xs">
                          {wishlistCount}
                        </Badge>}
                    </span>
                  </button>
                </li>

                {/* About Us */}
                <li>
                  <button onClick={() => {
                setIsOpen(false);
                document.getElementById('about-section')?.scrollIntoView({
                  behavior: 'smooth'
                });
              }} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50 text-left">
                    About Us
                  </button>
                </li>

                {/* Contact */}
                <li>
                  <button onClick={() => handleNavigation('/contact')} className="flex items-center justify-between w-full py-4 text-lg font-heading tracking-wide text-foreground hover:text-accent transition-colors border-b border-border/50 text-left">
                    Contact
                  </button>
                </li>
              </ul>
            </nav>
          </motion.div>}
      </AnimatePresence>
    </>;
}