'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useSceneStore } from '@/lib/store';
import { BRANDS, CAMERA_CONFIGS } from '@/lib/brands';
import { smoothstep, rangeT, lerpColor } from '@/lib/animations';
import DeliveryBike, { BikeHandle } from '@/components/bike/DeliveryBike';
import ParkedBike from '@/components/bike/ParkedBike';
import EnvironmentScene from './Environment';
import ParticleSystem from './ParticleSystem';

export default function MainScene() {
  const { camera, scene } = useThree();
  const bikeRef = useRef<BikeHandle>(null);

  const {
    currentSection,
    sectionProgress,
    fromBrand,
    toBrand,
    transitionT,
    isTransitioning,
    parkingPhase,
  } = useSceneStore();

  // Camera smooth follow refs
  const camTargetPos = useRef(new THREE.Vector3(-1.5, 2.2, 8.5));
  const camTargetLook = useRef(new THREE.Vector3(-2, 1, 0));
  const camCurrentPos = useRef(new THREE.Vector3(-1.5, 2.2, 8.5));
  const camCurrentLook = useRef(new THREE.Vector3(-2, 1, 0));
  const idlePhase = useRef(0);

  // Parking state
  const parkingHeadlights = useRef(false);

  // Set fog on mount
  useEffect(() => {
    scene.fog = new THREE.FogExp2(new THREE.Color(BRANDS[0].fogColor), BRANDS[0].fogDensity);
    scene.background = new THREE.Color(BRANDS[0].envColor);
    return () => { scene.fog = null; };
  }, [scene]);

  // Headlight target sync
  useEffect(() => {
    if (!bikeRef.current?.headlightSpot) return;
    const brand = BRANDS[Math.min(toBrand, 3)];
    const spot = bikeRef.current.headlightSpot;
    if (spot.target) {
      spot.target.position.set(...brand.headlightTarget);
      spot.target.updateMatrixWorld();
    }
  }, [toBrand]);

  useFrame((_, delta) => {
    idlePhase.current += delta;

    // ─── DETERMINE TARGET CAMERA ───────────────────────────────────────────
    const brandIdx = Math.min(toBrand, 3);
    const brand = BRANDS[brandIdx];
    const prevBrand = BRANDS[Math.min(fromBrand, 3)];

    let targetPos: [number, number, number];
    let targetLook: [number, number, number];

    if (currentSection >= 7) {
      // Parking lot / finale
      targetPos = CAMERA_CONFIGS.parking.position;
      targetLook = CAMERA_CONFIGS.parking.target;
    } else {
      const cfgKey = brand.key as keyof typeof CAMERA_CONFIGS;
      const cfg = CAMERA_CONFIGS[cfgKey] || CAMERA_CONFIGS.talabat;
      const prevCfgKey = prevBrand.key as keyof typeof CAMERA_CONFIGS;
      const prevCfg = CAMERA_CONFIGS[prevCfgKey] || CAMERA_CONFIGS.talabat;

      if (isTransitioning) {
        // Interpolate camera between sections
        const t = smoothstep(transitionT);
        targetPos = [
          prevCfg.position[0] + (cfg.position[0] - prevCfg.position[0]) * t,
          prevCfg.position[1] + (cfg.position[1] - prevCfg.position[1]) * t,
          prevCfg.position[2] + (cfg.position[2] - prevCfg.position[2]) * t,
        ];
        targetLook = [
          prevCfg.target[0] + (cfg.target[0] - prevCfg.target[0]) * t,
          prevCfg.target[1] + (cfg.target[1] - prevCfg.target[1]) * t,
          prevCfg.target[2] + (cfg.target[2] - prevCfg.target[2]) * t,
        ];
      } else {
        targetPos = cfg.position;
        targetLook = cfg.target;
      }
    }

    // Idle sway
    const swayX = Math.sin(idlePhase.current * 0.38) * 0.018;
    const swayY = Math.sin(idlePhase.current * 0.25) * 0.009;
    const swayZ = Math.sin(idlePhase.current * 0.19) * 0.006;

    camTargetPos.current.set(
      targetPos[0] + swayX,
      targetPos[1] + swayY,
      targetPos[2] + swayZ,
    );
    camTargetLook.current.set(...targetLook);

    // Smooth damp camera
    const camLerpSpeed = isTransitioning ? 2.8 : 1.6;
    camCurrentPos.current.lerp(camTargetPos.current, delta * camLerpSpeed);
    camCurrentLook.current.lerp(camTargetLook.current, delta * camLerpSpeed);

    camera.position.copy(camCurrentPos.current);
    camera.lookAt(camCurrentLook.current);

    // ─── BIKE TRANSFORM ─────────────────────────────────────────────────────
    if (!bikeRef.current) return;

    bikeRef.current.setTransformT(transitionT, fromBrand, toBrand);

    if (currentSection >= 7) {
      // Parking sequence
      const parkT = rangeT(sectionProgress, 0, 0.6);
      const arriveT = smoothstep(parkT);
      // Drive into center slot
      bikeRef.current.setBikePosition(
        3.5 * (1 - arriveT),
        0,
        -2 + -3 * arriveT,
      );
      bikeRef.current.setBikeRotation((1 - arriveT) * -0.25);
    } else if (isTransitioning) {
      // Bike drives between sections
      const t = smoothstep(transitionT);
      const fromX = BRANDS[Math.min(fromBrand, 3)].bikePosition[0];
      const toX = BRANDS[Math.min(toBrand, 3)].bikePosition[0];
      const fromRot = BRANDS[Math.min(fromBrand, 3)].bikeRotation;
      const toRot = BRANDS[Math.min(toBrand, 3)].bikeRotation;

      // Arc path: Z dips forward during transition
      const arcZ = Math.sin(t * Math.PI) * -3.5;
      bikeRef.current.setBikePosition(fromX + (toX - fromX) * t, 0, arcZ);
      bikeRef.current.setBikeRotation(fromRot + (toRot - fromRot) * t + (t > 0.3 && t < 0.7 ? (toX < 0 ? 0.45 : -0.45) : 0));
    } else {
      const brand = BRANDS[Math.min(toBrand, 3)];
      bikeRef.current.setBikePosition(...brand.bikePosition);
      bikeRef.current.setBikeRotation(brand.bikeRotation);
    }
  });

  const showParkedBikes = currentSection >= 7;
  const parkingHeadlightsOn = parkingPhase === 'headlights' || parkingPhase === 'flash' || parkingPhase === 'contact';

  return (
    <>
      {/* Environment fog/sky/ground/buildings */}
      <EnvironmentScene
        fromBrand={fromBrand}
        toBrand={toBrand}
        transitionT={transitionT}
      />

      {/* Atmospheric particles */}
      <ParticleSystem count={160} spread={16} color="#ffcc88" size={0.022} speed={0.15} />

      {/* Hero delivery bike */}
      <DeliveryBike ref={bikeRef} initialBrand={0} />

      {/* Parked bikes in parking lot */}
      {showParkedBikes && (
        <>
          <ParkedBike
            brandIndex={0}
            position={[-4.8, 0, -2]}
            rotation={0}
            headlightsOn={parkingHeadlightsOn}
            headlightTarget={[-4.8, 1.5, 12]}
          />
          <ParkedBike
            brandIndex={1}
            position={[-1.6, 0, -2]}
            rotation={0}
            headlightsOn={parkingHeadlightsOn}
            headlightTarget={[-1.6, 1.5, 12]}
          />
          <ParkedBike
            brandIndex={2}
            position={[1.6, 0, -2]}
            rotation={0}
            headlightsOn={parkingHeadlightsOn}
            headlightTarget={[1.6, 1.5, 12]}
          />
          {/* Keeta (hero bike) parks at [4.8] — handled by main bikeRef above */}
        </>
      )}
    </>
  );
}
