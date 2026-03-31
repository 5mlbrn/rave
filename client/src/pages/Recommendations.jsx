import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { search } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { getHistory, getLikedSongs } from '../utils/helpers';
import TrackCard from '../components/ui/TrackCard';
import TrackRow from '../components/ui/TrackRow';
import { SkeletonCard, SkeletonRow } from '../components/ui/SkeletonLoader';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { FiSun, FiMoon, FiZap, FiCloud, FiHeart, FiCoffee, FiMusic, FiStar, FiPlay, FiShuffle } from 'react-icons/fi';
import './Recommendations.css';

const MOODS = [
  { id: 'happy', name: 'Happy', icon: FiSun, query: 'happy upbeat pop', gradient: 'linear-gradient(135deg, #FFD93D, #FF6B6B)', emoji: '🌞' },
  { id: 'chill', name: 'Chill', icon: FiCoffee, query: 'chill lofi relax', gradient: 'linear-gradient(135deg, #6BCB77, #2C98F0)', emoji: '☕' },
  { id: 'energetic', name: 'Energetic', icon: FiZap, query: 'energetic workout hype', gradient: 'linear-gradient(135deg, #FF2D78, #FF6B35)', emoji: '⚡' },
  { id: 'sad', name: 'Sad', icon: FiCloud, query: 'sad emotional ballad', gradient: 'linear-gradient(135deg, #667eea, #764ba2)', emoji: '🌧️' },
  { id: 'romantic', name: 'Romance', icon: FiHeart, query: 'romantic love songs', gradient: 'linear-gradient(135deg, #FF2D78, #FF69B4)', emoji: '💕' },
  { id: 'focus', name: 'Focus', icon: FiMoon, query: 'focus ambient study', gradient: 'linear-gradient(135deg, #1B2444, #3D4F7A)', emoji: '🎯' },
  { id: 'party', name: 'Party', icon: FiStar, query: 'party dance club', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', emoji: '🎉' },
  { id: 'workout', name: 'Workout', icon: FiZap, query: 'workout gym bass', gradient: 'linear-gradient(135deg, #f12711, #f5af19)', emoji: '💪' },
];

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

export default function Recommendations() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodTracks, setMoodTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dailyMix, setDailyMix] = useState([]);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [personalPicks, setPersonalPicks] = useState([]);
  const [personalLoading, setPersonalLoading] = useState(true);
  const { playTrack } = usePlayer();

  // Generate daily mix from a random genre search
  useEffect(() => {
    const dailyQueries = ['trending 2025', 'best songs', 'top hits', 'popular music'];
    const randomQ = dailyQueries[Math.floor(Math.random() * dailyQueries.length)];
    search(randomQ, 'track', 15)
      .then(data => setDailyMix(data.data || []))
      .catch(console.error)
      .finally(() => setDailyLoading(false));
  }, []);

  // Generate personal recommendations from liked/history
  useEffect(() => {
    const liked = getLikedSongs();
    const history = getHistory();
    const all = [...liked, ...history];
    if (all.length > 0) {
      // Pick a random artist from their history/likes to search similar
      const randomTrack = all[Math.floor(Math.random() * Math.min(all.length, 10))];
      const artistName = randomTrack?.artist?.name || 'The Weeknd';
      search(artistName, 'track', 12)
        .then(data => setPersonalPicks(data.data || []))
        .catch(console.error)
        .finally(() => setPersonalLoading(false));
    } else {
      // Fallback for new users
      search('recommended music 2025', 'track', 12)
        .then(data => setPersonalPicks(data.data || []))
        .catch(console.error)
        .finally(() => setPersonalLoading(false));
    }
  }, []);

  const handleMoodClick = useCallback(async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    try {
      const data = await search(mood.query, 'track', 20);
      setMoodTracks(data.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  const handlePlayAll = (tracks) => {
    if (tracks.length > 0) playTrack(tracks[0], tracks, 0);
  };

  const handleShuffle = (tracks) => {
    if (tracks.length > 0) {
      const idx = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[idx], tracks, idx);
    }
  };

  return (
    <motion.div
      className="page recs-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="recs-title">
          For <span className="text-pink">You</span>
        </h1>
        <p className="recs-subtitle">
          Personalized music recommendations based on your mood and taste
        </p>
      </motion.div>

      {/* Mood Grid */}
      <Section title="How are you feeling?">
        <div className="mood-grid">
          {MOODS.map((mood, i) => (
            <motion.div
              key={mood.id}
              className={`mood-card ${selectedMood?.id === mood.id ? 'active' : ''}`}
              style={{ background: mood.gradient }}
              onClick={() => handleMoodClick(mood)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="mood-emoji">{mood.emoji}</span>
              <span className="mood-name">{mood.name}</span>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Mood Results */}
      <AnimatePresence>
        {selectedMood && (
          <motion.section
            className="page-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="section-header">
              <h2>{selectedMood.emoji} {selectedMood.name} Vibes</h2>
              <div className="recs-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handlePlayAll(moodTracks)}>
                  <FiPlay /> Play All
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleShuffle(moodTracks)}>
                  <FiShuffle /> Shuffle
                </button>
              </div>
            </div>
            {loading ? (
              <div className="scroll-row">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : (
              <>
                <div className="scroll-row">
                  {moodTracks.slice(0, 10).map((track, i) => (
                    <TrackCard key={track.id} track={track} trackList={moodTracks} index={i} />
                  ))}
                </div>
                {moodTracks.length > 10 && (
                  <div className="track-list" style={{ marginTop: 'var(--space-6)' }}>
                    {moodTracks.slice(10).map((track, i) => (
                      <TrackRow key={track.id} track={track} index={i + 10} trackList={moodTracks} />
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Daily Mix */}
      <Section title="Daily Mix" delay={0.1}>
        <div className="recs-mix-header">
          <p className="text-muted text-sm">A fresh mix of tracks, updated daily</p>
          {dailyMix.length > 0 && (
            <div className="recs-actions">
              <button className="btn btn-primary btn-sm" onClick={() => handlePlayAll(dailyMix)}>
                <FiPlay /> Play
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => handleShuffle(dailyMix)}>
                <FiShuffle />
              </button>
            </div>
          )}
        </div>
        {dailyLoading ? (
          [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
        ) : (
          <div className="track-list">
            {dailyMix.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} trackList={dailyMix} />
            ))}
          </div>
        )}
      </Section>

      {/* Based on Your Taste */}
      <Section title="Based on Your Taste" delay={0.15}>
        {personalLoading ? (
          <div className="scroll-row">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="scroll-row">
            {personalPicks.map((track, i) => (
              <TrackCard key={track.id} track={track} trackList={personalPicks} index={i} />
            ))}
          </div>
        )}
      </Section>
    </motion.div>
  );
}
