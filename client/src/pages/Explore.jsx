import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGenres, search } from '../services/api';
import { Link } from 'react-router-dom';
import AlbumCard from '../components/ui/AlbumCard';
import ArtistCard from '../components/ui/ArtistCard';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import './Explore.css';

const GENRE_COLORS = [
  'linear-gradient(135deg, #FF2D78, #FF69B4)',
  'linear-gradient(135deg, #1B2444, #3D4F7A)',
  'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #06B6D4, #3B82F6)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #10B981, #3B82F6)',
  'linear-gradient(135deg, #8B5CF6, #6366F1)',
  'linear-gradient(135deg, #EF4444, #F97316)',
  'linear-gradient(135deg, #14B8A6, #06B6D4)',
  'linear-gradient(135deg, #EC4899, #8B5CF6)',
];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
};

export default function Explore() {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreResults, setGenreResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchingGenre, setSearchingGenre] = useState(false);

  useEffect(() => {
    getGenres()
      .then(data => {
        const filtered = (data.data || []).filter(g => g.id !== 0);
        setGenres(filtered);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenreClick = async (genre) => {
    setSelectedGenre(genre);
    setSearchingGenre(true);
    try {
      const data = await search(genre.name, 'album', 18);
      setGenreResults(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setSearchingGenre(false);
  };

  return (
    <motion.div className="page explore-page" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h1 className="explore-title">Browse <span className="text-pink">Music</span></h1>
        <p className="explore-subtitle">Explore genres, discover new artists and albums</p>
      </motion.div>

      {/* Genre Grid */}
      <section className="page-section">
        <div className="section-header">
          <h2>Genres</h2>
        </div>
        <div className="grid-genres">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="genre-card-skeleton animate-shimmer" />
            ))
          ) : (
            genres.slice(0, 10).map((genre, i) => (
              <motion.div
                key={genre.id}
                className={`genre-card ${selectedGenre?.id === genre.id ? 'active' : ''}`}
                style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }}
                onClick={() => handleGenreClick(genre)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="genre-card-name">{genre.name}</span>
                {genre.picture_medium && (
                  <img src={genre.picture_medium} alt="" className="genre-card-img" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Genre Results */}
      {selectedGenre && (
        <motion.section
          className="page-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="section-header">
            <h2>{selectedGenre.name} Albums</h2>
          </div>
          {searchingGenre ? (
            <div className="grid-cards">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid-cards">
              {genreResults.map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
              {genreResults.length === 0 && (
                <p style={{ color: 'var(--white-50)' }}>No albums found for this genre.</p>
              )}
            </div>
          )}
        </motion.section>
      )}
    </motion.div>
  );
}
