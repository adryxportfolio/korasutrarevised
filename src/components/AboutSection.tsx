import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Palette, Users, Heart, Sparkles } from 'lucide-react';

const features = [
  {
    icon: '🧵',
    title: 'Artisan Crafted',
    description: 'Woven by master craftsmen whose skills have been passed down through five generations of dedicated artisans',
  },
  {
    icon: '✨',
    title: 'Pure Fabrics',
    description: 'Sourced from the finest silk farms and cotton fields across India, ensuring unparalleled quality',
  },
  {
    icon: '🌿',
    title: 'Ethically Made',
    description: 'Supporting fair wages and sustainable practices that honor both people and planet',
  },
  {
    icon: '🎁',
    title: 'Heirloom Quality',
    description: 'Designed to be treasured and passed down through generations as precious keepsakes',
  },
];

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about-section" ref={ref} className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 75% 50%, hsl(var(--sage)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -80 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.span 
              className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4 block font-body"
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={isInView ? { opacity: 1, letterSpacing: '0.3em' } : { opacity: 0, letterSpacing: '0.1em' }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Our Story
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-heading font-light mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Weaving Dreams Into
              <br />
              <motion.span 
                className="italic text-accent inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >Timeless Elegance</motion.span>
            </motion.h2>
            {[
              'It started long ago…',
              'in the rustle of Ma\'s saree, in Dida\'s quiet embroideries, and in those childhood afternoons when we wrapped ourselves in whatever fabric we found, hoping to look like the women we admired.',
              'Somewhere in those small, ordinary moments, a deep love for sarees took root—steady, quiet, unforgettable.',
              'What began as simple fascination slowly became a dream that gently kept me awake…',
              'Today, that dream finds its life in Kora Sutra— a space where artisans, weaves, and stories meet with honesty.',
              'Where a saree is not just worn, but chosen… cherished… and passed on.'
            ].map((text, index) => (
              <motion.p
                key={index}
                className="text-muted-foreground font-body leading-relaxed mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>

          {/* Right Content - Features */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-secondary/50 rounded-sm p-6 text-center hover:shadow-soft transition-shadow duration-300"
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="font-heading text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-12"
        >
          {[
            { icon: Palette, label: 'Curated Designs' },
            { icon: Users, label: 'Artisan Families' },
            { icon: Heart, label: 'Happy Customers' },
            { icon: Sparkles, label: 'Loved By Women' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="flex justify-center mb-3"
              >
                <stat.icon className="w-8 h-8 md:w-10 md:h-10 text-accent" strokeWidth={1.5} />
              </motion.div>
              <span className="text-sm text-muted-foreground font-body tracking-wide">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
