import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MusicPlayer from './components/player/MusicPlayer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ArtistPage from './pages/ArtistPage';
import AlbumPage from './pages/AlbumPage';
import SearchPage from './pages/Search';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Recommendations from './pages/Recommendations';
import About from './pages/About';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <PlayerProvider>
        <div className="app-layout">
          <Navbar />
          <div className="app-body">
            <Sidebar />
            <main className="main-content">
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/artist/:id" element={<ArtistPage />} />
                  <Route path="/album/:id" element={<AlbumPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/library" element={<Dashboard />} />
                  <Route path="/library/:section" element={<Dashboard />} />
                  <Route path="/library/:section/:playlistId" element={<Dashboard />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/for-you" element={<Recommendations />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </AnimatePresence>
            </main>
          </div>
          <MusicPlayer />
        </div>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(19, 26, 53, 0.95)',
              color: '#fff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              fontSize: '14px',
            },
          }}
        />
      </PlayerProvider>
    </AuthProvider>
  );
}
