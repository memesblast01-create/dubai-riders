'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import styles from './Loader.module.css';

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: 100,
      duration: 2.4,
      ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.floor(obj.value);
        setPct(v);
        if (barRef.current) barRef.current.style.transform = `scaleX(${v / 100})`;
      },
      onComplete: () => {
        setTimeout(() => {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.9,
            ease: 'power2.inOut',
            onComplete,
          });
        }, 350);
      },
    });
  }, [onComplete]);

  return (
    <div ref={containerRef} className={styles.loader}>
      {/* Background grid */}
      <div className={styles.grid} />

      <div className={styles.content}>
        <div className={styles.logoWrap}>
          <span className={styles.logoD}>D</span>
          <span className={styles.logoR}>R</span>
        </div>
        <p className={styles.brand}>DUBAI RIDERS</p>
        <p className={styles.tagline}>Elite Delivery Network</p>

        <div className={styles.barWrap}>
          <div ref={barRef} className={styles.bar} />
        </div>

        <p className={styles.pct}>
          <span ref={pctRef}>{String(pct).padStart(3, '0')}</span>
          <span className={styles.pctSuffix}> %</span>
        </p>

        <p className={styles.hint}>Initializing cinematic experience</p>
      </div>
    </div>
  );
}
