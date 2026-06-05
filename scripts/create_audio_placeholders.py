"""
Dubai Riders — Audio Placeholder Generator
Creates silent MP3 placeholder files so the app doesn't crash without real audio.
Replace these with real motorcycle audio assets for production.

Recommended royalty-free sources:
- Freesound.org (CC licensed)
- Zapsplat.com
- BBC Sound Effects Library

Required files:
  public/audio/city_ambient.mp3   — Nighttime city ambience (loop)
  public/audio/bike_idle.mp3      — Motorcycle engine idle (loop)
  public/audio/bike_rev.mp3       — Engine rev / acceleration (one-shot)
  public/audio/headlight_click.mp3 — Electrical click sound
  public/audio/engine_start.mp3   — Engine ignition sequence
  public/audio/wind.mp3           — Wind ambience (loop)
"""

import os
import struct
import wave

AUDIO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

def create_silent_wav(filepath, duration_sec=3.0, sample_rate=44100):
    """Create a silent WAV file as placeholder."""
    n_samples = int(duration_sec * sample_rate)
    with wave.open(filepath.replace('.mp3', '.wav'), 'w') as f:
        f.setnchannels(2)  # stereo
        f.setsampwidth(2)  # 16-bit
        f.setframerate(sample_rate)
        f.writeframes(b'\x00' * n_samples * 4)  # 2 channels × 2 bytes
    print(f"  Created: {os.path.basename(filepath.replace('.mp3', '.wav'))}")

AUDIO_FILES = {
    'city_ambient.mp3': 10.0,
    'bike_idle.mp3': 4.0,
    'bike_rev.mp3': 2.5,
    'headlight_click.mp3': 0.3,
    'engine_start.mp3': 3.5,
    'wind.mp3': 8.0,
}

print("\nDubai Riders — Audio Placeholders")
print("-" * 40)
print("Creating silent WAV placeholders...")
print("Replace these with real motorcycle sounds for production.\n")

for filename, duration in AUDIO_FILES.items():
    fp = os.path.join(AUDIO_DIR, filename)
    create_silent_wav(fp, duration)

print("\nDone. Audio placeholder files created.")
print(f"Directory: {AUDIO_DIR}")
print("\nReplace with real assets from:")
print("  → freesound.org (search: motorcycle engine idle, city night ambience)")
print("  → zapsplat.com  (motorcycle rev, headlight startup)")
