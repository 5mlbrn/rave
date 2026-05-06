export const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const getImageUrl = (track) => {
  return track?.album?.cover_medium || track?.album?.cover || track?.cover_medium || track?.cover || '';
};

export const truncate = (str, len = 28) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
};

// localStorage helpers
const STORAGE_KEYS = {
  LIKED: 'rave_liked_songs',
  HISTORY: 'rave_history',
  PLAYLISTS: 'rave_playlists',
};

export const getLikedSongs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKED) || '[]');
  } catch { return []; }
};

export const toggleLike = (track) => {
  const liked = getLikedSongs();
  const idx = liked.findIndex(t => t.id === track.id);
  if (idx >= 0) {
    liked.splice(idx, 1);
  } else {
    liked.unshift({
      id: track.id,
      title: track.title,
      artist: { name: track.artist?.name },
      album: {
        title: track.album?.title,
        cover_small: track.album?.cover_small,
        cover_medium: track.album?.cover_medium,
      },
      duration: track.duration,
      preview: track.preview,
    });
  }
  localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(liked));
  return liked;
};

export const isLiked = (trackId) => {
  return getLikedSongs().some(t => t.id === trackId);
};

export const getHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  } catch { return []; }
};

export const addToHistory = (track) => {
  let history = getHistory();
  history = history.filter(t => t.id !== track.id);
  history.unshift({
    id: track.id,
    title: track.title,
    artist: { name: track.artist?.name },
    album: {
      title: track.album?.title,
      cover_small: track.album?.cover_small,
      cover_medium: track.album?.cover_medium,
    },
    duration: track.duration,
    preview: track.preview,
    playedAt: Date.now(),
  });
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  return history;
};

export const getPlaylists = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS) || '[]');
  } catch { return []; }
};

export const savePlaylist = (playlist) => {
  const playlists = getPlaylists();
  const idx = playlists.findIndex(p => p.id === playlist.id);
  if (idx >= 0) {
    playlists[idx] = playlist;
  } else {
    playlists.push(playlist);
  }
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  return playlists;
};

export const deletePlaylist = (id) => {
  const playlists = getPlaylists().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
  return playlists;
};

export const createPlaylist = (name) => {
  const playlist = {
    id: `pl_${Date.now()}`,
    name,
    tracks: [],
    createdAt: Date.now(),
  };
  savePlaylist(playlist);
  return playlist;
};

export const addTrackToPlaylist = (playlistId, track) => {
  const playlists = getPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return playlists;
  if (pl.tracks.some(t => t.id === track.id)) return playlists;
  pl.tracks.push({
    id: track.id,
    title: track.title,
    artist: { name: track.artist?.name },
    album: {
      title: track.album?.title,
      cover_small: track.album?.cover_small,
      cover_medium: track.album?.cover_medium,
    },
    duration: track.duration,
    preview: track.preview,
  });
  return savePlaylist(pl);
};

export const removeTrackFromPlaylist = (playlistId, trackId) => {
  const playlists = getPlaylists();
  const pl = playlists.find(p => p.id === playlistId);
  if (!pl) return playlists;
  pl.tracks = pl.tracks.filter(t => t.id !== trackId);
  return savePlaylist(pl);
};
