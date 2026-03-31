import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const links = [
    { to: '/', label: 'Discover' },
    { to: '/explore', label: 'Browse' },
    { to: '/for-you', label: 'For You' },
    { to: '/library', label: 'Library' },
  ];

  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Yve
        </Link>

        <div className="navbar-links">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`navbar-link ${pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <Link to="/search" className="navbar-action-btn" id="nav-search-btn" aria-label="Search">
            <FiSearch />
          </Link>

          {isLoggedIn ? (
            <div className="navbar-user-wrapper">
              <button
                className="navbar-user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                id="nav-user-btn"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="navbar-avatar" />
                ) : (
                  <FiUser />
                )}
              </button>
              {showDropdown && (
                <div className="navbar-dropdown">
                  <div className="navbar-dropdown-header">
                    <div className="navbar-dropdown-name">{user.name}</div>
                    <div className="navbar-dropdown-email">{user.email}</div>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/library" className="navbar-dropdown-item" onClick={() => setShowDropdown(false)}>
                    <FiUser /> Profile
                  </Link>
                  <button
                    className="navbar-dropdown-item navbar-dropdown-logout"
                    onClick={() => { logout(); setShowDropdown(false); }}
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" id="nav-login-btn">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
