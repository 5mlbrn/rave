import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAlbum } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/ui/TrackRow';
import { SkeletonRow } from '../components/ui/SkeletonLoader';
import { formatDuration } from '../utils/helpers';
import { FiPlay, FiShuffle, FiClock } from 'react-icons/fi';
import './AlbumPage.css';

export default function AlbumPage() {
  const { id } = useParams();
  const { playTrack } = usePlayer();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAlbum(id)
      .then(data => setAlbum(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const tracks = album?.tracks?.data || [];

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      const enriched = tracks.map(t => ({
        ...t,
        album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium },
      }));
      playTrack(enriched[0], enriched, 0);
    }
  };

  const handleShuffle = () => {
    if (tracks.length > 0) {
      const enriched = tracks.map(t => ({
        ...t,
        album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium },
      }));
      const idx = Math.floor(Math.random() * enriched.length);
      playTrack(enriched[idx], enriched, idx);
    }
  };

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);

  return (
    <motion.div
      className="page album-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Album Header */}
      <div className="album-header" id="album-header">
        <div className="album-header-bg">
          {album?.cover_big && (
            <img src={album.cover_big} alt="" className="album-header-bg-img" />
          )}
          <div className="album-header-gradient" />
        </div>
        <div className="album-header-content">
          <motion.div
            className="album-cover-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {album?.cover_big && (
              <img src={album.cover_big} alt={album?.title} className="album-cover-img" />
            )}
          </motion.div>
          <motion.div
            className="album-meta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <span className="album-meta-label">ALBUM</span>
            <h1 className="album-meta-title">{album?.title || ''}</h1>
            {album?.artist && (
              <Link to={`/artist/${album.artist.id}`} className="album-meta-artist">
                {album.artist.name}
              </Link>
            )}
            <div className="album-meta-info">
              <span>{album?.release_date?.split('-')[0]}</span>
              <span className="dot">•</span>
              <span>{tracks.length} tracks</span>
              <span className="dot">•</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
            <div className="album-actions">
              <button className="btn btn-primary" onClick={handlePlayAll}>
                <FiPlay /> Play
              </button>
              <button className="btn btn-secondary" onClick={handleShuffle}>
                <FiShuffle /> Shuffle
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Track List */}
      <section className="page-section">
        <div className="track-list-header">
          <span className="tlh-num">#</span>
          <span className="tlh-title">Title</span>
          <span className="tlh-album" />
          <span className="tlh-duration"><FiClock size={14} /></span>
        </div>
        <div className="track-list">
          {loading ? (
            [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
          ) : (
            tracks.map((track, i) => {
              const enriched = {
                ...track,
                album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium },
              };
              return (
                <TrackRow
                  key={track.id}
                  track={enriched}
                  index={i}
                  trackList={tracks.map(t => ({
                    ...t,
                    album: { id: album.id, title: album.title, cover_small: album.cover_small, cover_medium: album.cover_medium },
                  }))}
                />
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
}
