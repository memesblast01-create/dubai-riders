import { create } from 'zustand';
import * as THREE from 'three';

interface SceneStore {
  // Scroll state
  scrollY: number;
  scrollProgress: number;
  currentSection: number;
  sectionProgress: number;

  // Transition state
  transitionT: number;          // 0–1 within current transition
  fromBrand: number;
  toBrand: number;
  isTransitioning: boolean;

  // Parking sequence
  parkingPhase: 'inactive' | 'arriving' | 'parked' | 'headlights' | 'flash' | 'contact';

  // Contact
  contactVisible: boolean;

  // Actions
  setScroll: (y: number, maxY: number) => void;
  setParkingPhase: (phase: SceneStore['parkingPhase']) => void;
  setContactVisible: (v: boolean) => void;
}

const SECTIONS_PER_BRAND = 2; // 1 section display + 1 section transition

export const useSceneStore = create<SceneStore>((set, get) => ({
  scrollY: 0,
  scrollProgress: 0,
  currentSection: 0,
  sectionProgress: 0,
  transitionT: 0,
  fromBrand: 0,
  toBrand: 0,
  isTransitioning: false,
  parkingPhase: 'inactive',
  contactVisible: false,

  setScroll: (y, maxY) => {
    const scrollProgress = y / maxY;
    const totalScrollSections = 10; // 10 virtual sections
    const rawSection = (scrollProgress * totalScrollSections);
    const currentSection = Math.floor(rawSection);
    const sectionProgress = rawSection - currentSection;

    // Determine brand state
    // Sections:
    // 0 = Talabat display
    // 1 = Talabat → Noon transition
    // 2 = Noon display
    // 3 = Noon → Careem transition
    // 4 = Careem display
    // 5 = Careem → Keeta transition
    // 6 = Keeta display
    // 7 = Keeta → Parking transition
    // 8 = Parking lot
    // 9 = Contact

    let fromBrand = 0;
    let toBrand = 0;
    let transitionT = 0;
    let isTransitioning = false;

    if (currentSection === 0) { fromBrand = 0; toBrand = 0; transitionT = 0; }
    else if (currentSection === 1) { fromBrand = 0; toBrand = 1; transitionT = sectionProgress; isTransitioning = true; }
    else if (currentSection === 2) { fromBrand = 1; toBrand = 1; transitionT = 1; }
    else if (currentSection === 3) { fromBrand = 1; toBrand = 2; transitionT = sectionProgress; isTransitioning = true; }
    else if (currentSection === 4) { fromBrand = 2; toBrand = 2; transitionT = 1; }
    else if (currentSection === 5) { fromBrand = 2; toBrand = 3; transitionT = sectionProgress; isTransitioning = true; }
    else if (currentSection === 6) { fromBrand = 3; toBrand = 3; transitionT = 1; }
    else if (currentSection >= 7) { fromBrand = 3; toBrand = 3; transitionT = 1; }

    set({
      scrollY: y,
      scrollProgress,
      currentSection,
      sectionProgress,
      fromBrand,
      toBrand,
      transitionT,
      isTransitioning,
    });
  },

  setParkingPhase: (phase) => set({ parkingPhase: phase }),
  setContactVisible: (v) => set({ contactVisible: v }),
}));
