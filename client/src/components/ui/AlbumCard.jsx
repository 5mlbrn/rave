import { usePlayer } from '../../context/PlayerContext';
import { FiPlay, FiPause } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './AlbumCard.css';

export default function AlbumCard({ album }) {
  const cover = album.cover_big || album.cover_medium || album.cover || '';

  return (
    <Link to={`/album/${album.id}`} className="album-card" id={`album-card-${album.id}`}>
      <div className="album-card-cover">
        {cover && <img src={cover} alt={album.title} loading="lazy" />}
        <div className="album-card-overlay">
          <div className="album-card-play">
            <FiPlay style={{ marginLeft: '2px' }} />
          </div>
        </div>
      </div>
      <div className="album-card-info">
        <div className="album-card-title" title={album.title}>{album.title}</div>
        {album.artist && (
          <div className="album-card-artist">{album.artist.name}</div>
        )}
      </div>
    </Link>
  );
}
