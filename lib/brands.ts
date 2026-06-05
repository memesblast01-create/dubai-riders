import { BrandConfig } from '@/types';

export const BRANDS: BrandConfig[] = [
  {
    key: 'talabat',
    name: 'TALABAT',
    primaryColor: '#FF5200',
    secondaryColor: '#FF7A33',
    envColor: '#1a0800',
    fogColor: '#2a0c00',
    fogDensity: 0.035,
    bikePosition: [-3.5, 0, 0],
    textSide: 'right',
    bikeRotation: 0.25,
    headlightTarget: [6, 1.5, 0],
    description: 'Born in Dubai. Raised on speed. Talabat has been threading through the city\'s veins since before the skyline dreamed this high — every order a promise, every rider a legend.',
    stats: [
      { label: 'Daily Orders', value: '50K+' },
      { label: 'Avg Delivery', value: '18min' },
      { label: 'Cities', value: '9' },
    ],
  },
  {
    key: 'noon',
    name: 'NOON',
    primaryColor: '#F5C518',
    secondaryColor: '#FFD700',
    envColor: '#0f0c00',
    fogColor: '#1a1200',
    fogDensity: 0.032,
    bikePosition: [3.5, 0, 0],
    textSide: 'left',
    bikeRotation: -0.25,
    headlightTarget: [-6, 1.5, 0],
    description: 'When the sun peaks and commerce accelerates, Noon delivers without compromise. The Arab world\'s premier marketplace, now commanding two wheels with the same relentless precision.',
    stats: [
      { label: 'Products', value: '1M+' },
      { label: 'Express Drop', value: '2hr' },
      { label: 'Sellers', value: '10K+' },
    ],
  },
  {
    key: 'careem',
    name: 'CAREEM',
    primaryColor: '#1DBF73',
    secondaryColor: '#25D366',
    envColor: '#001208',
    fogColor: '#001a0c',
    fogDensity: 0.03,
    bikePosition: [-3.5, 0, 0],
    textSide: 'right',
    bikeRotation: 0.25,
    headlightTarget: [6, 1.5, 0],
    description: 'From a single ride-hailing app to the region\'s super platform, Careem redefined what movement means. Green machines threading urban arteries — always precise, always on time.',
    stats: [
      { label: 'MENA Cities', value: '20+' },
      { label: 'On-Time Rate', value: '99.2%' },
      { label: 'Captains', value: '2.5M' },
    ],
  },
  {
    key: 'keeta',
    name: 'KEETA',
    primaryColor: '#F0A500',
    secondaryColor: '#FFCC55',
    envColor: '#100900',
    fogColor: '#1a1100',
    fogDensity: 0.038,
    bikePosition: [3.5, 0, 0],
    textSide: 'left',
    bikeRotation: -0.25,
    headlightTarget: [-6, 1.5, 0],
    description: 'The newest force on Dubai\'s streets — Keeta doesn\'t follow routes, it rewrites them. Born from ambition, engineered for velocity. Fifteen minutes or it never happened.',
    stats: [
      { label: 'Guarantee', value: '15min' },
      { label: 'Availability', value: '24/7' },
      { label: 'Coverage', value: '100%' },
    ],
  },
];

export const SECTION_COUNT = 5; // 4 brands + parking

export const CAMERA_CONFIGS = {
  talabat: {
    position: [-1.5, 2.2, 8.5] as [number, number, number],
    target: [-2, 1, 0] as [number, number, number],
    fov: 52,
  },
  noon: {
    position: [1.5, 2.2, 8.5] as [number, number, number],
    target: [2, 1, 0] as [number, number, number],
    fov: 52,
  },
  careem: {
    position: [-1.5, 2.2, 8.5] as [number, number, number],
    target: [-2, 1, 0] as [number, number, number],
    fov: 52,
  },
  keeta: {
    position: [1.5, 2.2, 8.5] as [number, number, number],
    target: [2, 1, 0] as [number, number, number],
    fov: 52,
  },
  parking: {
    position: [0, 4.5, 13] as [number, number, number],
    target: [0, 1, -2] as [number, number, number],
    fov: 58,
  },
};
