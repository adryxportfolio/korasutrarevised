import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '@/assets/hero-video.mp4';

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
      {particles.map(particle => <motion.div key={particle.id} className="absolute rounded-full bg-white/20" style={{
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
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });

  // Parallax transforms
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.3]);

  return <section ref={sectionRef} className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Full-screen Video Background with Ken Burns + Parallax Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-[-10%] w-[120%] h-[120%]"
          style={{ scale: videoScale }}
        >
          <video 
            src={heroVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content with Parallax */}
      <motion.div 
        className="container mx-auto px-6 relative z-10"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-2xl">
          {/* Text Content */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
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
          }} className="inline-block tracking-[0.3em] text-white/80 uppercase mb-4 font-body text-lg md:text-2xl">KORA SUTRA SAREES</motion.span>
            
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.5
          }} className="text-5xl md:text-6xl lg:text-7xl font-heading font-light leading-tight mb-6 text-white">Wear it with
            <br />
              <span className="italic text-white/90">​Pride</span>
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
          }} className="text-white/80 max-w-md mx-auto lg:mx-0 mb-8 font-body leading-relaxed text-lg md:text-xl">
              Discover the artistry of handcrafted sarees, where every thread tells a story of pure elegance and timeless beauty. 
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
              <Link to="/collections/all" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-body text-sm tracking-wide rounded-sm hover:bg-white/90 transition-colors">
                Explore Collection
              </Link>
              <button onClick={() => document.getElementById('about-section')?.scrollIntoView({
              behavior: 'smooth'
            })} className="inline-flex items-center justify-center px-8 py-4 border border-white text-white font-body text-sm tracking-wide uppercase rounded-sm hover:bg-white hover:text-black transition-colors">
                Our Story
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.5
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <motion.div animate={{
        y: [0, 10, 0]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }} className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <motion.div className="w-1 h-2 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </section>;
}