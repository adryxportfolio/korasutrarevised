import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import hero1 from '@/assets/hero-1.jpeg';
import hero2 from '@/assets/hero-2.jpeg';
import hero3 from '@/assets/hero-3.jpeg';

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
const heroSlides = [{
  id: 1,
  image: hero1,
  alt: 'Woman in elegant pink saree sitting on sofa'
}, {
  id: 2,
  image: hero2,
  alt: 'Woman in turquoise floral saree outdoors'
}, {
  id: 3,
  image: hero3,
  alt: 'Flat 15% off - New Brand Launch promotion'
}];
export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % heroSlides.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
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
            <motion.span initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="inline-block text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4 font-body">
              Kora Sutra 
            </motion.span>
            
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.5
          }} className="text-5xl md:text-6xl lg:text-7xl font-heading font-light leading-tight mb-6">Wear it with
            <br />
              <span className="italic text-accent">​Pride</span>
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
          }} className="text-lg text-muted-foreground max-w-md mx-auto lg:mx-0 mb-8 font-body leading-relaxed">
              Discover the artistry of handcrafted sarees, where every thread tells a story of pure elegance and timeless tradition.
            </motion.p>
            
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
              <a href="https://mydukaan.io/korasutra" className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-body text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors">
                Explore Collection
              </a>
              <a href="/about" className="inline-flex items-center justify-center px-8 py-4 border border-foreground text-foreground font-body text-sm tracking-wide uppercase rounded-sm hover:bg-foreground hover:text-background transition-colors">
                Our Story
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Image Slider */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 1,
          delay: 0.4
        }} className="relative">
            <div className="relative aspect-[3/4] max-w-lg mx-auto">
              {/* Decorative Frame */}
              <motion.div className="absolute -inset-4 border border-accent/30 rounded-sm" animate={{
              rotate: [0, 1, 0, -1, 0]
            }} transition={{
              duration: 10,
              repeat: Infinity
            }} />
              <motion.div className="absolute -inset-8 border border-border rounded-sm" animate={{
              rotate: [0, -1, 0, 1, 0]
            }} transition={{
              duration: 12,
              repeat: Infinity
            }} />
              
              {/* Image Slider */}
              <motion.div animate={{
              y: [0, -10, 0]
            }} transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }} className="relative h-full">
                <AnimatePresence mode="wait">
                  <motion.img key={currentSlide} src={heroSlides[currentSlide].image} alt={heroSlides[currentSlide].alt} initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} exit={{
                  opacity: 0
                }} transition={{
                  duration: 0.5
                }} className="w-full h-full object-cover rounded-sm shadow-elegant" />
                </AnimatePresence>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              </motion.div>

              {/* Slider Controls */}
              <button onClick={prevSlide} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors z-10">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextSlide} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors z-10">
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroSlides.map((_, index) => <button key={index} onClick={() => setCurrentSlide(index)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === index ? 'bg-accent w-6' : 'bg-background/60'}`} />)}
              </div>

              {/* Floating Badge */}
              <motion.div initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 1.2
            }} className="absolute -right-4 top-1/4 bg-background shadow-elegant rounded-sm p-4">
                <span className="text-xs tracking-widest uppercase text-muted-foreground block">Handcrafted</span>
                <span className="text-2xl font-heading italic text-accent">Heritage</span>
              </motion.div>
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