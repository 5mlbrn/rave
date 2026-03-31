import { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration, isLiked, toggleLike } from '../../utils/helpers';
import { FiPlay, FiPause, FiHeart, FiMoreHorizontal } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TrackMenu from './TrackMenu';
import './TrackRow.css';

export default function TrackRow({ track, index, trackList }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [liked, setLiked] = useState(isLiked(track.id));
  const [showMenu, setShowMenu] = useState(false);
  const isActive = currentTrack?.id === track.id;
  const cover = track.album?.cover_small || track.album?.cover_medium || '';

  const handleClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track, trackList, index);
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(track);
    setLiked(!liked);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div
      className={`track-row ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      id={`track-row-${track.id}`}
    >
      <div className="track-num">
        {isActive && isPlaying ? (
          <div className="music-waves">
            <span /><span /><span />
          </div>
        ) : (
          <span className="track-num-text">{index + 1}</span>
        )}
        <span className="track-num-play">
          {isActive && isPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
        </span>
      </div>
      <div className="track-info">
        <div className="track-thumb">
          {cover && <img src={cover} alt="" />}
        </div>
        <div className="track-details">
          <div className="track-name">{track.title}</div>
          <Link
            to={`/artist/${track.artist?.id}`}
            className="track-artist"
            onClick={e => e.stopPropagation()}
          >
            {track.artist?.name}
          </Link>
        </div>
      </div>
      <div className="track-album">
        {track.album?.title && (
          <Link
            to={`/album/${track.album?.id}`}
            onClick={e => e.stopPropagation()}
            className="track-album-link"
          >
            {track.album.title}
          </Link>
        )}
      </div>
      <div className="track-row-actions">
        <button
          className={`track-row-like ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <FiHeart size={14} />
        </button>
        <span className="track-duration">{formatDuration(track.duration)}</span>
        <div className="track-menu-wrapper">
          <button
            className="track-row-more"
            onClick={handleMenuToggle}
            aria-label="More options"
          >
            <FiMoreHorizontal size={16} />
          </button>
          {showMenu && (
            <TrackMenu track={track} onClose={() => setShowMenu(false)} />
          )}
        </div>
      </div>
    </div>
  );
}
