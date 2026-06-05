import * as THREE from 'three';

export type BrandKey = 'talabat' | 'noon' | 'careem' | 'keeta';

export interface BrandConfig {
  key: BrandKey;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  envColor: string;
  fogColor: string;
  fogDensity: number;
  bikePosition: [number, number, number];
  textSide: 'left' | 'right';
  bikeRotation: number;
  headlightTarget: [number, number, number];
  description: string;
  stats: { label: string; value: string }[];
}

export interface BikeTransformState {
  paintColor: THREE.Color;
  boxColor: THREE.Color;
  uniformColor: THREE.Color;
  helmetColor: THREE.Color;
  emissiveIntensity: number;
  headlightIntensity: number;
}

export interface SceneState {
  currentSection: number;
  scrollProgress: number;
  transitionProgress: number;
  isTransitioning: boolean;
  parkingSequenceActive: boolean;
  flashActive: boolean;
  contactVisible: boolean;
}

export interface CameraState {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}
