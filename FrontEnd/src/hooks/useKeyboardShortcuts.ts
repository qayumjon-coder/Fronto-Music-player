import { useEffect } from 'react';

interface ShortcutHandlers {
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onMute: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
}

/**
 * Global keyboard shortcuts for the music player.
 * Only fires when the user is NOT focused on an input/textarea.
 */
export function useKeyboardShortcuts({
  onPlayPause,
  onNext,
  onPrev,
  onMute,
  onVolumeUp,
  onVolumeDown,
}: ShortcutHandlers) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea/select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrev();
          break;
        case 'KeyM':
          onMute();
          break;
        case 'ArrowUp':
          e.preventDefault();
          onVolumeUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          onVolumeDown();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPlayPause, onNext, onPrev, onMute, onVolumeUp, onVolumeDown]);
}
