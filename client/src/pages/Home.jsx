import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getHome } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/ui/TrackCard';
import ArtistCard from '../components/ui/ArtistCard';
import AlbumCard from '../components/ui/AlbumCard';
import TrackRow from '../components/ui/TrackRow';
import { SkeletonCard, SkeletonRow, SkeletonArtist } from '../components/ui/SkeletonLoader';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { FiPlay, FiShuffle } from 'react-icons/fi';
import './Home.css';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

function Section({ title, children, delay = 0 }) {
  const [ref, isVisible] = useScrollAnimation(0.1);
  return (
    <motion.section
      ref={ref}
      className="page-section"
      initial={{ opacity: 0, y: 32 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="section-header">
        <h2>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    getHome()
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const trending = data?.trending || [];
  const newReleases = data?.newReleases || [];
  const artists = data?.artists || [];
  const heroTracks = data?.heroTracks || [];
  const heroArtist = data?.heroArtist;
  const allTracks = trending.length > 0 ? trending : heroTracks;

  const handlePlayAll = () => {
    if (allTracks.length > 0) {
      playTrack(allTracks[0], allTracks, 0);
    }
  };

  const handleShuffle = () => {
    if (allTracks.length > 0) {
      const idx = Math.floor(Math.random() * allTracks.length);
      playTrack(allTracks[idx], allTracks, idx);
    }
  };

  const heroCover = heroTracks[0]?.album?.cover_big || heroArtist?.picture_xl || '';

  return (
    <motion.div className="page home-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {/* Hero Banner */}
      <section className="home-hero" id="home-hero">
        <div className="home-hero-bg">
          {heroCover && (
            <img src={heroCover} alt="" className="home-hero-bg-img" />
          )}
          <div className="home-hero-gradient" />
        </div>
        <div className="home-hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="home-hero-label">FEATURED PLAYLIST</span>
            <h1 className="home-hero-title">
              Today's Top <span className="text-pink">Hits</span>
            </h1>
            <p className="home-hero-desc">
              The hottest tracks right now. Discover new music and trending songs from top artists.
            </p>
            <div className="home-hero-actions">
              <button className="btn btn-primary" onClick={handlePlayAll}>
                <FiPlay /> Play Now
              </button>
              <button className="btn btn-secondary" onClick={handleShuffle}>
                <FiShuffle /> Shuffle
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Now */}
      <Section title="Trending Now">
        {loading ? (
          <div className="scroll-row">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="scroll-row">
            {allTracks.slice(0, 10).map((track, i) => (
              <TrackCard key={track.id} track={track} trackList={allTracks} index={i} />
            ))}
          </div>
        )}
      </Section>

      {/* Top Tracks List */}
      <Section title="Top Charts" delay={0.1}>
        {loading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : (
          <div className="track-list">
            {allTracks.slice(0, 8).map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} trackList={allTracks} />
            ))}
          </div>
        )}
      </Section>

      {/* Popular Artists */}
      <Section title="Popular Artists" delay={0.15}>
        {loading ? (
          <div className="scroll-row">
            {[...Array(6)].map((_, i) => <SkeletonArtist key={i} />)}
          </div>
        ) : (
          <div className="scroll-row">
            {artists.map(artist => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </Section>

      {/* New Releases */}
      {newReleases.length > 0 && (
        <Section title="New Releases" delay={0.2}>
          <div className="grid-cards">
            {newReleases.slice(0, 12).map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </Section>
      )}

      {/* Made For You — use remaining trending tracks */}
      {allTracks.length > 10 && (
        <Section title="Made For You" delay={0.25}>
          <div className="scroll-row">
            {allTracks.slice(10, 20).map((track, i) => (
              <TrackCard key={track.id} track={track} trackList={allTracks} index={i + 10} />
            ))}
          </div>
        </Section>
      )}
    </motion.div>
  );
}
