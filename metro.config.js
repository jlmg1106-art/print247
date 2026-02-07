const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ✅ NO forzar puerto aquí. Expo manejará 8081/tunnel correctamente.
// Si quieres CORS en web, mantenemos solo el enhanceMiddleware sin tocar port.
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
      return middleware(req, res, next);
    };
  },
};

if (config.resolver) {
  config.resolver.sourceExts.push('mjs');
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'pdf');
}

module.exports = config;

