import { NavLink, useLocation } from 'react-router-dom';
import { FiHome, FiCompass, FiSearch, FiHeart, FiClock, FiPlus, FiMusic, FiStar } from 'react-icons/fi';
import { getPlaylists, createPlaylist } from '../../utils/helpers';
import { useState, useEffect } from 'react';
import './Sidebar.css';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    setPlaylists(getPlaylists());
  }, [pathname]);

  const handleCreatePlaylist = () => {
    const name = prompt('Playlist name:');
    if (name?.trim()) {
      createPlaylist(name.trim());
      setPlaylists(getPlaylists());
    }
  };

  const mainNav = [
    { to: '/', icon: FiHome, label: 'Home' },
    { to: '/explore', icon: FiCompass, label: 'Explore' },
    { to: '/search', icon: FiSearch, label: 'Search' },
    { to: '/for-you', icon: FiStar, label: 'For You' },
  ];

  const libraryNav = [
    { to: '/library', icon: FiMusic, label: 'Your Library' },
    { to: '/library/liked', icon: FiHeart, label: 'Liked Songs' },
    { to: '/library/history', icon: FiClock, label: 'History' },
  ];

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        {mainNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="sidebar-icon" />
            <span className="sidebar-text">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="sidebar-label">Library</div>
        {libraryNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="sidebar-icon" />
            <span className="sidebar-text">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-section">
        <div className="sidebar-label-row">
          <div className="sidebar-label">Playlists</div>
          <button className="sidebar-add-btn" onClick={handleCreatePlaylist} title="Create playlist">
            <FiPlus />
          </button>
        </div>
        <div className="sidebar-playlists">
          {playlists.map(pl => (
            <NavLink
              key={pl.id}
              to={`/library/playlist/${pl.id}`}
              className={({ isActive }) => `sidebar-link sidebar-playlist ${isActive ? 'active' : ''}`}
            >
              <FiMusic className="sidebar-icon" />
              <span className="sidebar-text">{pl.name}</span>
            </NavLink>
          ))}
          {playlists.length === 0 && (
            <div className="sidebar-empty">No playlists yet</div>
          )}
        </div>
      </div>
    </aside>
  );
}
