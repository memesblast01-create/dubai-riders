'use client';

import React, { useRef } from 'react';
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
import * as THREE from 'three';

export default function PostEffects() {
  const { currentSection, parkingPhase } = useSceneStore();

  const isParking = currentSection >= 7;
  const isContact = parkingPhase === 'contact';

  return (
    <EffectComposer multisampling={4}>
      {/* Bloom — headlights, emissives, street lamps */}
      <Bloom
        intensity={isParking ? 2.2 : 1.4}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.85}
      />

      {/* Depth of field — slight, cinematic */}
      <DepthOfField
        focusDistance={isParking ? 0.008 : 0.006}
        focalLength={isParking ? 0.045 : 0.038}
        bokehScale={isParking ? 2.5 : 1.8}
        height={480}
      />

      {/* Film grain */}
      <Noise
        premultiply
        blendFunction={BlendFunction.ADD}
        opacity={0.028}
      />

      {/* Vignette */}
      <Vignette
        offset={0.38}
        darkness={isParking ? 0.82 : 0.72}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* Chromatic aberration — very subtle */}
      <ChromaticAberration
        offset={new THREE.Vector2(0.0006, 0.0004)}
        radialModulation={false}
        modulationOffset={0}
        blendFunction={BlendFunction.NORMAL}
      />

      {/* ACES tone mapping */}
      <ToneMapping
        blendFunction={BlendFunction.NORMAL}
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
