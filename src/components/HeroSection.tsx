import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroBanner from '@/assets/hero-banner.jpeg';

// Floating particles animation component
function FloatingParticles() {
  const particles = Array.from({
    length: 20
  }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10
  }));
  return <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => <motion.div key={particle.id} className="absolute rounded-full bg-accent/20" style={{
      left: `${particle.x}%`,
      top: `${particle.y}%`,
      width: particle.size,
      height: particle.size
    }} animate={{
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      opacity: [0.3, 0.6, 0.3]
    }} transition={{
      duration: particle.duration,
      repeat: Infinity,
      delay: particle.delay,
      ease: "easeInOut"
    }} />)}
    </div>;
}
export function HeroSection() {
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Floating Particles */}
      <FloatingParticles />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--sage)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      </div>

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div initial={{
          opacity: 0,
          x: -50
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-center lg:text-left">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="mb-6 flex flex-col items-center lg:items-start">
              <span className="font-heading text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight font-light">
                Kora Sutra Sarees
              </span>
            </motion.div>
            
            <motion.h1 initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5,
            delay: 0.5
          }} className="text-5xl md:text-6xl lg:text-7xl font-heading font-light leading-tight mb-6">
              <motion.span initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.6
            }} className="inline-block text-[#570000]">
                Wear It With
              </motion.span>
              <br />
              <motion.span initial={{
              opacity: 0,
              scale: 0.8,
              rotateX: -90
            }} animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0
            }} transition={{
              duration: 0.8,
              delay: 0.9,
              type: "spring",
              stiffness: 100
            }} className="inline-block italic text-[#570000]">
                Pride
              </motion.span>
            </motion.h1>
            
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.7
          }} className="text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 font-body font-semibold leading-relaxed text-xl">Discover the artistry of handcrafted sarees, where every thread narrates <em className="italic">Bengal's rich handloom legacy</em></motion.p>
            
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.9
          }} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/collections/all" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-body text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors">
                Explore Collection
              </Link>
              <button onClick={() => document.getElementById('about-section')?.scrollIntoView({
              behavior: 'smooth'
            })} className="inline-flex items-center justify-center px-8 py-4 border border-foreground text-foreground font-body text-sm tracking-wide uppercase rounded-sm hover:bg-foreground hover:text-background transition-colors">
                Our Story
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Video */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 1,
          delay: 0.4
        }} className="relative flex items-center justify-center h-full">
            <div className="relative w-full max-w-sm lg:max-w-md mx-auto h-[calc(100vh-220px)] flex items-center justify-center">
              {/* Decorative Frame */}
              <motion.div className="absolute -inset-3 border border-accent/30 rounded-sm" animate={{
              rotate: [0, 1, 0, -1, 0]
            }} transition={{
              duration: 10,
              repeat: Infinity
            }} />
              <motion.div className="absolute -inset-6 border border-border rounded-sm" animate={{
              rotate: [0, -1, 0, 1, 0]
            }} transition={{
              duration: 12,
              repeat: Infinity
            }} />
              
              {/* Hero Image */}
              <div className="relative overflow-hidden rounded-sm shadow-elegant w-full h-full flex items-center justify-center">
                <img src={heroBanner} alt="Kora Sutra Sarees - Wear It With Pride" className="w-full h-full object-contain max-h-full" />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.5
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div animate={{
        y: [0, 10, 0]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }} className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-2">
          <motion.div className="w-1 h-2 bg-accent rounded-full" />
        </motion.div>
      </motion.div>
    </section>;
}
