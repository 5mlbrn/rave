import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ITUNES = 'https://itunes.apple.com';

// Helper: normalize iTunes track to our format
function upscaleArt(url, size = '600x600bb') {
  if (!url) return '';
  return url.replace(/\d+x\d+bb/, size);
}

function normalizeTrack(t) {
  const art = t.artworkUrl100 || t.artworkUrl60 || '';
  return {
    id: t.trackId,
    title: t.trackName,
    duration: Math.round((t.trackTimeMillis || 0) / 1000),
    preview: t.previewUrl || '',
    artist: {
      id: t.artistId,
      name: t.artistName,
      picture_medium: upscaleArt(art, '300x300bb'),
      picture_xl: upscaleArt(art, '600x600bb'),
    },
    album: {
      id: t.collectionId,
      title: t.collectionName,
      cover_small: upscaleArt(art, '200x200bb'),
      cover_medium: upscaleArt(art, '400x400bb'),
      cover_big: upscaleArt(art, '600x600bb'),
      cover_xl: upscaleArt(art, '1200x1200bb'),
    },
  };
}

// Helper: normalize iTunes artist
function normalizeArtist(a) {
  return {
    id: a.artistId,
    name: a.artistName,
    picture_medium: a.artworkUrl100 || '',
    picture_xl: (a.artworkUrl100 || '').replace('100x100', '600x600'),
    picture: a.artworkUrl100 || '',
    nb_fan: 0,
    type: 'artist',
  };
}

// Helper: normalize iTunes album
function normalizeAlbum(a) {
  const art = a.artworkUrl100 || a.artworkUrl60 || '';
  return {
    id: a.collectionId,
    title: a.collectionName,
    cover_small: upscaleArt(art, '200x200bb'),
    cover_medium: upscaleArt(art, '400x400bb'),
    cover_big: upscaleArt(art, '600x600bb'),
    release_date: a.releaseDate,
    artist: {
      id: a.artistId,
      name: a.artistName,
    },
    type: 'album',
  };
}

// --- Search tracks ---
app.get('/api/search', async (req, res) => {
  try {
    const { q, type = 'track', limit = 25 } = req.query;
    const entity = type === 'artist' ? 'musicArtist' : type === 'album' ? 'album' : 'song';
    const { data } = await axios.get(`${ITUNES}/search`, {
      params: { term: q, media: 'music', entity, limit, country: 'US' }
    });
    
    let results = [];
    if (type === 'track') {
      results = (data.results || []).filter(r => r.kind === 'song').map(normalizeTrack);
    } else if (type === 'artist') {
      results = (data.results || []).filter(r => r.wrapperType === 'artist').map(normalizeArtist);
    } else if (type === 'album') {
      results = (data.results || []).filter(r => r.wrapperType === 'collection').map(normalizeAlbum);
    }
    
    res.json({ data: results, total: results.length });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// --- Home page data ---
app.get('/api/home', async (req, res) => {
  try {
    const SEED_ARTISTS = [
      'The Weeknd', 'Don Toliver', 'Frank Ocean',
      'Arijit Singh', 'Atif Aslam', 'Drake',
      'Taylor Swift', 'Billie Eilish', 'Dua Lipa', 'Travis Scott',
    ];

    // Fetch 2-3 songs per artist for a diverse trending section with unique covers
    const TRENDING_ARTISTS = [
      'The Weeknd', 'Drake', 'Taylor Swift', 'Billie Eilish',
      'Dua Lipa', 'Travis Scott', 'Don Toliver', 'Arijit Singh',
      'Ed Sheeran', 'Post Malone',
    ];

    const [newReleasesRes, ...allResults] = await Promise.all([
      axios.get(`${ITUNES}/search`, {
        params: { term: 'new music 2025', media: 'music', entity: 'album', limit: 15, country: 'US' }
      }).catch(() => null),
      // Fetch songs per trending artist (2 each for diverse covers)
      ...TRENDING_ARTISTS.map(name =>
        axios.get(`${ITUNES}/search`, {
          params: { term: name, media: 'music', entity: 'song', limit: 3, country: 'US' }
        }).catch(() => null)
      ),
      // Also fetch 1 song per artist to get artwork (musicArtist entity has no images)
      ...SEED_ARTISTS.map(name =>
        axios.get(`${ITUNES}/search`, {
          params: { term: name, media: 'music', entity: 'song', limit: 1, country: 'US' }
        }).catch(() => null)
      ),
    ]);

    // Split results: first TRENDING_ARTISTS.length are song searches, rest are artist photo lookups
    const songSearches = allResults.slice(0, TRENDING_ARTISTS.length);
    const artistPhotoSearches = allResults.slice(TRENDING_ARTISTS.length);

    // Collect trending tracks from multiple artists — each will have unique cover art
    const seenIds = new Set();
    const trending = [];
    for (const res of songSearches) {
      const songs = (res?.data?.results || []).filter(r => r.kind === 'song');
      for (const song of songs) {
        if (!seenIds.has(song.trackId) && trending.length < 25) {
          seenIds.add(song.trackId);
          trending.push(normalizeTrack(song));
        }
      }
    }

    const newReleases = (newReleasesRes?.data?.results || [])
      .filter(r => r.wrapperType === 'collection')
      .map(normalizeAlbum);

    // Build artist list using song artwork as artist photos
    const artists = artistPhotoSearches
      .map((r, i) => {
        const song = r?.data?.results?.[0];
        if (!song) return null;
        const art = song.artworkUrl100 || '';
        return {
          id: song.artistId,
          name: SEED_ARTISTS[i],
          picture_medium: upscaleArt(art, '400x400bb'),
          picture_xl: upscaleArt(art, '600x600bb'),
          picture: upscaleArt(art, '400x400bb'),
          nb_fan: 0,
        };
      })
      .filter(Boolean);

    // Hero tracks from The Weeknd (first trending artist)
    const heroTracks = trending.filter(t => t.artist?.name?.includes('Weeknd')).slice(0, 5);
    const allHeroTracks = heroTracks.length > 0 ? heroTracks : trending.slice(0, 5);

    res.json({
      trending,
      newReleases,
      artists,
      heroTracks: allHeroTracks,
      heroArtist: artists[0] || null,
    });
  } catch (err) {
    console.error('Home error:', err.message);
    res.status(500).json({ error: 'Home data failed' });
  }
});

// --- Charts ---
app.get('/api/charts', async (req, res) => {
  try {
    const { data } = await axios.get(`${ITUNES}/search`, {
      params: { term: 'top chart 2025', media: 'music', entity: 'song', limit: 25, country: 'US' }
    });
    const tracks = (data.results || []).filter(r => r.kind === 'song').map(normalizeTrack);
    res.json({ tracks: { data: tracks } });
  } catch (err) {
    console.error('Charts error:', err.message);
    res.status(500).json({ error: 'Charts failed' });
  }
});

// --- Artist by ID ---
app.get('/api/artist/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${ITUNES}/lookup`, {
      params: { id: req.params.id, country: 'US' }
    });
    const artist = data.results?.[0];
    if (!artist) return res.status(404).json({ error: 'Artist not found' });
    
    // iTunes lookup doesn't return artwork for artists — fetch a song to get a cover
    let artPic = '';
    try {
      const { data: songData } = await axios.get(`${ITUNES}/search`, {
        params: { term: artist.artistName, media: 'music', entity: 'song', limit: 1, country: 'US' }
      });
      const song = songData.results?.[0];
      if (song?.artworkUrl100) {
        artPic = song.artworkUrl100;
      }
    } catch {}

    res.json({
      id: artist.artistId,
      name: artist.artistName,
      picture_medium: upscaleArt(artPic, '400x400bb'),
      picture_xl: upscaleArt(artPic, '600x600bb'),
      picture: upscaleArt(artPic, '400x400bb'),
      nb_fan: 0,
    });
  } catch (err) {
    console.error('Artist error:', err.message);
    res.status(500).json({ error: 'Artist fetch failed' });
  }
});

// --- Artist top tracks ---
app.get('/api/artist/:id/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    // First get artist name, then search for their songs
    const { data: lookupData } = await axios.get(`${ITUNES}/lookup`, {
      params: { id: req.params.id, country: 'US' }
    });
    const artistName = lookupData.results?.[0]?.artistName;
    if (!artistName) return res.json({ data: [] });

    const { data } = await axios.get(`${ITUNES}/search`, {
      params: { term: artistName, media: 'music', entity: 'song', limit, country: 'US' }
    });
    const tracks = (data.results || [])
      .filter(r => r.kind === 'song')
      .map(normalizeTrack);
    
    res.json({ data: tracks });
  } catch (err) {
    console.error('Artist top error:', err.message);
    res.status(500).json({ error: 'Artist top tracks failed' });
  }
});

// --- Artist albums ---
app.get('/api/artist/:id/albums', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const { data } = await axios.get(`${ITUNES}/lookup`, {
      params: { id: req.params.id, entity: 'album', limit, country: 'US' }
    });
    const albums = (data.results || [])
      .filter(r => r.wrapperType === 'collection')
      .map(normalizeAlbum);
    
    res.json({ data: albums });
  } catch (err) {
    console.error('Artist albums error:', err.message);
    res.status(500).json({ error: 'Artist albums failed' });
  }
});

// --- Artist related ---
app.get('/api/artist/:id/related', async (req, res) => {
  try {
    // iTunes doesn't have a direct "related" endpoint
    // Search for similar genre artists
    const { data: lookupData } = await axios.get(`${ITUNES}/lookup`, {
      params: { id: req.params.id, country: 'US' }
    });
    const genre = lookupData.results?.[0]?.primaryGenreName || 'Pop';
    const { data } = await axios.get(`${ITUNES}/search`, {
      params: { term: genre, media: 'music', entity: 'musicArtist', limit: 10, country: 'US' }
    });
    const artists = (data.results || [])
      .filter(r => r.wrapperType === 'artist')
      .map(normalizeArtist);
    
    res.json({ data: artists });
  } catch (err) {
    console.error('Artist related error:', err.message);
    res.status(500).json({ error: 'Artist related failed' });
  }
});

// --- Album ---
app.get('/api/album/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${ITUNES}/lookup`, {
      params: { id: req.params.id, entity: 'song', country: 'US' }
    });
    const results = data.results || [];
    const albumInfo = results[0];
    if (!albumInfo) return res.status(404).json({ error: 'Album not found' });

    const tracks = results
      .filter(r => r.wrapperType === 'track' && r.kind === 'song')
      .map(normalizeTrack);

    res.json({
      id: albumInfo.collectionId,
      title: albumInfo.collectionName,
      cover_small: (albumInfo.artworkUrl100 || '').replace('100x100', '60x60'),
      cover_medium: albumInfo.artworkUrl100 || '',
      cover_big: (albumInfo.artworkUrl100 || '').replace('100x100', '600x600'),
      release_date: albumInfo.releaseDate,
      artist: {
        id: albumInfo.artistId,
        name: albumInfo.artistName,
      },
      tracks: { data: tracks },
    });
  } catch (err) {
    console.error('Album error:', err.message);
    res.status(500).json({ error: 'Album fetch failed' });
  }
});

// --- Track ---
app.get('/api/track/:id', async (req, res) => {
  try {
    const { data } = await axios.get(`${ITUNES}/lookup`, {
      params: { id: req.params.id, country: 'US' }
    });
    const track = data.results?.[0];
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json(normalizeTrack(track));
  } catch (err) {
    console.error('Track error:', err.message);
    res.status(500).json({ error: 'Track fetch failed' });
  }
});

// --- Genres (hardcoded since iTunes doesn't have a genres endpoint) ---
app.get('/api/genres', async (req, res) => {
  const genres = [
    { id: 'pop', name: 'Pop' },
    { id: 'hiphop', name: 'Hip-Hop' },
    { id: 'rnb', name: 'R&B' },
    { id: 'rock', name: 'Rock' },
    { id: 'electronic', name: 'Electronic' },
    { id: 'indie', name: 'Indie' },
    { id: 'jazz', name: 'Jazz' },
    { id: 'classical', name: 'Classical' },
    { id: 'country', name: 'Country' },
    { id: 'latin', name: 'Latin' },
    { id: 'kpop', name: 'K-Pop' },
    { id: 'bollywood', name: 'Bollywood' },
  ];
  res.json({ data: genres });
});

// --- Recommendations ---
app.get('/api/recommendations', async (req, res) => {
  try {
    const { mood = 'chill', limit = 20 } = req.query;
    const MOOD_QUERIES = {
      happy: 'happy upbeat pop 2025',
      chill: 'chill lofi relax',
      energetic: 'energetic workout hype',
      sad: 'sad emotional ballad',
      romantic: 'romantic love songs',
      focus: 'focus ambient study',
      party: 'party dance club',
      workout: 'workout gym bass',
    };
    const query = MOOD_QUERIES[mood] || mood;
    const { data } = await axios.get(`${ITUNES}/search`, {
      params: { term: query, media: 'music', entity: 'song', limit, country: 'US' }
    });
    const tracks = (data.results || []).filter(r => r.kind === 'song').map(normalizeTrack);
    res.json({ data: tracks, mood });
  } catch (err) {
    console.error('Recommendations error:', err.message);
    res.status(500).json({ error: 'Recommendations failed' });
  }
});

app.listen(PORT, () => {
  console.log(`\n  🎵 Yve API Server running on http://localhost:${PORT}\n`);
});
