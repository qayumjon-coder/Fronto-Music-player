import { useEffect, useRef, useState } from "react";
import { useSettings } from "../contexts/SettingsContext";

export type RepeatMode = "off" | "one" | "all";

export function useAudioPlayer(songs: { url: string }[]) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");

  const { autoplay } = useSettings();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousVolumeRef = useRef(70);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // 1. Initialize Audio Element and Context
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    const setupContext = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;

        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioContextRef.current = ctx;
        analyserRef.current = analyser;
      } catch (e) {
        console.error("Audio Context Error:", e);
      }
    };

    setupContext();

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const val = (audio.currentTime / audio.duration) * 100;
      setProgress(isNaN(val) ? 0 : val);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.pause();
      audio.src = "";
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // 2. Safety: Keep index in bounds
  useEffect(() => {
    if (songs.length > 0 && index >= songs.length) {
      setIndex(songs.length - 1);
    }
  }, [songs.length, index]);

  // 3. Handle Source / Playback state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !songs.length || !songs[index]) return;

    const targetUrl = songs[index].url;

    // Check if we need to change source
    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
      audio.load();
    }

    if (playing) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Playback prevented:", error);
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [index, songs, playing]);

  // 4. Handle End of Track
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (autoplay || repeat === 'all') {
        if (songs.length > 1 || repeat === 'all') {
          setIndex(prev => (prev + 1) % songs.length);
          setPlaying(true);
        } else {
          setPlaying(false);
        }
      } else {
        setPlaying(false);
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [repeat, songs.length, autoplay]);

  // 5. Volume Sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Public Methods
  const play = async () => {
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    setPlaying(true);
  };

  const pause = () => setPlaying(false);

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolumeRef.current);
      setIsMuted(false);
    } else {
      previousVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const setVolume = (val: number) => {
    const v = Math.max(0, Math.min(100, val));
    setVolumeState(v);
    if (v > 0) setIsMuted(false);
  };

  const seek = (val: number) => {
    if (audioRef.current && isFinite(audioRef.current.duration)) {
      audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
    }
  };

  const next = () => {
    if (songs.length === 0) return;
    setIndex(prev => (prev + 1) % songs.length);
    setPlaying(true);
  };

  const prev = () => {
    if (songs.length === 0) return;
    setIndex(prev => (prev - 1 + songs.length) % songs.length);
    setPlaying(true);
  };

  return {
    index, playing, progress, volume, isMuted, currentTime, duration,
    shuffle, repeat, play, pause, next, prev, setVolume, toggleMute,
    seek, toggleShuffle: () => setShuffle(!shuffle),
    toggleRepeat: () => setRepeat(r => r === "off" ? "all" : r === "all" ? "one" : "off"),
    selectSong: (i: number) => { setIndex(i); setPlaying(true); },
    analyser: analyserRef.current
  };
}
