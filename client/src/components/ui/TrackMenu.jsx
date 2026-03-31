import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiCheck, FiMusic } from 'react-icons/fi';
import { getPlaylists, addTrackToPlaylist, createPlaylist } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './TrackMenu.css';

export default function TrackMenu({ track, onClose }) {
  const [playlists, setPlaylists] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    setPlaylists(getPlaylists());
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  const handleAdd = (playlistId) => {
    const pl = playlists.find(p => p.id === playlistId);
    if (pl?.tracks?.some(t => t.id === track.id)) {
      toast('Already in this playlist', { icon: '🎵' });
    } else {
      addTrackToPlaylist(playlistId, track);
      toast.success(`Added to ${pl?.name}`);
    }
    onClose();
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const pl = createPlaylist(newName.trim());
    addTrackToPlaylist(pl.id, track);
    toast.success(`Created "${pl.name}" and added track`);
    onClose();
  };

  return (
    <div className="track-menu" ref={menuRef}>
      <div className="track-menu-header">Add to playlist</div>
      <div className="track-menu-list">
        {playlists.map(pl => (
          <button
            key={pl.id}
            className="track-menu-item"
            onClick={() => handleAdd(pl.id)}
          >
            <FiMusic className="track-menu-item-icon" />
            <span className="track-menu-item-name">{pl.name}</span>
            {pl.tracks?.some(t => t.id === track.id) && (
              <FiCheck className="track-menu-item-check" />
            )}
          </button>
        ))}
        {playlists.length === 0 && !showCreate && (
          <div className="track-menu-empty">No playlists yet</div>
        )}
      </div>
      <div className="track-menu-divider" />
      {showCreate ? (
        <form className="track-menu-create" onSubmit={handleCreate}>
          <input
            type="text"
            className="track-menu-create-input"
            placeholder="Playlist name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="track-menu-create-btn">
            <FiPlus />
          </button>
        </form>
      ) : (
        <button
          className="track-menu-item track-menu-new"
          onClick={() => setShowCreate(true)}
        >
          <FiPlus className="track-menu-item-icon" />
          <span>New Playlist</span>
        </button>
      )}
    </div>
  );
}
