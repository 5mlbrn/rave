import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { search } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import TrackRow from '../components/ui/TrackRow';
import ArtistCard from '../components/ui/ArtistCard';
import AlbumCard from '../components/ui/AlbumCard';
import { SkeletonRow, SkeletonCard, SkeletonArtist } from '../components/ui/SkeletonLoader';
import { FiSearch, FiX } from 'react-icons/fi';
import './Search.css';

const tabs = ['tracks', 'artists', 'albums'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tracks');
  const [results, setResults] = useState({ tracks: [], artists: [], albums: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debouncedQuery = useDebounce(query, 350);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ tracks: [], artists: [], albums: [] });
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const [tracksData, artistsData, albumsData] = await Promise.all([
        search(q, 'track', 20),
        search(q, 'artist', 12),
        search(q, 'album', 12),
      ]);
      setResults({
        tracks: tracksData.data || [],
        artists: artistsData.data || [],
        albums: albumsData.data || [],
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    doSearch(debouncedQuery);
  }, [debouncedQuery, doSearch]);

  return (
    <motion.div
      className="page search-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="search-title">Search</h1>

        <div className="search-input-wrapper" id="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            id="search-input"
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>
              <FiX />
            </button>
          )}
        </div>
      </motion.div>

      {searched && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Tabs */}
          <div className="search-tabs">
            {tabs.map(tab => (
              <button
                key={tab}
                className={`chip ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Results */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'tracks' && (
                <div className="track-list">
                  {loading ? (
                    [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                  ) : results.tracks.length > 0 ? (
                    results.tracks.map((track, i) => (
                      <TrackRow key={track.id} track={track} index={i} trackList={results.tracks} />
                    ))
                  ) : (
                    <p className="search-empty">No tracks found for "{query}"</p>
                  )}
                </div>
              )}

              {activeTab === 'artists' && (
                <div className="grid-artists">
                  {loading ? (
                    [...Array(6)].map((_, i) => <SkeletonArtist key={i} />)
                  ) : results.artists.length > 0 ? (
                    results.artists.map(a => <ArtistCard key={a.id} artist={a} />)
                  ) : (
                    <p className="search-empty">No artists found for "{query}"</p>
                  )}
                </div>
              )}

              {activeTab === 'albums' && (
                <div className="grid-cards">
                  {loading ? (
                    [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
                  ) : results.albums.length > 0 ? (
                    results.albums.map(a => <AlbumCard key={a.id} album={a} />)
                  ) : (
                    <p className="search-empty">No albums found for "{query}"</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!searched && (
        <div className="search-empty-state">
          <FiSearch size={48} />
          <p>Search for your favorite songs, artists, and albums</p>
        </div>
      )}
    </motion.div>
  );
}
