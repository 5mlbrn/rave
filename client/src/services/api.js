import axios from 'axios';

// In dev: Vite proxy sends /api → localhost:5000
// In production: use the deployed backend URL from env variable
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// --- Chart / Trending ---
export const getCharts = () => api.get('/charts').then(r => r.data);

// --- Home (aggregated) ---
export const getHome = () => api.get('/home').then(r => r.data);

// --- Search ---
export const search = (q, type = 'track', limit = 25) =>
  api.get('/search', { params: { q, type, limit } }).then(r => r.data);

// --- Artist ---
export const getArtist = (id) => api.get(`/artist/${id}`).then(r => r.data);
export const getArtistTop = (id, limit = 10) =>
  api.get(`/artist/${id}/top`, { params: { limit } }).then(r => r.data);
export const getArtistAlbums = (id, limit = 20) =>
  api.get(`/artist/${id}/albums`, { params: { limit } }).then(r => r.data);
export const getArtistRelated = (id, limit = 10) =>
  api.get(`/artist/${id}/related`, { params: { limit } }).then(r => r.data);

// --- Album ---
export const getAlbum = (id) => api.get(`/album/${id}`).then(r => r.data);

// --- Track ---
export const getTrack = (id) => api.get(`/track/${id}`).then(r => r.data);

// --- Genres ---
export const getGenres = () => api.get('/genres').then(r => r.data);
export const getGenreArtists = (id) => api.get(`/genre/${id}/artists`).then(r => r.data);

// --- Editorial ---
export const getEditorial = () => api.get('/editorial').then(r => r.data);

// --- Recommendations ---
export const getRecommendations = (mood = 'chill', limit = 20) =>
  api.get('/recommendations', { params: { mood, limit } }).then(r => r.data);

// --- Playlist ---
export const getPlaylist = (id) => api.get(`/playlist/${id}`).then(r => r.data);

// --- Helper: format duration from seconds ---
export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default api;
