'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload, AdaptiveDpr, AdaptiveEvents, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import MainScene from './MainScene';
import PostEffects from './PostEffects';

export default function SceneCanvas() {
  return (
    <Canvas
      className="scene-canvas"
      shadows="soft"
      dpr={[1, 2]}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.35,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: 'high-performance',
        alpha: false,
      }}
      camera={{
        fov: 52,
        near: 0.1,
        far: 200,
        position: [-1.5, 2.2, 8.5],
      }}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0,
      }}
    >
      <PerformanceMonitor
        onDecline={() => {/* reduce quality if needed */}}
        onIncline={() => {}}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <MainScene />
          <PostEffects />
          <Preload all />
        </Suspense>
      </PerformanceMonitor>
    </Canvas>
  );
}
