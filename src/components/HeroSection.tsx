import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroDesktop from '@/assets/hero-desktop.png';
import heroMobile from '@/assets/hero-mobile.png';

export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Desktop Hero */}
      <div className="hidden md:block relative w-full">
        <Link to="/collections/all" className="block relative w-full">
          <img
            src={heroDesktop}
            alt="Kora Sutra Sarees - Explore Our Collection of Handcrafted Tussar, Muslin & Silk Sarees"
            className="w-full h-auto object-cover"
            loading="eager"
          />
          {/* CTA overlay on right side matching the design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute bottom-12 right-12 lg:bottom-16 lg:right-16"
          >
            <span className="inline-flex items-center justify-center px-10 py-4 bg-primary text-primary-foreground font-body text-sm tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-colors shadow-lg">
              Explore Our Collection
            </span>
          </motion.div>
        </Link>
      </div>

      {/* Mobile Hero */}
      <div className="md:hidden relative w-full">
        <Link to="/collections/all" className="block relative w-full">
          <img
            src={heroMobile}
            alt="Kora Sutra Sarees - Explore Our Collection"
            className="w-full h-auto object-cover"
            loading="eager"
          />
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <span className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase rounded-sm hover:bg-primary/90 transition-colors shadow-lg">
              Explore Our Collection
            </span>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
