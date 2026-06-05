import gsap from 'gsap';
import * as THREE from 'three';

// Easing curves
export const EASE = {
  smooth: 'power3.inOut',
  snap: 'power4.out',
  elastic: 'elastic.out(1, 0.5)',
  cinematic: 'expo.inOut',
  enter: 'power2.out',
  exit: 'power2.in',
};

// Lerp a THREE.Color with gsap-like progress
export function lerpColor(
  from: string,
  to: string,
  t: number
): THREE.Color {
  const a = new THREE.Color(from);
  const b = new THREE.Color(to);
  return a.lerp(b, smoothstep(t));
}

// Smoothstep interpolation
export function smoothstep(x: number): number {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

// Cubic smoothstep (smoother)
export function smootherstep(x: number): number {
  x = Math.max(0, Math.min(1, x));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

// Remap value from one range to another
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

// Clamp
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Extract t within a sub-range
export function rangeT(t: number, start: number, end: number): number {
  return clamp(remap(t, start, end, 0, 1), 0, 1);
}

// Animate Three.js object position
export function animateToPosition(
  obj: THREE.Object3D,
  target: [number, number, number],
  duration = 1.2,
  ease = EASE.cinematic
) {
  return gsap.to(obj.position, {
    x: target[0], y: target[1], z: target[2],
    duration, ease,
  });
}

// Animate camera
export function animateCamera(
  camera: THREE.PerspectiveCamera,
  targetPos: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  duration = 2.0,
  ease = EASE.smooth
) {
  const tl = gsap.timeline();
  tl.to(camera.position, {
    x: targetPos.x, y: targetPos.y, z: targetPos.z,
    duration, ease,
  }, 0);
  return tl;
}

// Float animation for idle state
export function createFloatAnimation(obj: THREE.Object3D, amplitude = 0.04, speed = 0.8) {
  return gsap.to(obj.position, {
    y: `+=${amplitude}`,
    duration: speed,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });
}

// Breathing animation for rider
export function createBreathingAnimation(obj: THREE.Object3D) {
  return gsap.to(obj.scale, {
    y: 1.012,
    duration: 2.2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
  });
}

// Camera idle sway
export function createCameraSway(
  camera: THREE.Camera,
  intensity = 0.015
) {
  const tl = gsap.timeline({ repeat: -1, yoyo: true });
  tl.to(camera.position, {
    x: `+=${intensity}`,
    y: `+=${intensity * 0.5}`,
    duration: 3.5,
    ease: 'sine.inOut',
  });
  tl.to(camera.position, {
    x: `-=${intensity * 2}`,
    y: `-=${intensity * 0.3}`,
    duration: 4.2,
    ease: 'sine.inOut',
  });
  return tl;
}

// Section enter animations for text content
export function animateSectionEnter(elements: Element[]) {
  return gsap.fromTo(elements,
    { opacity: 0, y: 40, filter: 'blur(6px)' },
    {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 1.1,
      ease: EASE.enter,
      stagger: 0.12,
    }
  );
}

export function animateSectionExit(elements: Element[]) {
  return gsap.to(elements, {
    opacity: 0, y: -30, filter: 'blur(4px)',
    duration: 0.7,
    ease: EASE.exit,
    stagger: 0.06,
  });
}

// Flash effect
export function createFlashSequence(
  overlay: HTMLElement,
  onComplete: () => void
) {
  const tl = gsap.timeline({ onComplete });
  tl.to(overlay, { opacity: 1, duration: 0.3, ease: 'power4.in' });
  tl.to(overlay, { opacity: 0, duration: 2.5, ease: 'power1.out', delay: 0.3 });
  return tl;
}
