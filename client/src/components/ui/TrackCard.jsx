import { usePlayer } from '../../context/PlayerContext';
import { FiPlay, FiPause } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './TrackCard.css';

export default function TrackCard({ track, trackList, index }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const isActive = currentTrack?.id === track.id;
  const cover = track.album?.cover_big || track.album?.cover_medium || track.album?.cover || '';

  const handleClick = () => {
    if (isActive) {
      togglePlay();
    } else {
      playTrack(track, trackList, index);
    }
  };

  return (
    <div className={`track-card ${isActive ? 'active' : ''}`} id={`track-card-${track.id}`}>
      <div className="track-card-cover" onClick={handleClick}>
        {cover && <img src={cover} alt={track.title} loading="lazy" />}
        <div className="track-card-overlay">
          <button className="track-card-play">
            {isActive && isPlaying ? <FiPause /> : <FiPlay style={{ marginLeft: '2px' }} />}
          </button>
        </div>
      </div>
      <div className="track-card-info">
        <div className="track-card-name" title={track.title}>{track.title}</div>
        <Link to={`/artist/${track.artist?.id}`} className="track-card-artist" onClick={e => e.stopPropagation()}>
          {track.artist?.name}
        </Link>
      </div>
    </div>
  );
}
