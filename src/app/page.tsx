'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSceneStore } from '@/lib/store';
import { useScrollController } from '@/hooks/useScrollController';
import { BRANDS } from '@/lib/brands';
import { audioManager } from '@/lib/audio';
import BrandSection from '@/components/sections/BrandSection';
import ContactSection from '@/components/sections/ContactSection';
import Nav from '@/components/ui/Nav';
import ScrollUI from '@/components/ui/ScrollUI';
import Cursor from '@/components/ui/Cursor';
import Loader from '@/components/ui/Loader';
import FlashOverlay, { FlashHandle } from '@/components/ui/FlashOverlay';
import styles from './page.module.css';

// Dynamic import — Canvas must be client-side only
const SceneCanvas = dynamic(
  () => import('@/components/scene/SceneCanvas'),
  { ssr: false, loading: () => null }
);

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const flashRef = useRef<FlashHandle>(null);
  const { scrollContainerRef } = useScrollController();

  const {
    currentSection,
    fromBrand,
    toBrand,
    transitionT,
    isTransitioning,
    parkingPhase,
    contactVisible,
    setParkingPhase,
    setContactVisible,
  } = useSceneStore();

  // Determine which brand section to show
  const activeBrandIdx = Math.min(toBrand, 3);
  const showBrandSection = currentSection < 7 && parkingPhase !== 'contact';
  const brandEntering = !isTransitioning || transitionT > 0.5;

  // Audio init on user gesture
  const initAudio = useCallback(() => {
    audioManager.init();
    audioManager.startAmbient();
  }, []);

  // Handle flash trigger when headlights go on
  useEffect(() => {
    if (parkingPhase === 'headlights') {
      setTimeout(() => {
        flashRef.current?.trigger(() => {
          setParkingPhase('contact');
          setContactVisible(true);
        });
      }, 900);
    }
  }, [parkingPhase, setParkingPhase, setContactVisible]);

  if (!loaded) {
    return (
      <Loader onComplete={() => {
        setLoaded(true);
        initAudio();
      }} />
    );
  }

  return (
    <main className={styles.main} onClick={initAudio}>
      {/* Custom cursor */}
      <Cursor />

      {/* Flash overlay */}
      <FlashOverlay ref={flashRef} />

      {/* 3D Canvas — fixed, behind everything */}
      <SceneCanvas />

      {/* Navigation */}
      <Nav />

      {/* Scroll UI — progress bar, dots, counter */}
      <ScrollUI />

      {/* Scrollable container — creates scroll height */}
      <div
        ref={scrollContainerRef}
        className={styles.scrollContainer}
        style={{ cursor: 'none' }}
      >
        {/* 10 virtual scroll sections × 100vh each */}
        <div className={styles.scrollContent} style={{ height: '1000vh' }}>
          {/* Invisible anchors for section IDs */}
          <div id="s1" style={{ position: 'absolute', top: '0vh' }} />
          <div id="s2" style={{ position: 'absolute', top: '200vh' }} />
          <div id="s3" style={{ position: 'absolute', top: '400vh' }} />
          <div id="s4" style={{ position: 'absolute', top: '600vh' }} />
          <div id="parking" style={{ position: 'absolute', top: '700vh' }} />
          <div id="contact" style={{ position: 'absolute', top: '900vh' }} />
        </div>
      </div>

      {/* Brand section overlay — fixed, shown during brand sections */}
      {showBrandSection && (
        <BrandSection
          brand={BRANDS[activeBrandIdx]}
          visible={showBrandSection && !isTransitioning}
          entering={brandEntering}
        />
      )}

      {/* Contact section */}
      <ContactSection visible={contactVisible} />
    </main>
  );
}
