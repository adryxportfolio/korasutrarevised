import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { journalArticles } from '@/data/journals';

export default function Journals() {
  return (
    <>
      <Helmet>
        <title>Journals | Kora Sutra — Handloom Stories, Saree Care & Textile Heritage</title>
        <meta
          name="description"
          content="Explore the Kora Sutra journals — stories of handloom revival, Tussar silk, Muslin, Kantha stitch, Jamdani weaving, Batik, block print, and how to care for your sarees. Celebrating India's textile heritage."
        />
        <meta
          name="keywords"
          content="Kora Sutra journal, handloom blog, saree blog, Tussar silk guide, Muslin saree, Kantha stitch, Jamdani weaving, Baluchari saree, block print saree, Batik saree, silk saree care, Indian textile heritage, handwoven saree India, sustainable fashion India, saree draping guide, Bengal handloom, artisan craft India"
        />
        <link rel="canonical" href="https://korasutra.com/journals" />
        <meta property="og:title" content="Journals | Kora Sutra — Textile Stories & Heritage" />
        <meta property="og:description" content="Stories of handloom revival, artisan craft, and India's rich textile traditions." />
        <meta property="og:url" content="https://korasutra.com/journals" />
        <meta property="og:type" content="blog" />
      </Helmet>

      <Navbar />
      <main className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-sm tracking-[0.3em] text-muted-foreground uppercase mb-4 block font-body">
              Join Into The
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-script text-accent mb-4">
              Journals
            </h1>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              Stories of craft, heritage, and the women who keep India's textile traditions alive.
            </p>
          </motion.div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {journalArticles.map((article, index) => (
              <motion.article
                key={article.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
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
                  <h2 className="font-heading text-lg md:text-xl mb-2 group-hover:text-accent transition-colors leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground font-body line-clamp-3 leading-relaxed mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-body">
                      By {article.author} · {article.readTime}
                    </span>
                    <span className="inline-flex items-center text-sm font-body text-accent group-hover:gap-2 gap-1 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
