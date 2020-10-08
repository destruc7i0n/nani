const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/proxy/pl',
    createProxyMiddleware({
      target: 'https://pl.crunchyroll.com',
      changeOrigin: true,
      pathRewrite: {
        '^/proxy/pl': ''
      },
    })
  )
}
