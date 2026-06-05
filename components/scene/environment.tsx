'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { lerpColor } from '@/lib/animations';
import { BRANDS } from '@/lib/brands';

interface EnvironmentSceneProps {
  fromBrand: number;
  toBrand: number;
  transitionT: number;
}

export default function EnvironmentScene({ fromBrand, toBrand, transitionT }: EnvironmentSceneProps) {
  const groundRef = useRef<THREE.Mesh>(null);
  const reflectionRef = useRef<THREE.Mesh>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const hemisphereLightRef = useRef<THREE.HemisphereLight>(null);

  const from = BRANDS[Math.min(fromBrand, 3)];
  const to = BRANDS[Math.min(toBrand, 3)];

  useFrame(({ scene }) => {
    const skyColor = lerpColor(from.envColor, to.envColor, transitionT);
    const fogColor = lerpColor(from.fogColor, to.fogColor, transitionT);
    scene.background = skyColor;
    if (scene.fog) {
      (scene.fog as THREE.FogExp2).color.copy(fogColor);
      const density = from.fogDensity + (to.fogDensity - from.fogDensity) * transitionT;
      (scene.fog as THREE.FogExp2).density = density;
    }
    if (hemisphereLightRef.current) {
      const skyC = lerpColor(from.envColor, to.envColor, transitionT);
      hemisphereLightRef.current.color.copy(skyC.multiplyScalar(3));
    }
  });

  // Building silhouettes
  const buildings = useMemo(() => {
    const arr = [];
    const rng = (seed: number) => {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const r = 24 + rng(i * 2) * 12;
      const w = 1.8 + rng(i * 3) * 2.2;
      const h = 8 + rng(i * 5) * 20;
      const d = 1.8 + rng(i * 7) * 2.5;
      arr.push({ x: Math.cos(angle) * r, y: h / 2, z: Math.sin(angle) * r - 6, w, h, d, seed: i });
    }
    return arr;
  }, []);

  // Parking lot lines
  const parkingLines = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      x: (i - 2.5) * 2.8,
      z: -2,
    }));
  }, []);

  return (
    <>
      {/* Hemisphere for sky/ground ambient */}
      <hemisphereLight
        ref={hemisphereLightRef}
        color="#1a0800"
        groundColor="#000000"
        intensity={0.9}
      />

      {/* Dim fill light from front */}
      <directionalLight
        position={[0, 8, 12]}
        intensity={0.08}
        color="#334466"
      />

      {/* Rim light from behind */}
      <directionalLight
        position={[0, 4, -12]}
        intensity={0.12}
        color="#223344"
      />

      {/* Ground — asphalt */}
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[80, 80, 1, 1]} />
        <meshStandardMaterial
          color="#080808"
          roughness={0.88}
          metalness={0.05}
          envMapIntensity={0.3}
        />
      </mesh>

      {/* Wet asphalt reflection layer */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[24, 32]} />
        <meshStandardMaterial
          color="#040404"
          roughness={0.02}
          metalness={0.95}
          transparent
          opacity={0.55}
          envMapIntensity={4.0}
        />
      </mesh>

      {/* Road center line */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.003, -8 + i * 4.5]}>
          <planeGeometry args={[0.14, 2.8]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.9} />
        </mesh>
      ))}

      {/* Parking lot lines */}
      {parkingLines.map((line, i) => (
        <group key={i}>
          {/* Vertical line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[line.x, 0.003, line.z]}>
            <planeGeometry args={[0.06, 4.5]} />
            <meshStandardMaterial color="#333333" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Parking number markers */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}
          position={[(i - 1.5) * 3.2, 0.003, -4]}>
          <planeGeometry args={[2.8, 0.06]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.85} />
        </mesh>
      ))}

      {/* Street lamps */}
      {[[-5, -4], [5, -4], [-5, 3], [5, 3]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Pole */}
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.055, 6.5, 8]} />
            <meshStandardMaterial color="#222222" roughness={0.6} metalness={0.8} />
          </mesh>
          {/* Arm */}
          <mesh position={[x < 0 ? 0.6 : -0.6, 3.1, 0]} rotation={[0, 0, x < 0 ? -0.3 : 0.3]}>
            <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
            <meshStandardMaterial color="#222222" roughness={0.6} metalness={0.8} />
          </mesh>
          {/* Light fixture */}
          <mesh position={[x < 0 ? 0.95 : -0.95, 3.1, 0]}>
            <boxGeometry args={[0.3, 0.12, 0.18]} />
            <meshStandardMaterial color="#111111" roughness={0.5} metalness={0.6} />
          </mesh>
          {/* Globe */}
          <mesh position={[x < 0 ? 0.95 : -0.95, 3.0, 0]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#ffeeaa" emissive="#ffdd88"
              emissiveIntensity={3.5} roughness={0.1} />
          </mesh>
          {/* Point light */}
          <pointLight
            position={[x < 0 ? 0.95 : -0.95, 2.9, 0]}
            color="#ffeebb"
            intensity={2.2}
            distance={9}
            decay={2}
            castShadow={false}
          />
        </group>
      ))}

      {/* Building silhouettes */}
      {buildings.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]}>
          <mesh castShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial
              color="#0c0c0c"
              roughness={0.95}
              metalness={0.1}
              emissive="#111111"
              emissiveIntensity={0.04}
            />
          </mesh>
          {/* Window lights - random scatter */}
          {Array.from({ length: 4 }, (_, wi) => {
            const wr = (seed: number) => {
              let x = Math.sin(seed * i + wi) * 10000;
              return x - Math.floor(x);
            };
            const wlit = wr(1) > 0.45;
            if (!wlit) return null;
            return (
              <mesh key={wi} position={[
                (wr(2) - 0.5) * (b.w * 0.7),
                (wr(3) - 0.5) * (b.h * 0.7),
                b.d / 2 + 0.01,
              ]}>
                <planeGeometry args={[0.22, 0.28]} />
                <meshStandardMaterial
                  color="#ffcc88"
                  emissive="#ffbb66"
                  emissiveIntensity={wr(4) * 2.5 + 0.5}
                  roughness={1}
                />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Dust / particle emitters handled in post */}

      {/* Fog via scene.fog — set externally */}
    </>
  );
}
