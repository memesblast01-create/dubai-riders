'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './Cursor.module.css';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mx = useRef(0), my = useRef(0);
  const rx = useRef(0), ry = useRef(0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      gsap.to(dotRef.current, { x: e.clientX, y: e.clientY, duration: 0.08, ease: 'none' });
      gsap.to(ringRef.current, { x: e.clientX, y: e.clientY, duration: 0.22, ease: 'power2.out' });
    };

    const onEnterLink = () => {
      gsap.to(ringRef.current, { scale: 1.9, opacity: 0.5, duration: 0.3 });
      gsap.to(dotRef.current, { scale: 0, duration: 0.2 });
    };
    const onLeaveLink = () => {
      gsap.to(ringRef.current, { scale: 1, opacity: 1, duration: 0.3 });
      gsap.to(dotRef.current, { scale: 1, duration: 0.2 });
    };

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button').forEach(el => {
      el.addEventListener('mouseenter', onEnterLink);
      el.addEventListener('mouseleave', onLeaveLink);
    });

    return () => {
      document.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.dot} />
      <div ref={ringRef} className={styles.ring} />
    </>
  );
}
