import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  getLikedSongs, getHistory, getPlaylists, createPlaylist,
  deletePlaylist, removeTrackFromPlaylist
} from '../utils/helpers';
import { usePlayer } from '../context/PlayerContext';
import TrackRow from '../components/ui/TrackRow';
import { FiHeart, FiClock, FiPlus, FiMusic, FiTrash2, FiPlay } from 'react-icons/fi';
import './Dashboard.css';

export default function Dashboard() {
  const { section, playlistId } = useParams();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [liked, setLiked] = useState([]);
  const [history, setHistory] = useState([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    setPlaylists(getPlaylists());
    setLiked(getLikedSongs());
    setHistory(getHistory());
  }, [section, playlistId]);

  const refresh = () => {
    setPlaylists(getPlaylists());
    setLiked(getLikedSongs());
    setHistory(getHistory());
    forceUpdate(v => v + 1);
  };

  const handleCreatePlaylist = () => {
    const name = prompt('Playlist name:');
    if (name?.trim()) {
      createPlaylist(name.trim());
      refresh();
    }
  };

  const handleDeletePlaylist = (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this playlist?')) {
      deletePlaylist(id);
      refresh();
      if (playlistId === id) navigate('/library');
    }
  };

  const handleRemoveFromPlaylist = (plId, trackId) => {
    removeTrackFromPlaylist(plId, trackId);
    refresh();
  };

  const currentPlaylist = playlistId
    ? playlists.find(p => p.id === playlistId)
    : null;

  const renderContent = () => {
    // Liked Songs view
    if (section === 'liked') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="library-header">
            <div className="library-header-icon liked-bg"><FiHeart /></div>
            <div>
              <h1>Liked Songs</h1>
              <p className="text-muted">{liked.length} songs</p>
            </div>
            {liked.length > 0 && (
              <button className="btn btn-primary" onClick={() => playTrack(liked[0], liked, 0)}>
                <FiPlay /> Play All
              </button>
            )}
          </div>
          <div className="track-list">
            {liked.length > 0 ? liked.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} trackList={liked} />
            )) : (
              <div className="library-empty">
                <FiHeart size={40} />
                <p>Songs you like will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // History view
    if (section === 'history') {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="library-header">
            <div className="library-header-icon history-bg"><FiClock /></div>
            <div>
              <h1>Recently Played</h1>
              <p className="text-muted">{history.length} songs</p>
            </div>
          </div>
          <div className="track-list">
            {history.length > 0 ? history.map((track, i) => (
              <TrackRow key={`${track.id}-${i}`} track={track} index={i} trackList={history} />
            )) : (
              <div className="library-empty">
                <FiClock size={40} />
                <p>Your listening history will appear here</p>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Single Playlist view
    if (section === 'playlist' && currentPlaylist) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="library-header">
            <div className="library-header-icon playlist-bg"><FiMusic /></div>
            <div>
              <h1>{currentPlaylist.name}</h1>
              <p className="text-muted">{currentPlaylist.tracks.length} songs</p>
            </div>
            {currentPlaylist.tracks.length > 0 && (
              <button className="btn btn-primary" onClick={() => playTrack(currentPlaylist.tracks[0], currentPlaylist.tracks, 0)}>
                <FiPlay /> Play All
              </button>
            )}
          </div>
          <div className="track-list">
            {currentPlaylist.tracks.length > 0 ? currentPlaylist.tracks.map((track, i) => (
              <TrackRow key={track.id} track={track} index={i} trackList={currentPlaylist.tracks} />
            )) : (
              <div className="library-empty">
                <FiMusic size={40} />
                <p>This playlist is empty. Search for songs and add them!</p>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // Default: Library overview
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="library-title">Your Library</h1>

        {/* Quick Cards */}
        <div className="library-quick-cards">
          <div className="library-quick-card" onClick={() => navigate('/library/liked')}>
            <div className="library-quick-icon liked-bg"><FiHeart /></div>
            <div>
              <div className="library-quick-name">Liked Songs</div>
              <div className="library-quick-count">{liked.length} songs</div>
            </div>
          </div>
          <div className="library-quick-card" onClick={() => navigate('/library/history')}>
            <div className="library-quick-icon history-bg"><FiClock /></div>
            <div>
              <div className="library-quick-name">Recently Played</div>
              <div className="library-quick-count">{history.length} songs</div>
            </div>
          </div>
        </div>

        {/* Playlists */}
        <div className="section-header" style={{ marginTop: 'var(--space-8)' }}>
          <h2>Your Playlists</h2>
          <button className="btn btn-secondary" onClick={handleCreatePlaylist}>
            <FiPlus /> New Playlist
          </button>
        </div>
        <div className="library-playlists-grid">
          {playlists.map(pl => (
            <div
              key={pl.id}
              className="library-playlist-card glass"
              onClick={() => navigate(`/library/playlist/${pl.id}`)}
            >
              <div className="library-playlist-cover">
                {pl.tracks[0]?.album?.cover_medium ? (
                  <img src={pl.tracks[0].album.cover_medium} alt="" />
                ) : (
                  <FiMusic className="library-playlist-icon" />
                )}
              </div>
              <div className="library-playlist-info">
                <div className="library-playlist-name">{pl.name}</div>
                <div className="library-playlist-count">{pl.tracks.length} tracks</div>
              </div>
              <button
                className="library-playlist-delete"
                onClick={(e) => handleDeletePlaylist(pl.id, e)}
                title="Delete playlist"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          {playlists.length === 0 && (
            <div className="library-empty">
              <FiMusic size={40} />
              <p>Create your first playlist!</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="page dashboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {renderContent()}
    </motion.div>
  );
}
