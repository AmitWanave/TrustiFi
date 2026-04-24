import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Smartphone, 
  Search, 
  FileText, 
  Star, 
  ShoppingCart,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  Cpu,
  Battery,
  Camera,
  Activity
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const HowItWorks = () => {
  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      
      {/* ── Hero Section ── */}
      <section style={{ textAlign: 'center', marginBottom: '5rem', padding: '0 1.5rem' }}>
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Replacing <span className="text-gradient">Guessing</span> with <span className="text-gradient">Knowing</span>.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            TrustiFi acts as a neutral inspection & verification layer between buyer and seller. We don’t sell phones. We don’t favor sellers. <b>We only provide truth about the device.</b>
          </p>
        </motion.div>
      </section>

      {/* ── 1. The Problem We Solve ── */}
      <section style={{ padding: '4rem 1.5rem', background: 'var(--color-bg-elevated)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <ShieldAlert size={40} color="var(--color-danger)" /> The Problem
              </h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                Buying a second-hand phone today is risky. There is no trust system in the resale market, leaving buyers vulnerable to fraud and hidden defects.
              </p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  "You don’t know if parts are original",
                  "Battery health may be fake",
                  "Hidden damages are common",
                  "IMEI issues can cause legal trouble",
                  "Sellers often hide real condition"
                ].map((item, i) => (
                  <motion.li key={i} variants={fadeIn} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)' }}>
                    <XCircle size={20} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontWeight: 500 }}>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.05), rgba(0,0,0,0))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
               <img src="/placeholder-phone.jpg" alt="Broken Trust" style={{ width: '100%', maxWidth: '300px', borderRadius: 'var(--radius-lg)', filter: 'grayscale(100%)', opacity: 0.8, marginBottom: '2rem' }} onError={(e) => e.target.style.display = 'none'} />
               <h3 style={{ color: 'var(--color-danger)', fontSize: '1.5rem' }}>High Risk of Fraud</h3>
               <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>Without verification, you are left to guess the quality of your purchase.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. Our Process (Step-by-Step) ── */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
             <h2 style={{ fontSize: '2.5rem' }}>Our Process</h2>
             <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginTop: '0.5rem' }}>How we ensure complete transparency from listing to purchase.</p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
            
            {/* Timeline Line */}
            <div style={{ position: 'absolute', left: '2rem', top: 0, bottom: 0, width: '2px', background: 'var(--glass-border)', zIndex: -1 }}></div>

            {[
              {
                icon: <Smartphone size={24} />,
                title: "Step 1: Seller Lists Phone",
                desc: "Seller lists phone on your platform, uploads photos, and provides basic device information.",
                color: "var(--color-accent-primary)"
              },
              {
                icon: <Search size={24} />,
                title: "Step 2: Expert Inspection",
                desc: "We rigorously inspect the phone covering software testing (IMEI, Battery, Performance), hardware testing (Screen, Camera, Ports), and authenticity checks for replaced parts.",
                color: "var(--color-warning)"
              },
              {
                icon: <FileText size={24} />,
                title: "Step 3: TrustiFi Report",
                desc: "We generate a detailed condition score (e.g. 8/10), log any found issues, and verify original vs. replaced parts. This report is public.",
                color: "var(--color-info)"
              },
              {
                icon: <Star size={24} />,
                title: "Step 4: Trust Score Assigned",
                desc: "Each phone gets a Trust Score. High Score = Reliable. Medium Score = Minor Issues. Low Score = Risky. Buyers can decide instantly.",
                color: "var(--color-success)"
              },
              {
                icon: <ShoppingCart size={24} />,
                title: "Step 5: Buyer Makes Safe Decision",
                desc: "Buyer sees full transparency with no hidden surprises or dependency on seller claims. Buy with total confidence.",
                color: "var(--color-accent-primary)"
              }
            ].map((step, idx) => (
              <motion.div key={idx} variants={fadeIn} style={{ display: 'flex', gap: '2rem', marginBottom: '3rem', position: 'relative' }}>
                <div style={{ 
                  width: '4rem', height: '4rem', borderRadius: '50%', background: 'var(--color-bg-base)', border: `2px solid ${step.color}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: step.color,
                  boxShadow: `0 0 20px ${step.color}33`, zIndex: 1
                }}>
                  {step.icon}
                </div>
                <div className="glass-panel" style={{ padding: '2rem', flex: 1, borderTop: `4px solid ${step.color}` }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>{step.title}</h3>
                  <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>

                  {/* Add mini-grid for Step 2 */}
                  {idx === 1 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                       <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                         <Cpu size={18} color="var(--color-accent-primary)" style={{ marginBottom: '0.5rem' }}/> <br/>Software Test
                       </div>
                       <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                         <Camera size={18} color="var(--color-warning)" style={{ marginBottom: '0.5rem' }}/> <br/>Hardware Test
                       </div>
                       <div style={{ background: 'var(--color-bg-base)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                         <Activity size={18} color="var(--color-success)" style={{ marginBottom: '0.5rem' }}/> <br/>Authenticity
                       </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

          </motion.div>
        </div>
      </section>

      {/* ── 4. How We Are Different ── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--color-bg-elevated)', borderTop: '1px solid var(--glass-border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
             <h2 style={{ fontSize: '2.5rem' }}>How We Are Different</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* The Old Way */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-panel" style={{ padding: '3rem', border: '1px solid rgba(239,68,68,0.2)' }}>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                 <TrendingDown color="var(--color-danger)" /> Others (OLX, Local Shops)
               </h3>
               <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-secondary)' }}>
                 <li style={{ display: 'flex', gap: '0.75rem' }}><XCircle size={18} color="var(--color-danger)" flexShrink={0} /> No verification</li>
                 <li style={{ display: 'flex', gap: '0.75rem' }}><XCircle size={18} color="var(--color-danger)" flexShrink={0} /> No inspection</li>
                 <li style={{ display: 'flex', gap: '0.75rem' }}><XCircle size={18} color="var(--color-danger)" flexShrink={0} /> Seller-controlled information</li>
                 <li style={{ display: 'flex', gap: '0.75rem' }}><XCircle size={18} color="var(--color-danger)" flexShrink={0} /> High risk of fraud</li>
               </ul>
            </motion.div>

            {/* The TrustiFi Way */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-panel" style={{ padding: '3rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.02))', border: '1px solid rgba(34,197,94,0.3)', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: -50, right: -50, color: 'rgba(34,197,94,0.1)' }}>
                 <ShieldCheck size={200} />
               </div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                 <TrendingUp /> TrustiFi
               </h3>
               <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--color-text-primary)', position: 'relative', zIndex: 1 }}>
                 <li style={{ display: 'flex', gap: '0.75rem', fontWeight: 500 }}><CheckCircle2 size={20} color="var(--color-success)" flexShrink={0} /> Verified inspection reports</li>
                 <li style={{ display: 'flex', gap: '0.75rem', fontWeight: 500 }}><CheckCircle2 size={20} color="var(--color-success)" flexShrink={0} /> Unbiased evaluation</li>
                 <li style={{ display: 'flex', gap: '0.75rem', fontWeight: 500 }}><CheckCircle2 size={20} color="var(--color-success)" flexShrink={0} /> Transparent condition scoring</li>
                 <li style={{ display: 'flex', gap: '0.75rem', fontWeight: 500 }}><CheckCircle2 size={20} color="var(--color-success)" flexShrink={0} /> Trust-based buying</li>
               </ul>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 5, 6, 7. Value Proposition Grid ── */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div className="container">
           <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>Why TrustiFi Matters</h2>
           
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              
              {/* General Matters */}
              <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '2.5rem' }}>
                 <ShieldCheck size={36} color="var(--color-accent-primary)" style={{ marginBottom: '1.5rem' }} />
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For The Market</h3>
                 <ul style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem' }}>
                   <li>Saves money from bad purchases</li>
                   <li>Reduces fraud in second-hand market</li>
                   <li>Builds trust between buyer & seller</li>
                   <li>Standardizes resale quality</li>
                 </ul>
              </motion.div>

              {/* For Sellers */}
              <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '2.5rem' }}>
                 <StoreIcon size={36} color="var(--color-warning)" style={{ marginBottom: '1.5rem' }} />
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Sellers</h3>
                 <ul style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem' }}>
                   <li>Gain buyer trust instantly</li>
                   <li>Sell faster with verified reports</li>
                   <li>Get better pricing for genuine devices</li>
                 </ul>
              </motion.div>

              {/* For Buyers */}
              <motion.div whileHover={{ y: -5 }} className="glass-panel" style={{ padding: '2.5rem' }}>
                 <ShoppingBagIcon size={36} color="var(--color-success)" style={{ marginBottom: '1.5rem' }} />
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Buyers</h3>
                 <ul style={{ color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingLeft: '1.25rem' }}>
                   <li>No hidden defects</li>
                   <li>No scams</li>
                   <li>Full clarity before buying</li>
                 </ul>
              </motion.div>

           </div>
        </div>
      </section>

    </div>
  );
};

// Helper internal icons
const StoreIcon = ({size, color, style}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
const ShoppingBagIcon = ({size, color, style}) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>


export default HowItWorks;
