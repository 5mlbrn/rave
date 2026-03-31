import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getArtist, getArtistTop, getArtistAlbums, getArtistRelated } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/ui/TrackRow';
import AlbumCard from '../components/ui/AlbumCard';
import ArtistCard from '../components/ui/ArtistCard';
import { SkeletonRow, SkeletonCard, SkeletonArtist } from '../components/ui/SkeletonLoader';
import { formatNumber } from '../utils/helpers';
import { FiPlay, FiShuffle } from 'react-icons/fi';
import './ArtistPage.css';

export default function ArtistPage() {
  const { id } = useParams();
  const { playTrack } = usePlayer();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getArtist(id),
      getArtistTop(id, 10),
      getArtistAlbums(id, 12),
      getArtistRelated(id, 8),
    ]).then(([artistData, topData, albumsData, relatedData]) => {
      setArtist(artistData);
      setTopTracks(topData.data || []);
      setAlbums(albumsData.data || []);
      setRelated(relatedData.data || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, [id]);

  const handlePlayAll = () => {
    if (topTracks.length > 0) playTrack(topTracks[0], topTracks, 0);
  };

  const handleShuffle = () => {
    if (topTracks.length > 0) {
      const idx = Math.floor(Math.random() * topTracks.length);
      playTrack(topTracks[idx], topTracks, idx);
    }
  };

  return (
    <motion.div
      className="page artist-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Hero */}
      <div className="artist-hero" id="artist-hero">
        <div className="artist-hero-bg">
          {artist?.picture_xl && (
            <img src={artist.picture_xl} alt="" className="artist-hero-bg-img" />
          )}
          <div className="artist-hero-gradient" />
        </div>
        <div className="artist-hero-content">
          {loading ? (
            <div className="animate-shimmer" style={{ width: 200, height: 40, borderRadius: 8 }} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="artist-hero-label">ARTIST</span>
              <h1 className="artist-hero-name">{artist?.name}</h1>
              <p className="artist-hero-fans">
                {formatNumber(artist?.nb_fan)} followers
              </p>
              <div className="artist-hero-actions">
                <button className="btn btn-primary" onClick={handlePlayAll}>
                  <FiPlay /> Play
                </button>
                <button className="btn btn-secondary" onClick={handleShuffle}>
                  <FiShuffle /> Shuffle
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Top Tracks */}
      <section className="page-section">
        <div className="section-header"><h2>Popular Tracks</h2></div>
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : (
          <div className="track-list">
            {topTracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} trackList={topTracks} />
            ))}
          </div>
        )}
      </section>

      {/* Albums */}
      {albums.length > 0 && (
        <section className="page-section">
          <div className="section-header"><h2>Albums</h2></div>
          <div className="grid-cards">
            {albums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}

      {/* Related Artists */}
      {related.length > 0 && (
        <section className="page-section">
          <div className="section-header"><h2>Related Artists</h2></div>
          <div className="scroll-row">
            {related.map(a => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
