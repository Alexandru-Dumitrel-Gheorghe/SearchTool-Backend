// backend/routes/hidriveRoutes.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// 1. GET /api/hidrive/authorize
//    Redirects user to HiDrive's OAuth page to grant access
router.get('/authorize', (req, res) => {
  const clientId = process.env.HIDRIVE_CLIENT_ID;
  const redirectUri = encodeURIComponent(process.env.HIDRIVE_REDIRECT_URI);
  // You can specify scopes if needed; here's an example:
  // For actual scopes, check the HiDrive docs or dev portal
  const scope = 'offline r dir';

  // Build the HiDrive OAuth URL
  const authUrl = `https://oauth.hidrive.strato.com/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  // Redirect the user to the HiDrive authorization page
  res.redirect(authUrl);
});

// 2. GET /api/hidrive/callback
//    HiDrive redirects here with ?code=..., we exchange code for token
router.get('/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  try {
    const tokenResponse = await axios.post('https://oauth.hidrive.strato.com/token', null, {
      params: {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.HIDRIVE_CLIENT_ID,
        client_secret: process.env.HIDRIVE_CLIENT_SECRET,
        redirect_uri: process.env.HIDRIVE_REDIRECT_URI
      }
    });

    // Extract tokens from response
    const { access_token, refresh_token, token_type, expires_in } = tokenResponse.data;

    // In a real app, you'd store these tokens in a database or session
    console.log('HiDrive tokens:', { access_token, refresh_token, token_type, expires_in });

    // Redirect or respond with success
    res.send('Successfully authenticated with HiDrive! You can store the tokens now.');
  } catch (error) {
    console.error('Error exchanging code for token:', error.response?.data || error.message);
    return res.status(500).send('Failed to exchange code for token');
  }
});

module.exports = router;
