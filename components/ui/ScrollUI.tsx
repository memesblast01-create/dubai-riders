'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useSceneStore } from '@/lib/store';
import { BRANDS } from '@/lib/brands';
import styles from './ScrollUI.module.css';

export default function ScrollUI() {
  const { currentSection, scrollProgress, toBrand, parkingPhase } = useSceneStore();
  const progressRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Hide scroll UI in contact section
  const isContact = parkingPhase === 'contact' || currentSection >= 9;
  const brandIdx = Math.min(toBrand, 3);
  const accentColor = BRANDS[brandIdx].primaryColor;

  // Section dots: 0=Talabat, 1=Noon, 2=Careem, 3=Keeta, 4=Parking
  const activeDot = Math.min(Math.floor(currentSection / 2), 4);

  const labels = ['Talabat', 'Noon', 'Careem', 'Keeta', 'Fleet'];

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: scrollProgress,
        duration: 0.12,
        ease: 'none',
      });
    }
  }, [scrollProgress]);

  if (isContact) return null;

  return (
    <>
      {/* Top progress bar */}
      <div className={styles.progressTrack}>
        <div
          ref={progressRef}
          className={styles.progressFill}
          style={{ background: `linear-gradient(to right, #FF5200, #F5C518, #1DBF73, ${accentColor})` }}
        />
      </div>

      {/* Right side section dots */}
      <div className={styles.dots}>
        {labels.map((label, i) => (
          <button
            key={i}
            className={`${styles.dot} ${activeDot === i ? styles.active : ''}`}
            style={{ '--accent': BRANDS[Math.min(i, 3)].primaryColor } as React.CSSProperties}
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('jumpToSection', { detail: { idx: i } })
              );
            }}
            aria-label={label}
            title={label}
          >
            <span className={styles.dotInner} />
            <span className={styles.dotLabel}>{label}</span>
          </button>
        ))}
      </div>

      {/* Bottom scroll hint (only on section 0) */}
      {currentSection === 0 && (
        <div ref={indicatorRef} className={styles.scrollHint}>
          <span className={styles.scrollText}>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      )}

      {/* Section counter bottom-left */}
      <div className={styles.counter}>
        <span className={styles.counterCurrent}>
          {String(activeDot + 1).padStart(2, '0')}
        </span>
        <span className={styles.counterDivider}>/</span>
        <span className={styles.counterTotal}>05</span>
      </div>
    </>
  );
}
