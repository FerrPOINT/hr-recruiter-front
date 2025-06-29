const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      onProxyReq: function(proxyReq, req, res) {
        // Логируем запросы для отладки
        console.log('Proxying request:', req.method, req.url);
        
        // Для multipart/form-data запросов не устанавливаем Content-Type,
        // так как браузер сам установит правильный boundary
        if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
          delete proxyReq.getHeader('content-type');
        }
      },
      onProxyRes: function(proxyRes, req, res) {
        // Логируем ответы для отладки
        console.log('Proxy response:', proxyRes.statusCode, req.url);
        
        // Добавляем CORS заголовки
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify({ error: 'Proxy error', message: err.message }));
      }
    })
  );
}; 