import { Link } from 'react-router-dom';
import './ArtistCard.css';

export default function ArtistCard({ artist }) {
  const img = artist.picture_xl || artist.picture_medium || artist.picture || '';
  return (
    <Link to={`/artist/${artist.id}`} className="artist-card" id={`artist-card-${artist.id}`}>
      <div className="artist-card-img">
        {img && <img src={img} alt={artist.name} loading="lazy" />}
      </div>
      <div className="artist-card-name">{artist.name}</div>
    </Link>
  );
}
