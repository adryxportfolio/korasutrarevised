import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'The Brown Tussar Baluchari I received was absolutely stunning. The craftsmanship is impeccable and the fabric feels so luxurious. Kora Sutra has earned a customer for life!',
    product: 'Brown Tussar Baluchari'
  },
  {
    id: 2,
    name: 'Ananya Reddy',
    location: 'Hyderabad',
    rating: 5,
    text: 'I was looking for a special saree for my sister\'s wedding and found the perfect one here. The quality exceeded my expectations and the delivery was prompt. Highly recommend!',
    product: 'Pink Tissue Muslin'
  },
  {
    id: 3,
    name: 'Meera Iyer',
    location: 'Chennai',
    rating: 5,
    text: 'Such beautiful weaves! You can feel the love and care that goes into each piece. The saree I bought has received so many compliments. Thank you, Kora Sutra!',
    product: 'Jamdani Silk'
  },
  {
    id: 4,
    name: 'Kavitha Das',
    location: 'Kolkata',
    rating: 5,
    text: 'As someone who appreciates traditional handloom, I\'m truly impressed. The Kantha stitch saree is a work of art. Worth every penny!',
    product: 'Kantha Stitch'
  },
  {
    id: 5,
    name: 'Rashmi Patel',
    location: 'Ahmedabad',
    rating: 5,
    text: 'The customer service was exceptional. They helped me choose the perfect saree for a special occasion. The quality is outstanding!',
    product: 'Linen Saree'
  },
  {
    id: 6,
    name: 'Deepika Nair',
    location: 'Bangalore',
    rating: 5,
    text: 'I\'ve bought multiple sarees from Kora Sutra and each one has been a treasure. The attention to detail and authenticity is what keeps me coming back.',
    product: 'Block Print'
  }
];

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-background rounded-sm p-6 shadow-soft hover:shadow-md transition-shadow duration-300"
    >
      <Quote className="w-8 h-8 text-primary/30 mb-4" />
      
      <p className="text-muted-foreground font-body leading-relaxed mb-6">
        "{testimonial.text}"
      </p>
      
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
        ))}
      </div>
      
      <div className="border-t border-border pt-4">
        <p className="font-heading text-foreground">{testimonial.name}</p>
        <p className="text-sm text-muted-foreground font-body">{testimonial.location}</p>
        <p className="text-xs text-primary font-body mt-1">Purchased: {testimonial.product}</p>
      </div>
    </motion.div>
  );
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4 block font-body">
            What Our Customers Say
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-light">
            Loved by <span className="italic text-accent">Women</span> Everywhere
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
