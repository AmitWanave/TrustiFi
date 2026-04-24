import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const containerStyle = fullScreen
    ? { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }
    : { padding: '2rem', display: 'flex', justifyContent: 'center', width: '100%' };

  return (
    <div style={containerStyle}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--color-bg-elevated)',
          borderTopColor: 'var(--color-accent-primary)',
        }}
      />
    </div>
  );
};

export default Loader;
