require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

// Simple CORS for local dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

// Proxy endpoint for OpenSky states
app.get('/api/states/all', async (req, res) => {
  try {
    const target = 'https://opensky-network.org/api/states/all';

    const headers = {};

    // Prefer Basic auth if CLIENT_ID + CLIENT_SECRET provided
    if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
      const basic = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else if (process.env.API_KEY) {
      // Fallback: Bearer API key
      headers['Authorization'] = `Bearer ${process.env.API_KEY}`;
    }

    const r = await fetch(target, { headers });
    const text = await r.text();

    // forward status and body
    res.status(r.status);
    res.send(text);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'proxy_error' });
  }
});

// Simple JSON endpoint for client to fetch processed flights
app.get('/flights', async (req, res) => {
  try {
    const target = 'https://opensky-network.org/api/states/all';
    const headers = {};

    if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
      const basic = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    } else if (process.env.API_KEY) {
      headers['Authorization'] = `Bearer ${process.env.API_KEY}`;
    }

    const r = await fetch(target, { headers });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    console.error('/flights proxy error', err);
    res.status(500).json({ error: 'proxy_error' });
  }
});

app.use(express.static('.'));

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
