import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { buildAnalysis } from './src/lib/spotify';
import { generateFortune } from './src/lib/ai';

// Environment variables
const PORT = 3000;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

async function startServer() {
  const app = express();
  
  app.use(cookieParser());
  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // 1. Auth URL
  app.get('/api/auth/url', (req, res) => {
    const scope = 'user-read-private user-read-email user-top-read user-read-recently-played user-read-playback-state user-library-read';
    const state = Math.random().toString(36).substring(7);
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID || '',
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state,
    });

    res.json({ url: `https://accounts.spotify.com/authorize?${params.toString()}` });
  });

  // 2. Auth Callback
  app.get('/api/auth/callback', async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;

    if (state === null) {
      res.redirect('/?error=state_mismatch');
      return;
    }

    try {
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + (Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
        },
        body: new URLSearchParams({
          code: code as string,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('Spotify Token Error:', tokenData);
        res.redirect('/?error=invalid_token');
        return;
      }

      // In a real app, store refresh token in DB/HttpOnly cookie
      // For this prototype, we'll send it back to the client via a script (popup pattern)
      // or redirect with a query param (less secure but works for simple demo)
      
      // Using the popup pattern as recommended in guidelines
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  token: '${tokenData.access_token}',
                  refreshToken: '${tokenData.refresh_token}'
                }, '*');
                window.close();
              } else {
                // Fallback if not in popup
                window.location.href = '/analyze?token=${tokenData.access_token}';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);

    } catch (error) {
      console.error('Auth Callback Error:', error);
      res.redirect('/?error=server_error');
    }
  });

  // 3. Analyze Endpoint
  app.post('/api/analyze', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      // 1. Fetch Data from Spotify
      const analysis = await buildAnalysis(token);
      
      // 2. Generate Fortune with AI
      // Note: In a real app, we might queue this or cache it
      const fortune = await generateFortune(analysis);

      res.json({ analysis, fortune });
    } catch (error: any) {
      console.error('Analysis Error:', error);
      res.status(500).json({ error: error.message || 'Failed to analyze data' });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
