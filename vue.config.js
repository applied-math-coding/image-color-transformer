module.exports = {
  lintOnSave: false,
  devServer: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/image-color-transformer/'
    : '/'
}
