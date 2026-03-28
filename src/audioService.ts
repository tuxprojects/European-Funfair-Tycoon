import { ParkSettings } from './types';

class AudioService {
  private music: HTMLAudioElement | null = null;
  private sfx: Map<string, HTMLAudioElement> = new Map();
  private settings: { musicVolume: number; sfxVolume: number } = { musicVolume: 0.5, sfxVolume: 0.7 };

  constructor() {
    if (typeof window !== 'undefined') {
      this.music = new Audio('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13d6935.mp3?filename=happy-funny-kids-11442.mp3');
      this.music.loop = true;
    }
  }

  updateSettings(settings: { musicVolume: number; sfxVolume: number }) {
    this.settings = settings;
    if (this.music) {
      this.music.volume = settings.musicVolume;
      if (settings.musicVolume > 0) {
        this.music.play().catch(() => {}); // Autoplay might be blocked
      } else {
        this.music.pause();
      }
    }
  }

  playSFX(name: string) {
    if (this.settings.sfxVolume <= 0) return;

    let audio = this.sfx.get(name);
    if (!audio) {
      const url = this.getSFXUrl(name);
      if (url) {
        audio = new Audio(url);
        this.sfx.set(name, audio);
      }
    }

    if (audio) {
      audio.volume = this.settings.sfxVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }

  private getSFXUrl(name: string): string | null {
    const urls: Record<string, string> = {
      'click': 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73456.mp3?filename=click-button-140881.mp3',
      'buy': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=cash-register-purchase-6451.mp3',
      'place': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3523e58c5.mp3?filename=construction-site-7117.mp3',
      'sell': 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=cash-register-purchase-6451.mp3',
      'error': 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c3523e58c5.mp3?filename=error-126627.mp3',
    };
    return urls[name] || null;
  }
}

export const audioService = new AudioService();
