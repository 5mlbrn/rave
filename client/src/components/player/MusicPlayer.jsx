import { usePlayer } from '../../context/PlayerContext';
import { formatDuration, isLiked, toggleLike } from '../../utils/helpers';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiRepeat, FiShuffle, FiHeart } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MusicPlayer.css';

export default function MusicPlayer() {
  const {
    currentTrack, isPlaying, progress, duration, volume,
    shuffle, repeat, togglePlay, playNext, playPrev,
    seek, setVolume, toggleShuffle, toggleRepeat
  } = usePlayer();

  const [liked, setLiked] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  useEffect(() => {
    if (currentTrack) setLiked(isLiked(currentTrack.id));
  }, [currentTrack]);

  const handleLike = () => {
    if (!currentTrack) return;
    toggleLike(currentTrack);
    setLiked(!liked);
  };

  const handleSeek = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  const handleVolume = (e) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(pct);
  };

  if (!currentTrack) {
    return (
      <div className="player player-empty" id="music-player">
        <div className="player-inner">
          <div className="player-empty-text">Select a song to start listening</div>
        </div>
      </div>
    );
  }

  const coverImg = currentTrack.album?.cover_big || currentTrack.album?.cover_medium || currentTrack.album?.cover_small || '';
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="player" id="music-player">
      {/* Progress bar at top of player */}
      <div className="player-progress-top" onClick={handleSeek}>
        <div className="player-progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="player-inner">
        {/* Left: Track Info */}
        <div className="player-track-info">
          <div className={`player-cover ${isPlaying ? 'spinning' : ''}`}>
            {coverImg && <img src={coverImg} alt={currentTrack.title} />}
          </div>
          <div className="player-track-details">
            <div className="player-track-name">{currentTrack.title}</div>
            <Link 
              to={`/artist/${currentTrack.artist?.id}`}
              className="player-track-artist"
            >
              {currentTrack.artist?.name}
            </Link>
          </div>
          <button
            className={`player-like-btn ${liked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <FiHeart />
          </button>
        </div>

        {/* Center: Controls */}
        <div className="player-controls">
          <button
            className={`player-ctrl-btn ${shuffle ? 'active' : ''}`}
            onClick={toggleShuffle}
            aria-label="Shuffle"
          >
            <FiShuffle />
          </button>
          <button className="player-ctrl-btn" onClick={playPrev} aria-label="Previous">
            <FiSkipBack />
          </button>
          <button className="player-play-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
          </button>
          <button className="player-ctrl-btn" onClick={playNext} aria-label="Next">
            <FiSkipForward />
          </button>
          <button
            className={`player-ctrl-btn ${repeat > 0 ? 'active' : ''}`}
            onClick={toggleRepeat}
            aria-label="Repeat"
          >
            <FiRepeat />
            {repeat === 2 && <span className="repeat-one">1</span>}
          </button>
        </div>

        {/* Right: Time + Volume */}
        <div className="player-right">
          <div className="player-time">
            <span>{formatDuration(progress)}</span>
            <span className="time-sep">/</span>
            <span>{formatDuration(duration)}</span>
          </div>
          <div className="player-volume-wrapper"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
          >
            <button
              className="player-ctrl-btn"
              onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
              aria-label="Volume"
            >
              {volume > 0 ? <FiVolume2 /> : <FiVolumeX />}
            </button>
            <div className={`player-volume-bar-wrapper ${showVolume ? 'show' : ''}`}>
              <div className="player-volume-bar" onClick={handleVolume}>
                <div className="player-volume-fill" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
