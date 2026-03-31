import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { addToHistory } from '../utils/helpers';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0); // 0=off, 1=all, 2=one

  const audio = audioRef.current;

  // Update progress
  useEffect(() => {
    const update = () => setProgress(audio.currentTime);
    const onDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeat === 2) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [repeat, queue, queueIndex]);

  // Volume
  useEffect(() => {
    audio.volume = volume;
  }, [volume]);

  const playTrack = useCallback((track, trackList = null, index = -1) => {
    if (!track?.preview) return;

    setCurrentTrack(track);
    audio.src = track.preview;
    audio.play().catch(() => {});

    addToHistory(track);

    if (trackList) {
      setQueue(trackList);
      setQueueIndex(index >= 0 ? index : trackList.findIndex(t => t.id === track.id));
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [currentTrack, isPlaying]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
      if (nextIdx >= queue.length) {
        if (repeat === 1) nextIdx = 0;
        else return;
      }
    }
    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      setQueueIndex(nextIdx);
      setCurrentTrack(nextTrack);
      audio.src = nextTrack.preview;
      audio.play().catch(() => {});
      addToHistory(nextTrack);
    }
  }, [queue, queueIndex, shuffle, repeat]);

  const playPrev = useCallback(() => {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      if (repeat === 1) prevIdx = queue.length - 1;
      else { audio.currentTime = 0; return; }
    }
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      setQueueIndex(prevIdx);
      setCurrentTrack(prevTrack);
      audio.src = prevTrack.preview;
      audio.play().catch(() => {});
      addToHistory(prevTrack);
    }
  }, [queue, queueIndex, repeat]);

  const seek = useCallback((time) => {
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(s => !s), []);
  const toggleRepeat = useCallback(() => setRepeat(r => (r + 1) % 3), []);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      progress,
      duration,
      volume,
      shuffle,
      repeat,
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      seek,
      setVolume,
      toggleShuffle,
      toggleRepeat,
      setQueue,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};
