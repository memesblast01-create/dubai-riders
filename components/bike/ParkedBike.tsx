'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { BRANDS } from '@/lib/brands';

interface ParkedBikeProps {
  brandIndex: number;
  position: [number, number, number];
  rotation?: number;
  headlightsOn?: boolean;
  headlightTarget?: [number, number, number];
}

export default function ParkedBike({
  brandIndex,
  position,
  rotation = 0,
  headlightsOn = false,
  headlightTarget = [0, 1, 10],
}: ParkedBikeProps) {
  const spotRef = useRef<THREE.SpotLight>(null);
  const lensRef = useRef<THREE.MeshStandardMaterial>(null);

  const brand = BRANDS[brandIndex];
  const primaryColor = brand.primaryColor;

  const paintMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: primaryColor, roughness: 0.22, metalness: 0.88,
    envMapIntensity: 2.5,
  }), [primaryColor]);

  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: primaryColor, roughness: 0.65, metalness: 0.08,
  }), [primaryColor]);

  const uniformMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: primaryColor, roughness: 0.82, metalness: 0.0,
  }), [primaryColor]);

  const helmetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: primaryColor, roughness: 0.18, metalness: 0.72,
    envMapIntensity: 2.0,
  }), [primaryColor]);

  const chromeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cccccc', roughness: 0.06, metalness: 1.0, envMapIntensity: 3.0,
  }), []);

  const tireMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080808', roughness: 0.95,
  }), []);

  const headlightMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: headlightsOn ? '#ffffee' : '#111111',
    emissive: headlightsOn ? '#ffffaa' : '#000000',
    emissiveIntensity: headlightsOn ? 4.0 : 0,
    roughness: 0.02,
  }), [headlightsOn]);

  useFrame(() => {
    if (lensRef.current) {
      lensRef.current.emissiveIntensity = headlightsOn ? 4.0 : 0;
      lensRef.current.color.set(headlightsOn ? '#ffffee' : '#111111');
      lensRef.current.emissive.set(headlightsOn ? '#ffffaa' : '#000000');
    }
    if (spotRef.current) {
      spotRef.current.intensity = headlightsOn ? 16 : 0;
    }
  });

  const Wheel = ({ x }: { x: number }) => (
    <group position={[x, 0.39, 0]}>
      <group rotation={[0, Math.PI / 2, 0]}>
        {/* Tire */}
        <mesh>
          <torusGeometry args={[0.39, 0.1, 16, 32]} />
          <primitive object={tireMat} />
        </mesh>
        {/* Rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.09, 22]} />
          <primitive object={chromeMat} />
        </mesh>
        {/* Spokes */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i / 5) * Math.PI * 2]}>
            <boxGeometry args={[0.02, 0.52, 0.014]} />
            <primitive object={chromeMat} />
          </mesh>
        ))}
      </group>
    </group>
  );

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Wheels */}
      <Wheel x={1.22} />
      <Wheel x={-1.08} />

      {/* Main body */}
      <mesh position={[0, 0.94, 0.08]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 0.68, 2.45]} />
        <primitive object={paintMat} />
      </mesh>

      {/* Tank */}
      <mesh position={[0, 1.28, 0.2]} castShadow>
        <boxGeometry args={[0.4, 0.36, 0.78]} />
        <primitive object={paintMat} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.0, 1.3]} rotation={[-0.22, 0, 0]} castShadow>
        <coneGeometry args={[0.24, 0.48, 12]} />
        <primitive object={paintMat} />
      </mesh>

      {/* Seat */}
      <mesh position={[0, 1.3, -0.32]} castShadow>
        <boxGeometry args={[0.36, 0.07, 0.84]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.88} />
      </mesh>

      {/* Delivery box */}
      <mesh position={[0, 1.4, -1.02]} castShadow>
        <boxGeometry args={[0.72, 0.58, 0.74]} />
        <primitive object={boxMat} />
      </mesh>

      {/* Headlight */}
      <group position={[0, 1.06, 1.52]}>
        <mesh>
          <cylinderGeometry args={[0.16, 0.12, 0.11, 14]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh ref={lensRef as any} position={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.11, 0.09, 0.04, 14]} />
          <primitive object={headlightMat} />
        </mesh>
      </group>

      {/* Spotlight */}
      <spotLight
        ref={spotRef}
        position={[0, 1.06, 1.65]}
        target-position={headlightTarget}
        intensity={headlightsOn ? 16 : 0}
        distance={20}
        angle={Math.PI / 5.5}
        penumbra={0.4}
        decay={1.8}
        color="#fff8e0"
        castShadow={headlightsOn}
      />

      {/* Rider */}
      {/* Torso */}
      <mesh position={[0, 1.7, -0.1]} castShadow rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.42, 0.52, 0.32]} />
        <primitive object={uniformMat} />
      </mesh>

      {/* Helmet */}
      <group position={[0, 2.15, -0.06]}>
        <mesh castShadow>
          <sphereGeometry args={[0.225, 18, 14]} />
          <primitive object={helmetMat} />
        </mesh>
        <mesh position={[0, -0.02, 0.17]}>
          <boxGeometry args={[0.32, 0.13, 0.07]} />
          <meshPhysicalMaterial color="#1a2a3a" roughness={0.02} metalness={0}
            transmission={0.55} opacity={0.7} transparent />
        </mesh>
      </group>

      {/* Arms */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 1.56, 0.55]}
          rotation={[-0.85, 0, i === 0 ? 0.2 : -0.2]} castShadow>
          <cylinderGeometry args={[0.062, 0.055, 0.48, 8]} />
          <primitive object={uniformMat} />
        </mesh>
      ))}

      {/* Legs */}
      {[-0.16, 0.16].map((x, i) => (
        <mesh key={i} position={[x, 0.98, 0.28]}
          rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.13, 0.52, 0.15]} />
          <primitive object={uniformMat} />
        </mesh>
      ))}
    </group>
  );
}
