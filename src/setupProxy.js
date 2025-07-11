const { createProxyMiddleware } = require('http-proxy-middleware');

// ElevenLabs API ключ из системной переменной
const XI_API_KEY = process.env.REACT_APP_ELEVEN_LABS_API_KEY || 'your-api-key-here';

module.exports = function(app) {
  // Прокси для REST API ElevenLabs
  app.use('/elevenlabs', createProxyMiddleware({
    target: 'https://api.elevenlabs.io',
    changeOrigin: true,
    pathRewrite: {
      '^/elevenlabs': '' // Убираем префикс /elevenlabs
    },
    onProxyReq: (proxyReq, req, res) => {
      // Добавляем API ключ к каждому запросу
      proxyReq.setHeader('xi-api-key', XI_API_KEY);
      console.log(`[ElevenLabs REST] ${req.method} ${req.path} -> ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`[ElevenLabs REST] ${req.method} ${req.path} <- ${proxyRes.statusCode}`);
    }
  }));

  // Прокси для WebSocket ElevenLabs
  app.use('/ws-elevenlabs', createProxyMiddleware({
    target: 'https://api.elevenlabs.io',
    changeOrigin: true,
    ws: true, // Включаем WebSocket
    pathRewrite: {
      '^/ws-elevenlabs': '' // Убираем префикс /ws-elevenlabs
    },
    onProxyReq: (proxyReq, req, res) => {
      // Добавляем API ключ к WebSocket запросам
      proxyReq.setHeader('xi-api-key', XI_API_KEY);
      console.log(`[ElevenLabs WS] ${req.method} ${req.path} -> ${proxyReq.path}`);
    }
  }));

  console.log('🚀 ElevenLabs proxy routes added:');
  console.log('   📡 REST API: /elevenlabs -> https://api.elevenlabs.io');
  console.log('   🔌 WebSocket: /ws-elevenlabs -> https://api.elevenlabs.io');
  console.log(`   🔑 Using API key: ${XI_API_KEY.substring(0, 10)}...`);
}; 