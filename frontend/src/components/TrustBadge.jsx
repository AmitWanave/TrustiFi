import React from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import styles from './TrustBadge.module.css';
import { clsx } from 'clsx';

const TrustBadge = ({ score, grade, size = 'default' }) => {
  if (!score && !grade) return null;

  const getVariant = (g) => {
    if (['A+', 'A'].includes(g)) return styles.excellent;
    if (['B+', 'B'].includes(g)) return styles.good;
    if (['C'].includes(g)) return styles.fair;
    return styles.poor;
  };

  const IconWrapper = ['A+', 'A', 'B+', 'B'].includes(grade) ? ShieldCheck : AlertCircle;

  return (
    <div className={clsx(styles.badge, getVariant(grade), styles[size])}>
      <IconWrapper size={size === 'large' ? 24 : 16} />
      <div className={styles.info}>
        <span className={styles.grade}>Grade {grade}</span>
      </div>
    </div>
  );
};

export default TrustBadge;
