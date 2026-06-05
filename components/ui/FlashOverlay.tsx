'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import styles from './FlashOverlay.module.css';

export interface FlashHandle {
  trigger: (onComplete: () => void) => void;
}

const FlashOverlay = forwardRef<FlashHandle>((_props, ref) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    trigger: (onComplete) => {
      if (!overlayRef.current) return;
      const el = overlayRef.current;
      el.style.pointerEvents = 'all';
      gsap.timeline({ onComplete: () => { el.style.pointerEvents = 'none'; onComplete(); } })
        .set(el, { opacity: 0, display: 'block' })
        .to(el, { opacity: 1, duration: 0.35, ease: 'power4.in' })
        .to(el, { opacity: 0, duration: 2.8, ease: 'power2.out', delay: 0.25 });
    },
  }));

  return <div ref={overlayRef} className={styles.flash} />;
});

FlashOverlay.displayName = 'FlashOverlay';
export default FlashOverlay;
