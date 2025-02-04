const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/openai', async (req, res) => {
  try {
    console.log('Received request to proxy');
    const response = await axios({
      method: 'post',
      url: 'https://api.openai.com/v1/chat/completions',
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      responseType: 'stream'
    });
    console.log('Successfully proxied request');

    // Pass along the content-type header from OpenAI’s response.
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/json');
    // Optionally flush headers immediately.
    if (res.flushHeaders) res.flushHeaders();

    // Pipe the streaming response directly to the client.
    response.data.pipe(res);
  } catch (error) {
    console.error('Proxy Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal Server Error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
