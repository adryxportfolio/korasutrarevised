import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const megaMenuData = {
  'Shop by Fabric': [
    { name: 'Tussar Silk', href: '/collections/tussar' },
    { name: 'Matka Silk', href: '/collections/matka' },
    { name: 'Muslin', href: '/collections/muslin' },
    { name: 'Pure Silk', href: '/collections/pure-silk' },
    { name: 'Katan Silk', href: '/collections/katan-silk' },
    { name: 'Linen', href: '/collections/linen' },
    { name: 'Cotton', href: '/collections/cotton' },
  ],
  'Shop by Pattern': [
    { name: 'Jamdani', href: '/collections/jamdani' },
    { name: 'Kantha Stitch', href: '/collections/kantha-stitch' },
    { name: 'Baluchari', href: '/collections/baluchari' },
    { name: 'Hand Paint', href: '/collections/hand-paint' },
    { name: 'Block Print', href: '/collections/block-print' },
    { name: 'Batik', href: '/collections/batik' },
    { name: 'Digital Print', href: '/collections/digital-print' },
    { name: 'Paithani', href: '/collections/paithani' },
  ],
  'Shop by Occasion': [
    { name: 'Traditional', href: '/collections/traditional' },
    { name: 'Casual', href: '/collections/casual' },
    { name: 'Office Wear', href: '/collections/office-wear' },
    { name: 'Party Wear', href: '/collections/party-wear' },
    { name: 'Wedding', href: '/collections/best-sellers' },
    { name: 'Festive', href: '/collections/best-sellers' },
  ],
};

const quickLinks = [
  { name: 'New Arrivals', href: '/collections/new-arrivals' },
  { name: 'Best Sellers', href: '/collections/best-sellers' },
  { name: 'All Sarees', href: '/collections/all' },
];

export function MegaMenu() {
  const [isOpen, setIsOpen] = useState(false);
  let timeoutId: ReturnType<typeof setTimeout>;

  const handleMouseEnter = () => {
    clearTimeout(timeoutId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutId = setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <div
      className="hidden lg:block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="flex items-center gap-1 text-sm font-body tracking-wide text-foreground hover:text-accent transition-colors py-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        Collections
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[700px] bg-background border border-border shadow-elegant rounded-sm z-50"
          >
            <div className="p-6">
              <div className="grid grid-cols-4 gap-6">
                {/* Category Columns */}
                {Object.entries(megaMenuData).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">
                      {category}
                    </h3>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-body text-foreground/80 hover:text-accent transition-colors block py-0.5"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Quick Links Column */}
                <div>
                  <h3 className="text-xs font-body tracking-[0.2em] uppercase text-muted-foreground mb-3">
                    Quick Links
                  </h3>
                  <ul className="space-y-2">
                    {quickLinks.map((item) => (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className="text-sm font-body text-accent font-medium hover:text-accent/80 transition-colors block py-0.5"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {/* Brand Tagline */}
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-body italic leading-relaxed">
                      "Celebrating Bengal's textile heritage, one saree at a time."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
