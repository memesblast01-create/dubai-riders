'use client';

import React, { useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { smoothstep, rangeT, lerpColor } from '@/lib/animations';
import { BRANDS } from '@/lib/brands';

export interface BikeHandle {
  group: THREE.Group | null;
  frontWheel: THREE.Group | null;
  rearWheel: THREE.Group | null;
  headlightSpot: THREE.SpotLight | null;
  setTransformT: (t: number, fromIdx: number, toIdx: number) => void;
  setBikePosition: (x: number, y: number, z: number) => void;
  setBikeRotation: (y: number) => void;
  triggerSuspensionDip: () => void;
}

interface BikeProps {
  initialBrand?: number;
}

const DeliveryBike = forwardRef<BikeHandle, BikeProps>(({ initialBrand = 0 }, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const frontWheelRef = useRef<THREE.Group>(null);
  const rearWheelRef = useRef<THREE.Group>(null);
  const headlightRef = useRef<THREE.SpotLight>(null);
  const headlightTargetRef = useRef<THREE.Object3D>(null);

  // Material refs for color interpolation
  const paintMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const boxMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const uniformMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const helmetMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const helmetVisorMatRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const emissiveDecalRef = useRef<THREE.MeshStandardMaterial>(null);

  // Animation state
  const stateRef = useRef({
    wheelRot: 0,
    suspY: 0,
    suspVel: 0,
    breathPhase: 0,
    idlePhase: 0,
    transformT: 0,
    fromBrand: initialBrand,
    toBrand: initialBrand,
    isMoving: false,
    moveSpeed: 0,
    targetX: BRANDS[initialBrand].bikePosition[0],
    currentX: BRANDS[initialBrand].bikePosition[0],
  });

  // --- Geometry builders ---

  // Beveled box (simulated via scaled sphere + box composite)
  const makeBodyShape = (w: number, h: number, d: number) => {
    const geo = new THREE.BoxGeometry(w, h, d, 2, 2, 4);
    // Soften verts for rounded look
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const bevel = 0.04;
      pos.setXYZ(i,
        x + Math.sign(x) * bevel * 0.3,
        y + Math.sign(y) * bevel * 0.3,
        z + Math.sign(z) * bevel * 0.2
      );
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  };

  const makeWheelAssembly = (radius: number) => {
    return (
      <group>
        {/* Tire */}
        <mesh castShadow receiveShadow>
          <torusGeometry args={[radius, 0.105, 18, 36]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.92} metalness={0.02}
            envMapIntensity={0.5} />
        </mesh>
        {/* Rim */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.72, radius * 0.72, 0.095, 24]} />
          <meshStandardMaterial color="#c8c8c8" roughness={0.08} metalness={1.0}
            envMapIntensity={2.0} />
        </mesh>
        {/* Hub center */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[radius * 0.16, radius * 0.16, 0.13, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.9} />
        </mesh>
        {/* Spokes ×6 */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i / 6) * Math.PI * 2]}>
            <boxGeometry args={[0.022, radius * 1.35, 0.014]} />
            <meshStandardMaterial color="#b0b0b0" roughness={0.15} metalness={0.95} />
          </mesh>
        ))}
        {/* Brake disc */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0.065, 0, 0]}>
          <cylinderGeometry args={[radius * 0.58, radius * 0.58, 0.018, 24]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.85} />
        </mesh>
      </group>
    );
  };

  // Chrome material shared
  const chromeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#cccccc', roughness: 0.06, metalness: 1.0,
    envMapIntensity: 3.0,
  }), []);

  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0e0e0e', roughness: 0.55, metalness: 0.3,
  }), []);

  const tireMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#080808', roughness: 0.95, metalness: 0.0,
  }), []);

  const initialColor = BRANDS[initialBrand].primaryColor;

  const paintMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: initialColor, roughness: 0.22, metalness: 0.88,
    envMapIntensity: 2.5,
  }), []);

  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: initialColor, roughness: 0.62, metalness: 0.12,
    envMapIntensity: 1.0,
  }), []);

  const uniformMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: initialColor, roughness: 0.82, metalness: 0.04,
  }), []);

  const helmetMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: initialColor, roughness: 0.18, metalness: 0.72,
    envMapIntensity: 2.0,
  }), []);

  const headlightLensMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffee', emissive: '#ffffaa', emissiveIntensity: 4.0,
    roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.9,
  }), []);

  const glowDecalMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff', emissive: initialColor, emissiveIntensity: 1.5,
    roughness: 1.0, metalness: 0,
  }), []);

  const tailLightMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ff2200', emissive: '#ff1100', emissiveIntensity: 2.0,
  }), []);

  // Assign refs to materials
  useEffect(() => {
    if (paintMatRef.current) Object.assign(paintMatRef.current, paintMat);
    if (boxMatRef.current) Object.assign(boxMatRef.current, boxMat);
    if (uniformMatRef.current) Object.assign(uniformMatRef.current, uniformMat);
    if (helmetMatRef.current) Object.assign(helmetMatRef.current, helmetMat);
  }, []);

  useImperativeHandle(ref, () => ({
    group: groupRef.current,
    frontWheel: frontWheelRef.current,
    rearWheel: rearWheelRef.current,
    headlightSpot: headlightRef.current,
    setTransformT: (t, fromIdx, toIdx) => {
      const s = stateRef.current;
      s.transformT = t;
      s.fromBrand = fromIdx;
      s.toBrand = toIdx;
    },
    setBikePosition: (x, y, z) => {
      if (groupRef.current) groupRef.current.position.set(x, y, z);
    },
    setBikeRotation: (y) => {
      if (groupRef.current) groupRef.current.rotation.y = y;
    },
    triggerSuspensionDip: () => {
      stateRef.current.suspVel = -0.06;
    },
  }));

  useFrame((_, delta) => {
    const s = stateRef.current;

    // Color interpolation
    const t = smoothstep(s.transformT);
    const fromBrand = BRANDS[Math.max(0, Math.min(3, s.fromBrand))];
    const toBrand = BRANDS[Math.max(0, Math.min(3, s.toBrand))];

    const newPaint = lerpColor(fromBrand.primaryColor, toBrand.primaryColor, t);
    const newBox   = lerpColor(fromBrand.primaryColor, toBrand.primaryColor, t);
    const newUniform = lerpColor(fromBrand.primaryColor, toBrand.primaryColor, t);
    const newHelmet = lerpColor(fromBrand.primaryColor, toBrand.primaryColor, t);

    paintMat.color.copy(newPaint);
    boxMat.color.copy(newBox);
    uniformMat.color.copy(newUniform);
    helmetMat.color.copy(newHelmet);
    glowDecalMat.emissive.copy(newPaint);

    // Wheel rotation when moving
    if (Math.abs(s.moveSpeed) > 0.001) {
      s.wheelRot += s.moveSpeed * delta * 8;
      if (frontWheelRef.current) frontWheelRef.current.rotation.x = s.wheelRot;
      if (rearWheelRef.current) rearWheelRef.current.rotation.x = s.wheelRot;
    }

    // Suspension spring
    s.suspVel += (-s.suspY * 24 - s.suspVel * 6) * delta;
    s.suspY += s.suspVel * delta * 60;
    s.suspY = Math.max(-0.08, Math.min(0.06, s.suspY));

    // Rider idle breath
    s.breathPhase += delta * 0.9;
    s.idlePhase += delta * 0.5;

    if (groupRef.current) {
      // Apply suspension to whole bike
      groupRef.current.position.y = s.suspY + Math.sin(s.idlePhase) * 0.005;
      // Very slight tilt on idle
      groupRef.current.rotation.z = Math.sin(s.idlePhase * 1.3) * 0.003;
    }
  });

  return (
    <group ref={groupRef}>
      {/* === FRONT WHEEL ASSEMBLY === */}
      <group ref={frontWheelRef} position={[1.28, 0.39, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {makeWheelAssembly(0.39)}
        </group>
      </group>

      {/* === REAR WHEEL ASSEMBLY === */}
      <group ref={rearWheelRef} position={[-1.12, 0.39, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {makeWheelAssembly(0.39)}
        </group>
      </group>

      {/* === FRONT FORK === */}
      <group position={[1.1, 0.8, 0]}>
        {[-0.19, 0.19].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0.18, 0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.028, 0.95, 10]} />
            <primitive object={chromeMat} />
          </mesh>
        ))}
      </group>

      {/* === SWINGARM / REAR SUSPENSION === */}
      <group position={[-0.7, 0.62, 0]}>
        {[-0.14, 0.14].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, 0.15]} castShadow>
            <cylinderGeometry args={[0.025, 0.022, 0.88, 8]} />
            <primitive object={chromeMat} />
          </mesh>
        ))}
        {/* Shock absorber */}
        <mesh position={[0, 0.15, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.52, 8]} />
          <meshStandardMaterial color="#ffcc00" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>

      {/* === MAIN FRAME === */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <boxGeometry args={[0.06, 0.06, 2.1]} />
        <primitive object={chromeMat} />
      </mesh>

      {/* === ENGINE BLOCK === */}
      <mesh position={[0.1, 0.65, 0.1]} castShadow>
        <boxGeometry args={[0.52, 0.48, 0.7]} />
        <meshStandardMaterial color="#111111" roughness={0.45} metalness={0.88}
          envMapIntensity={1.5} />
      </mesh>

      {/* === MAIN FAIRING / BODY === */}
      <mesh position={[0, 0.95, 0.1]} castShadow receiveShadow>
        <primitive object={makeBodyShape(0.62, 0.72, 2.55)} />
        <primitive object={paintMat} />
      </mesh>

      {/* Fairing upper */}
      <mesh position={[0, 1.28, 0.55]} castShadow>
        <boxGeometry args={[0.52, 0.42, 0.92]} />
        <primitive object={paintMat} />
      </mesh>

      {/* Fuel tank */}
      <mesh position={[0, 1.32, 0.18]} castShadow>
        <boxGeometry args={[0.42, 0.38, 0.82]} />
        <primitive object={paintMat} />
      </mesh>

      {/* Front nose cowl */}
      <mesh position={[0, 1.02, 1.36]} castShadow rotation={[-0.22, 0, 0]}>
        <coneGeometry args={[0.26, 0.52, 12]} />
        <primitive object={paintMat} />
      </mesh>

      {/* Side panels */}
      {[-0.33, 0.33].map((x, i) => (
        <mesh key={i} position={[x, 0.88, 0.02]} castShadow>
          <boxGeometry args={[0.06, 0.58, 2.2]} />
          <primitive object={paintMat} />
        </mesh>
      ))}

      {/* Under belly fairing */}
      <mesh position={[0, 0.52, 0.22]} castShadow>
        <boxGeometry args={[0.55, 0.15, 1.6]} />
        <primitive object={paintMat} />
      </mesh>

      {/* === WINDSCREEN === */}
      <mesh position={[0, 1.62, 1.05]} rotation={[-0.52, 0, 0]} castShadow>
        <boxGeometry args={[0.44, 0.38, 0.025]} />
        <meshPhysicalMaterial
          color="#88aacc"
          roughness={0.02}
          metalness={0}
          transmission={0.82}
          opacity={0.55}
          transparent
          envMapIntensity={1.5}
        />
      </mesh>

      {/* === HANDLEBARS === */}
      <group position={[0, 1.48, 0.85]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.7, 8]} />
          <primitive object={chromeMat} />
        </mesh>
        {/* Grips */}
        {[-0.36, 0.36].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]} castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.14, 8]} />
            <primitive object={darkMat} />
          </mesh>
        ))}
        {/* Mirrors */}
        {[-0.42, 0.42].map((x, i) => (
          <group key={i} position={[x, 0.06, -0.04]}>
            <mesh>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
              <primitive object={chromeMat} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[0.09, 0.06, 0.012]} />
              <meshStandardMaterial color="#111111" roughness={0.05} metalness={0.9}
                envMapIntensity={3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* === HEADLIGHT CLUSTER === */}
      <group position={[0, 1.08, 1.55]}>
        {/* Outer housing */}
        <mesh castShadow>
          <cylinderGeometry args={[0.18, 0.14, 0.12, 16]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.4} metalness={0.7} />
        </mesh>
        {/* DRL strip */}
        {[-0.12, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0.06, 0.02]}>
            <boxGeometry args={[0.08, 0.012, 0.01]} />
            <meshStandardMaterial
              color="#ffffff" emissive="#aaddff"
              emissiveIntensity={3.0} roughness={1} />
          </mesh>
        ))}
        {/* Main lens */}
        <mesh position={[0, 0, 0.04]}>
          <cylinderGeometry args={[0.12, 0.1, 0.05, 16]} />
          <primitive object={headlightLensMat} />
        </mesh>
      </group>

      {/* === SPOTLIGHT FROM HEADLIGHT === */}
      <spotLight
        ref={headlightRef}
        position={[0, 1.08, 1.68]}
        intensity={18}
        distance={22}
        angle={Math.PI / 5.5}
        penumbra={0.45}
        decay={1.8}
        color="#fff8e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
      />
      <object3D ref={headlightTargetRef} position={[6, 1.5, 0]} />

      {/* === TAILLIGHT === */}
      <mesh position={[0, 0.96, -1.35]}>
        <boxGeometry args={[0.32, 0.07, 0.02]} />
        <primitive object={tailLightMat} />
      </mesh>
      <pointLight position={[0, 0.96, -1.4]} color="#ff1100" intensity={1.5} distance={3} />

      {/* === EXHAUST PIPES === */}
      {[0.22].map((x, i) => (
        <group key={i} position={[x, 0.52, -0.8]}>
          <mesh rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.048, 0.055, 1.12, 12]} />
            <primitive object={chromeMat} />
          </mesh>
          {/* Tip */}
          <mesh position={[0.08, -0.52, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.055, 0.038, 0.18, 12]} />
            <primitive object={chromeMat} />
          </mesh>
        </group>
      ))}

      {/* === FOOTPEGS === */}
      {[-0.28, 0.28].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.15]} castShadow>
          <boxGeometry args={[0.08, 0.022, 0.2]} />
          <primitive object={chromeMat} />
        </mesh>
      ))}

      {/* === SEAT === */}
      <mesh position={[0, 1.32, -0.35]} castShadow>
        <boxGeometry args={[0.38, 0.072, 0.88]} />
        <meshStandardMaterial color="#0c0c0c" roughness={0.88} metalness={0.05} />
      </mesh>

      {/* === DELIVERY BOX === */}
      <group position={[0, 1.42, -1.05]}>
        {/* Main box */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.74, 0.6, 0.76]} />
          <primitive object={boxMat} />
        </mesh>
        {/* Box lid */}
        <mesh position={[0, 0.32, 0]} castShadow>
          <boxGeometry args={[0.76, 0.06, 0.78]} />
          <primitive object={boxMat} />
        </mesh>
        {/* Reflective strips */}
        {[-0.38, 0.38].map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <boxGeometry args={[0.012, 0.58, 0.72]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff"
              emissiveIntensity={0.8} roughness={0.8} />
          </mesh>
        ))}
        {/* Brand logo strip on side */}
        <mesh position={[0.375, 0, 0]}>
          <boxGeometry args={[0.008, 0.18, 0.38]} />
          <primitive object={glowDecalMat} />
        </mesh>
        {/* Handle on top */}
        <mesh position={[0, 0.38, 0]}>
          <torusGeometry args={[0.1, 0.015, 8, 16]} />
          <primitive object={chromeMat} />
        </mesh>
      </group>

      {/* === RIDER === */}
      <group position={[0, 0, 0.08]}>
        {/* Legs lower */}
        {[-0.17, 0.17].map((x, i) => (
          <group key={i} position={[x, 0.72, 0.22]}>
            <mesh castShadow>
              <boxGeometry args={[0.13, 0.42, 0.15]} />
              <primitive object={uniformMat} />
            </mesh>
            {/* Boots */}
            <mesh position={[0, -0.28, 0.05]} castShadow>
              <boxGeometry args={[0.15, 0.18, 0.24]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.75} metalness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Thighs */}
        {[-0.15, 0.15].map((x, i) => (
          <mesh key={i} position={[x, 1.12, 0.12]} castShadow rotation={[0.4, 0, 0]}>
            <boxGeometry args={[0.14, 0.44, 0.16]} />
            <primitive object={uniformMat} />
          </mesh>
        ))}

        {/* Torso */}
        <mesh position={[0, 1.72, -0.08]} castShadow rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[0.44, 0.56, 0.34]} />
          <primitive object={uniformMat} />
        </mesh>

        {/* Chest branding patch */}
        <mesh position={[0, 1.82, 0.1]} rotation={[-0.18, 0, 0]}>
          <boxGeometry args={[0.22, 0.14, 0.005]} />
          <primitive object={glowDecalMat} />
        </mesh>

        {/* Upper arms */}
        {[-0.3, 0.3].map((x, i) => (
          <group key={i} position={[x, 1.78, 0.16]} rotation={[0.3, 0, i === 0 ? 0.4 : -0.4]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.065, 0.42, 10]} />
              <primitive object={uniformMat} />
            </mesh>
          </group>
        ))}

        {/* Forearms pointing to handlebar */}
        {[-0.3, 0.3].map((x, i) => (
          <group key={i} position={[x, 1.58, 0.65]} rotation={[-0.9, 0, i === 0 ? 0.15 : -0.15]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.055, 0.05, 0.38, 8]} />
              <primitive object={uniformMat} />
            </mesh>
            {/* Gloves */}
            <mesh position={[0, 0.22, 0]} castShadow>
              <sphereGeometry args={[0.075, 8, 8]} />
              <meshStandardMaterial color="#111111" roughness={0.7} metalness={0.05} />
            </mesh>
          </group>
        ))}

        {/* Neck */}
        <mesh position={[0, 2.0, -0.02]} castShadow>
          <cylinderGeometry args={[0.072, 0.08, 0.18, 10]} />
          <meshStandardMaterial color="#c8a882" roughness={0.82} metalness={0} />
        </mesh>

        {/* === HELMET === */}
        <group position={[0, 2.18, -0.04]}>
          {/* Shell */}
          <mesh castShadow>
            <sphereGeometry args={[0.235, 20, 16]} />
            <primitive object={helmetMat} />
          </mesh>
          {/* Visor */}
          <mesh position={[0, -0.02, 0.18]} rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[0.34, 0.14, 0.08]} />
            <meshPhysicalMaterial
              color="#1a2a3a"
              roughness={0.02} metalness={0}
              transmission={0.55}
              opacity={0.75}
              transparent
              envMapIntensity={2.5}
            />
          </mesh>
          {/* Chin guard */}
          <mesh position={[0, -0.12, 0.16]} castShadow>
            <boxGeometry args={[0.26, 0.1, 0.12]} />
            <primitive object={helmetMat} />
          </mesh>
          {/* Ventilation slots */}
          {[-0.08, 0.08].map((x, i) => (
            <mesh key={i} position={[x, 0.16, 0.2]}>
              <boxGeometry args={[0.06, 0.02, 0.025]} />
              <primitive object={darkMat} />
            </mesh>
          ))}
          {/* Reflective strip on back */}
          <mesh position={[0, 0, -0.22]}>
            <boxGeometry args={[0.18, 0.04, 0.008]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} roughness={0.8} />
          </mesh>
        </group>
      </group>
    </group>
  );
});

DeliveryBike.displayName = 'DeliveryBike';
export default DeliveryBike;
