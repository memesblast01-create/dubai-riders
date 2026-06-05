'use client';

import React from 'react';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
  ChromaticAberration,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { useSceneStore } from '@/lib/store';

export default function PostEffects() {
  const { currentSection, parkingPhase } = useSceneStore();
  const isParking = currentSection >= 7;

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={isParking ? 2.2 : 1.4}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.85}
      />
      <DepthOfField
        focusDistance={isParking ? 0.008 : 0.006}
        focalLength={isParking ? 0.045 : 0.038}
        bokehScale={isParking ? 2.5 : 1.8}
      />
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.028}
      />
      <Vignette
        offset={0.38}
        darkness={isParking ? 0.82 : 0.72}
      />
      <ChromaticAberration
        offset={new THREE.Vector2(0.0006, 0.0004)}
        radialModulation={false}
        modulationOffset={0}
      />
      <ToneMapping
        adaptive={false}
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={4.0}
        middleGrey={0.6}
        minLuminance={0.01}
        averageLuminance={1.0}
        adaptationRate={1.0}
      />
    </EffectComposer>
  );
}
