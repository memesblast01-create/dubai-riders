'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface ParticleSystemProps {
  count?: number;
  spread?: number;
  color?: string;
  size?: number;
  speed?: number;
}

export default function ParticleSystem({
  count = 180,
  spread = 14,
  color = '#ffcc88',
  size = 0.028,
  speed = 0.18,
}: ParticleSystemProps) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, velocities, lifetimes, opacities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const opacities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3]     = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = Math.random() * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;
      velocities[i3]     = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = Math.random() * speed * 0.012 + 0.002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.008;
      lifetimes[i]  = Math.random();
      opacities[i]  = Math.random() * 0.6;
    }
    return { positions, velocities, lifetimes, opacities };
  }, [count, spread, speed]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3));
    geo.setAttribute('opacity', new THREE.BufferAttribute(opacities.slice(), 1));
    return geo;
  }, []);

  const material = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  }), [color, size]);

  useFrame((_, delta) => {
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posAttr.setXYZ(
        i,
        posAttr.getX(i) + velocities[i3] * delta * 60,
        posAttr.getY(i) + velocities[i3 + 1] * delta * 60,
        posAttr.getZ(i) + velocities[i3 + 2] * delta * 60,
      );
      lifetimes[i] += delta * 0.12;
      if (lifetimes[i] > 1 || posAttr.getY(i) > 6.5) {
        posAttr.setXYZ(i,
          (Math.random() - 0.5) * spread,
          Math.random() * 0.5,
          (Math.random() - 0.5) * spread
        );
        lifetimes[i] = 0;
      }
    }
    posAttr.needsUpdate = true;
    material.opacity = 0.35 + Math.sin(Date.now() * 0.0008) * 0.1;
  });

  return <points ref={meshRef} geometry={geometry} material={material} />;
}
