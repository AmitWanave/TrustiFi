import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Scale, 
  FileText, 
  Lock, 
  Zap, 
  DollarSign,
  HeartHandshake
} from 'lucide-react';

const contentMap = {
  'pricing': {
    title: 'Transparent Pricing',
    description: 'We believe in clear, upfront costs with no hidden fees. Our pricing reflects the quality and depth of our inspection service.',
    icon: <DollarSign size={48} color="var(--color-accent-primary)" />,
    sections: [
      {
        title: 'Basic Inspection',
        content: 'Verification of IMEI, battery health, and basic functionality. Ideal for standard listings.',
        price: '₹499'
      },
      {
        title: 'Premium Inspection',
        content: 'Deep-dive hardware check, internal parts verification, and a comprehensive Trust Report.',
        price: '₹999',
        featured: true
      },
      {
        title: 'Seller Premium',
        content: 'Priority inspection, professional photography for listings, and featured placement.',
        price: '₹1,499'
      }
    ]
  },
  'trust-score': {
    title: 'About Trust Score',
    description: 'Our proprietary Trust Score is what sets TrustiFi apart. It is a mathematical representation of a device\'s true condition.',
    icon: <ShieldCheck size={48} color="var(--color-success)" />,
    sections: [
      {
        title: 'How it\'s Calculated',
        content: 'The score is derived from 50+ data points including hardware health, software integrity, historical reliability, and physical cosmetic condition.'
      },
      {
        title: 'What the Scores Mean',
        content: '8-10: Excellent, near-mint condition. 6-7: Reliable, minor wear. Below 5: Significant issues documented in report.'
      }
    ]
  },
  'help': {
    title: 'Help Center',
    description: 'Find answers to common questions about buying, selling, and inspections on TrustiFi.',
    icon: <HelpCircle size={48} color="var(--color-accent-primary)" />,
    sections: [
      {
        title: 'Getting Started',
        content: 'Learn how to create an account, list your first phone, or browse verified listings with confidence.'
      },
      {
        title: 'Inspection Process',
        content: 'Understand what happens when a phone is submitted for inspection and how to read reports.'
      },
      {
        title: 'Payment & Safety',
        content: 'Information about secure payment methods and our buyer protection policies.'
      }
    ]
  },
  'contact': {
    title: 'Contact Us',
    description: 'Have more questions? Our team is here to help you navigate the TrustiFi marketplace.',
    icon: <Mail size={48} color="var(--color-accent-primary)" />,
    sections: [
      {
        title: 'Customer Support',
        content: 'Email: support@trustifi.example | Phone: +91 98765 43210 (Mon-Sat, 9AM-6PM)'
      },
      {
        title: 'Corporate Inquiries',
        content: 'For partnerships or business inquiries, contact info@trustifi.example'
      },
      {
        title: 'Office Location',
        content: '123 Tech Park, Whitefield, Bangalore, Karnataka - 560066'
      }
    ]
  },
  'disputes': {
    title: 'Dispute Resolution',
    description: 'We aim for 100% satisfaction, but if something goes wrong, we have a fair and transparent process to fix it.',
    icon: <Scale size={48} color="var(--color-warning)" />,
    sections: [
      {
        title: 'Our Guarantee',
        content: 'If the device you receive does not match our inspection report, we offer a full refund or replacement.'
      },
      {
        title: 'Filing a Claim',
        content: 'Claims must be filed within 48 hours of receiving the device. Reach out via the Help Center or contact support directly.'
      }
    ]
  },
  'terms': {
    title: 'Terms of Service',
    description: 'Legal guidelines and rules for using the TrustiFi platform as a buyer or seller.',
    icon: <FileText size={48} color="var(--color-text-muted)" />,
    sections: [
      {
        title: 'User Obligations',
        content: 'Users must provide accurate information and honor their commitments to buy or sell devices.'
      },
      {
        title: 'Platform Role',
        content: 'TrustiFi acts as a verification layer and marketplace but is not a party to the direct sale contract.'
      }
    ]
  },
  'privacy': {
    title: 'Privacy Policy',
    description: 'How we handle and protect your personal data when you use the TrustiFi services.',
    icon: <Lock size={48} color="var(--color-accent-primary)" />,
    sections: [
      {
        title: 'Data Collection',
        content: 'We collect information necessary to facilitate transactions and inspections, such as contact and payment details.'
      },
      {
        title: 'Security',
        content: 'Your data is encrypted and stored securely. We never sell your personal information to third parties.'
      }
    ]
  }
};

const StaticPage = () => {
  const { slug: paramSlug } = useParams();
  const { pathname } = useLocation();
  
  // Try to get slug from params first, then from pathname
  const slug = paramSlug || pathname.split('/').pop();
  const pageData = contentMap[slug];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!pageData) {
    return (
      <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <h2>Page Not Found</h2>
        <p>The content you are looking for does not exist.</p>
        <Link to="/" style={{ color: 'var(--color-accent-primary)', marginTop: '1rem', display: 'inline-block' }}>Return Home</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ padding: '4rem 0' }}
    >
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header Section */}
        <section style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}
          >
            {pageData.icon}
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            {pageData.title}
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}
          >
            {pageData.description}
          </motion.p>
        </section>

        {/* Content Section */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          {pageData.sections.map((section, idx) => (
            <motion.div 
              key={idx}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              className="glass-panel"
              style={{ 
                padding: '2.5rem',
                borderLeft: section.featured ? '4px solid var(--color-accent-primary)' : '1px solid var(--glass-border)',
                background: section.featured ? 'linear-gradient(to right, rgba(16, 185, 129, 0.05), transparent)' : 'var(--color-bg-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.5rem' }}>{section.title}</h3>
                {section.price && (
                  <span style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: 'var(--color-accent-primary)',
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    {section.price}
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action or Footer note */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: '5rem', textAlign: 'center', padding: '3rem', borderTop: '1px solid var(--glass-border)' }}
        >
          <HeartHandshake size={32} color="var(--color-text-muted)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>
            Still have questions? Our support team is ready to assist you.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/contact" className="text-gradient" style={{ fontWeight: 600 }}>Contact Support</Link>
            <span style={{ color: 'var(--glass-border)' }}>|</span>
            <Link to="/help" className="text-gradient" style={{ fontWeight: 600 }}>View FAQ</Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StaticPage;
