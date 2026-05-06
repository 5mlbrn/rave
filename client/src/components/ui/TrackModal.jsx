import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlay, FiPause, FiHeart, FiShare2, FiExternalLink } from 'react-icons/fi';
import { usePlayer } from '../../context/PlayerContext';
import { Link } from 'react-router-dom';
import './TrackModal.css';

export default function TrackModal({ track, trackList, index, onClose }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const overlayRef = useRef(null);

  const isActive = currentTrack?.id === track?.id;
  const cover =
    track?.album?.cover_big ||
    track?.album?.cover_medium ||
    track?.album?.cover ||
    '';

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track, trackList, index);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="track-modal-overlay"
        ref={overlayRef}
        onClick={handleOverlayClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="track-modal"
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Close button */}
          <button className="track-modal-close" onClick={onClose} aria-label="Close">
            <FiX />
          </button>

          {/* Album Art */}
          <div className="track-modal-art-wrap">
            {cover && (
              <img
                src={cover}
                alt={track.title}
                className="track-modal-art"
              />
            )}
            <div
              className="track-modal-art-blur"
              style={{ backgroundImage: cover ? `url(${cover})` : 'none' }}
            />
          </div>

          {/* Info */}
          <div className="track-modal-info">
            <div className="track-modal-meta">
              {track.album?.title && (
                <span className="track-modal-album-label">
                  {track.album.title}
                </span>
              )}
            </div>

            <h2 className="track-modal-title">{track.title}</h2>

            <Link
              to={`/artist/${track.artist?.id}`}
              className="track-modal-artist"
              onClick={onClose}
            >
              {track.artist?.name}
            </Link>

            {/* Stats row */}
            <div className="track-modal-stats">
              {track.duration && (
                <span className="track-modal-stat">
                  🕐 {formatDuration(track.duration)}
                </span>
              )}
              {track.rank && (
                <span className="track-modal-stat">
                  📈 #{Math.floor(track.rank / 1000)}k rank
                </span>
              )}
              {track.explicit_lyrics && (
                <span className="track-modal-stat track-modal-explicit">E</span>
              )}
            </div>

            {/* Controls */}
            <div className="track-modal-controls">
              <button className="track-modal-btn-secondary" aria-label="Like">
                <FiHeart />
              </button>

              <button
                className="track-modal-play-btn"
                onClick={handlePlay}
                aria-label={isActive && isPlaying ? 'Pause' : 'Play'}
              >
                {isActive && isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '3px' }} />}
              </button>

              <button className="track-modal-btn-secondary" aria-label="Share">
                <FiShare2 />
              </button>
            </div>

            {/* Album link */}
            {track.album?.id && (
              <Link
                to={`/album/${track.album.id}`}
                className="track-modal-album-link"
                onClick={onClose}
              >
                <FiExternalLink size={13} /> View Album
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
