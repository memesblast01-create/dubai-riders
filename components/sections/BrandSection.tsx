'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { BrandConfig } from '@/types';
import styles from './BrandSection.module.css';

interface BrandSectionProps {
  brand: BrandConfig;
  visible: boolean;
  entering: boolean;
}

export default function BrandSection({ brand, visible, entering }: BrandSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const els = [eyebrowRef.current, nameRef.current, lineRef.current, descRef.current, statsRef.current].filter(Boolean);

    if (visible && entering) {
      gsap.killTweensOf(els);
      gsap.fromTo(els,
        { opacity: 0, y: 38, filter: 'blur(5px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.05,
          ease: 'power3.out',
          stagger: 0.1,
          delay: 0.05,
        }
      );
    } else if (!visible) {
      gsap.killTweensOf(els);
      gsap.to(els, {
        opacity: 0, y: -24, filter: 'blur(4px)',
        duration: 0.55,
        ease: 'power2.in',
        stagger: 0.05,
      });
    }
  }, [visible, entering]);

  const isLeft = brand.textSide === 'left';

  return (
    <div
      ref={containerRef}
      className={`${styles.section} ${isLeft ? styles.left : styles.right}`}
    >
      {/* Eyebrow */}
      <div ref={eyebrowRef} className={styles.eyebrow}>
        {brand.key.toUpperCase()} · Dubai · Food &amp; Delivery
      </div>

      {/* Brand name — large */}
      <div ref={nameRef} className={styles.brandName} style={{ color: brand.primaryColor }}>
        {brand.name.split('').map((char, i) => (
          <span key={i} className={styles.nameChar}
            style={{ filter: `drop-shadow(0 0 24px ${brand.primaryColor}88)` }}>
            {char}
          </span>
        ))}
      </div>

      {/* Divider line */}
      <div ref={lineRef} className={styles.divider}
        style={{ background: `linear-gradient(to right, ${brand.primaryColor}88, transparent)` }} />

      {/* Description */}
      <p ref={descRef} className={styles.description}>
        {brand.description}
      </p>

      {/* Stats */}
      <div ref={statsRef} className={styles.stats}>
        {brand.stats.map((stat, i) => (
          <div key={i} className={styles.stat}>
            <span className={styles.statValue} style={{ color: brand.primaryColor }}>
              {stat.value}
            </span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
