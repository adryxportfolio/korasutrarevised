import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { journalArticles } from '@/data/journals';
import { Button } from '@/components/ui/button';

const INITIAL_COUNT = 4;

export function JournalsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [showAll, setShowAll] = useState(false);

  const visibleArticles = showAll ? journalArticles : journalArticles.slice(0, INITIAL_COUNT);

  return (
    <section ref={ref} className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <span className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4 block font-body">
            Join Into The
          </span>
          <h2 className="text-4xl md:text-5xl font-script text-accent">
            Journals
          </h2>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((article, index) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link to={`/journals/${article.slug}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden mb-4">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <span className="text-xs tracking-[0.2em] text-muted-foreground uppercase font-body block mb-2">
                  {article.category}
                </span>
                <h3 className="font-heading text-lg md:text-xl mb-2 group-hover:text-accent transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground font-body line-clamp-3 leading-relaxed mb-3">
                  {article.excerpt}
                </p>
                <span className="inline-flex items-center text-sm font-body text-accent group-hover:gap-2 gap-1 transition-all">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        {/* Load More / View All */}
        {!showAll && journalArticles.length > INITIAL_COUNT && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAll(true)}
              className="group"
            >
              Load More Journals
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        )}

        {showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Button asChild variant="outline" size="lg" className="group">
              <Link to="/journals">
                View All Journals
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
