import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Where can I purchase Kora Sutra sarees?",
    answer: "All our sarees are available for purchase on our official Dukaan store at mydukaan.io/korasutra. We currently do not sell through any other platform or marketplace."
  },
  {
    question: "Are your sarees handcrafted?",
    answer: "Yes, all our sarees are handcrafted by skilled artisans using traditional techniques. Each piece is unique and made with care."
  },
  {
    question: "How do I know my saree size?",
    answer: "Most of our sarees are standard 6-yard length. For specific measurements, please refer to our Size Guide page or contact us for assistance."
  },
  {
    question: "What payment methods do you accept?",
    answer: "Our Dukaan store accepts various payment methods including UPI, credit/debit cards, net banking, and popular wallets."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping within India takes 5-7 business days. Metro cities may receive orders faster. Please visit our Shipping page for detailed information."
  },
  {
    question: "Can I return or exchange a saree?",
    answer: "Yes, we accept returns within 7 days of delivery. Video proof of unboxing is mandatory for all return requests. Please read our Returns Policy for complete details."
  },
  {
    question: "How do I care for my saree?",
    answer: "Care instructions vary by fabric. Silk sarees should be dry cleaned, while cotton sarees can be hand washed with mild detergent. Each saree comes with specific care instructions."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we only ship within India. We are working on expanding our shipping options. Please check back for updates."
  },
  {
    question: "How can I contact customer support?",
    answer: "You can reach us via email at korasutra.official@gmail.com or call us at +91 79958 62266. We're available Monday to Saturday, 10 AM to 6 PM IST."
  },
  {
    question: "Are the colors in the images accurate?",
    answer: "We strive to display colors as accurately as possible. However, slight variations may occur due to screen settings and lighting conditions during photography."
  }
];

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://korasutra.com" },
    { "@type": "ListItem", position: 2, name: "FAQs", item: "https://korasutra.com/faqs" }
  ]
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(faq => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer
    }
  }))
};

export default function FAQs() {
  return (
    <>
      <Helmet>
        <title>FAQs - Kora Sutra | Frequently Asked Questions About Handcrafted Sarees</title>
        <meta 
          name="description" 
          content="Find answers to common questions about Kora Sutra sarees - shipping, returns, payment methods, saree care, sizing, and more. Get help with your saree purchase." 
        />
        <meta name="keywords" content="Kora Sutra FAQ, saree questions, shipping policy, returns policy, saree care, saree sizing, payment methods" />
        <link rel="canonical" href="https://korasutra.com/faqs" />
        
        <meta property="og:title" content="FAQs - Kora Sutra | Frequently Asked Questions" />
        <meta property="og:description" content="Find answers to common questions about Kora Sutra sarees - shipping, returns, payment methods, and more." />
        <meta property="og:url" content="https://korasutra.com/faqs" />
        <meta property="og:type" content="website" />
        
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-heading font-light mb-8">Frequently Asked Questions</h1>
          <p className="text-muted-foreground font-body mb-12">
            Find answers to common questions about Kora Sutra, our products, and services.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-heading text-lg text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 p-6 bg-secondary/50 rounded-sm">
            <h2 className="text-xl font-heading mb-4">Still have questions?</h2>
            <p className="text-muted-foreground font-body mb-4">
              Contact our support team and we'll be happy to help.
            </p>
            <a 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body text-sm rounded-sm hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
