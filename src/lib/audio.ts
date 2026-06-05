'use client';

import { Howl, Howler } from 'howler';

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private initialized = false;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) AudioManager.instance = new AudioManager();
    return AudioManager.instance;
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;
    Howler.volume(0.6);

    // Ambient city background
    this.sounds.set('city', new Howl({
      src: ['/audio/city_ambient.mp3'],
      loop: true, volume: 0.15, autoplay: false,
      html5: true,
    }));

    // Bike idle
    this.sounds.set('idle', new Howl({
      src: ['/audio/bike_idle.mp3'],
      loop: true, volume: 0, autoplay: false,
      html5: true,
    }));

    // Engine rev / acceleration
    this.sounds.set('rev', new Howl({
      src: ['/audio/bike_rev.mp3'],
      loop: false, volume: 0.4,
    }));

    // Headlight click
    this.sounds.set('click', new Howl({
      src: ['/audio/headlight_click.mp3'],
      loop: false, volume: 0.5,
    }));

    // Final ignition
    this.sounds.set('ignition', new Howl({
      src: ['/audio/engine_start.mp3'],
      loop: false, volume: 0.7,
    }));

    // Wind
    this.sounds.set('wind', new Howl({
      src: ['/audio/wind.mp3'],
      loop: true, volume: 0.08,
    }));
  }

  startAmbient() {
    this.play('city');
    this.play('wind');
  }

  startIdle() {
    const idle = this.sounds.get('idle');
    if (idle) {
      idle.play();
      idle.fade(0, 0.3, 800);
    }
  }

  stopIdle() {
    const idle = this.sounds.get('idle');
    if (idle) idle.fade(0.3, 0, 500);
  }

  playRev() { this.play('rev'); }
  playHeadlightClick() { this.play('click'); }
  playIgnition() { this.play('ignition'); }

  setIdleVolume(v: number) {
    const idle = this.sounds.get('idle');
    if (idle) idle.volume(Math.max(0, Math.min(1, v)));
  }

  private play(key: string) {
    const s = this.sounds.get(key);
    if (s && !s.playing()) s.play();
  }

  stopAll() {
    this.sounds.forEach(s => s.stop());
  }

  setMasterVolume(v: number) {
    Howler.volume(v);
  }
}

export const audioManager = AudioManager.getInstance();
