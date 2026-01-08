import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
export function NewsletterSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-100px'
  });
  const [phone, setPhone] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone) {
      toast.success('Thank you for subscribing!', {
        description: 'You will receive updates about new collections and exclusive offers.'
      });
      setPhone('');
    }
  };
  return <section ref={ref} className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Decorative Elements */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.1 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute top-10 left-10 w-40 h-40 border border-primary-foreground rounded-full"
          initial={{ scale: 0, rotate: -180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-60 h-60 border border-primary-foreground rounded-full"
          initial={{ scale: 0, rotate: 180 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: 180 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-20 h-20 border border-primary-foreground"
          initial={{ scale: 0, rotate: 0 }}
          animate={isInView ? { scale: 1, rotate: 45 } : { scale: 0, rotate: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        />
      </motion.div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{
        opacity: 0,
        y: 50
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {
        opacity: 0,
        y: 50
      }} transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }} className="max-w-2xl mx-auto text-center">
          <motion.span 
            className="text-sm tracking-[0.3em] uppercase mb-4 block font-body opacity-70"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 0.7, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Stay Connected
          </motion.span>
          <motion.h2 
            className="text-4xl md:text-5xl font-heading font-light mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Join The <motion.span 
              className="italic inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 200 }}
            >Korasutra Circle</motion.span>
          </motion.h2>
          <motion.p 
            className="text-primary-foreground/80 font-body mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Be the first to know about new collections, exclusive offers, and styling tips 
            curated just for you.
          </motion.p>

          <motion.form initial={{
          opacity: 0,
          y: 20
        }} animate={isInView ? {
          opacity: 1,
          y: 0
        } : {
          opacity: 0,
          y: 20
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:border-primary-foreground/50" required />
            <Button type="submit" variant="gold" size="lg" className="whitespace-nowrap">
              Subscribe
            </Button>
          </motion.form>

          <motion.p initial={{
          opacity: 0
        }} animate={isInView ? {
          opacity: 1
        } : {
          opacity: 0
        }} transition={{
          duration: 0.6,
          delay: 0.5
        }} className="text-xs text-primary-foreground/60 mt-4 font-body">
            By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>;
}