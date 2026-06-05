'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import styles from './ContactSection.module.css';

interface ContactSectionProps {
  visible: boolean;
}

export default function ContactSection({ visible }: ContactSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (visible) {
      const children = Array.from(containerRef.current.children);
      gsap.fromTo(children,
        { opacity: 0, y: 50, filter: 'blur(8px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.4,
          ease: 'power3.out',
          stagger: 0.15,
          delay: 0.3,
        }
      );
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div ref={containerRef} className={styles.container}>
        {/* Eyebrow */}
        <p className={styles.eyebrow}>Dubai Riders Network · Join the Fleet</p>

        {/* Heading */}
        <h2 className={styles.heading}>
          CONTACT<br />
          <span className={styles.headingAccent}>US</span>
        </h2>

        {/* Subtext */}
        <p className={styles.sub}>
          Partner with the best delivery network in the UAE.<br />
          Ride with purpose. Deliver with precision.
        </p>

        {/* Buttons */}
        <div className={styles.buttons}>
          <a
            href="mailto:hello@dubairiders.ae"
            className={`${styles.btn} ${styles.btnEmail}`}
          >
            <span className={styles.btnIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </span>
            <span>Email Us</span>
          </a>

          <a
            href="https://wa.me/971501234567"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.btnWhatsapp}`}
          >
            <span className={styles.btnIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.549 4.1 1.51 5.83L.057 24l6.304-1.654A11.937 11.937 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.372l-.36-.213-3.732.979.996-3.643-.235-.374A9.784 9.784 0 0 1 2.182 12c0-5.421 4.397-9.818 9.818-9.818S21.818 6.579 21.818 12 17.421 21.818 12 21.818z"/>
              </svg>
            </span>
            <span>WhatsApp</span>
          </a>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          © 2025 Dubai Riders · All rights reserved<br />
          <span className={styles.footerSub}>Powered by the night · Built for speed</span>
        </p>
      </div>
    </div>
  );
}
