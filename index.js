const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/openai', async (req, res) => {
  try {
    console.log('Received request to proxy');
    console.log(req.body);
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

app.post('/api/claude', async (req, res) => {
  try {
    const body = req.body;
    console.log(body.messages);
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20240620',
      system: body.system,
      max_tokens: body.max_tokens || 1024,
      stream: true,
      messages: body.messages || [],
    });

    // Handle the stream in OpenAI format
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        // Format the chunk like OpenAI's response
        const data = JSON.stringify({
          id: 'chatcmpl-' + Date.now(),
          object: 'chat.completion.chunk',
          created: Math.floor(Date.now() / 1000),
          model: 'claude-3-5-sonnet-20240620',
          choices: [{
            index: 0,
            delta: {
              content: chunk.delta.text
            },
            finish_reason: null
          }]
        });
        
        // Send in the same format as OpenAI
        res.write(`data: ${data}\n\n`);
      }
    }

    // Send the [DONE] message like OpenAI
    res.write('data: [DONE]\n\n');
    res.end();
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