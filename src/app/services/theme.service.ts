import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const current = this.theme();
      localStorage.setItem('tms-theme', current);
      if (current === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
      }
    });
  }

  toggleTheme() {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }

  private getInitialTheme(): ThemeMode {
    const saved = localStorage.getItem('tms-theme') as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') return saved;
    // Default to sleek dark mode for maximum aesthetic appeal
    return 'dark';
  }
}
