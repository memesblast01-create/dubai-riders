'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useSceneStore } from '@/lib/store';
import { BRANDS } from '@/lib/brands';
import styles from './Nav.module.css';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { fromBrand, toBrand, transitionT, currentSection } = useSceneStore();

  // Compute current accent color from brand
  const brandIdx = Math.min(toBrand, 3);
  const brand = BRANDS[brandIdx];

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out', delay: 0.5 }
    );
  }, []);

  const toggleMenu = () => {
    setMenuOpen(v => !v);
    if (!menuOpen) {
      gsap.to(menuRef.current, { opacity: 1, y: 0, pointerEvents: 'auto', duration: 0.45, ease: 'power3.out' });
    } else {
      gsap.to(menuRef.current, { opacity: 0, y: -12, pointerEvents: 'none', duration: 0.3, ease: 'power2.in' });
    }
  };

  const navLinks = [
    { label: 'Talabat', href: '#s1' },
    { label: 'Noon', href: '#s2' },
    { label: 'Careem', href: '#s3' },
    { label: 'Keeta', href: '#s4' },
    { label: 'Fleet', href: '#parking' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <nav ref={navRef} className={styles.nav}>
        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
          <span className={styles.hamburgerLine} />
        </button>

        {/* Logo */}
        <a href="#" className={styles.logo}>
          <span className={styles.logoMark}>DR</span>
          <span className={styles.logoText}>DUBAI<br />RIDERS</span>
        </a>

        {/* CTA */}
        <a href="#contact" className={styles.cta} style={{ '--accent': brand.primaryColor } as React.CSSProperties}>
          <span>Join the Fleet</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </nav>

      {/* Dropdown menu */}
      <div ref={menuRef} className={styles.menu} style={{ opacity: 0, transform: 'translateY(-12px)', pointerEvents: 'none' }}>
        <div className={styles.menuInner}>
          {navLinks.map((link, i) => (
            <a
              key={i}
              href={link.href}
              className={styles.menuLink}
              onClick={() => {
                setMenuOpen(false);
                gsap.to(menuRef.current, { opacity: 0, y: -12, pointerEvents: 'none', duration: 0.3 });
              }}
            >
              <span className={styles.menuLinkNum}>0{i + 1}</span>
              <span className={styles.menuLinkLabel}>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
