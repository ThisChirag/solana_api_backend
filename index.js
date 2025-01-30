// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// require('dotenv').config();

// const app = express();
// const PORT = 3001;

// app.use(cors());
// app.use(express.json());

// app.post('/api/anthropic', async (req, res) => {
//   try {
//     console.log('Received request to proxy');
//     const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
//       headers: {
//         'Content-Type': 'application/json',
//         'x-api-key': process.env.ANTHROPIC_API_KEY,
//         'anthropic-version': '2023-06-01'
//       }
//     });
//     console.log('Successfully proxied request');
//     res.json(response.data);
//   } catch (error) {
//     console.error('Proxy Error:', error.response?.data || error.message);
//     res.status(error.response?.status || 500).json({
//       error: error.response?.data || 'Internal Server Error'
//     });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Proxy server running on http://localhost:${PORT}`);
// });

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
    const response = await axios.post('https://api.openai.com/v1/chat/completions', req.body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    console.log('Successfully proxied request');
    res.json(response.data);
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