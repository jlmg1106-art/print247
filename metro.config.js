const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: 5000,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization');
      
      // Bypass host check for Replit proxy
      if (req.headers.host && (req.headers.host.includes('replit.dev') || req.headers.host.includes('.replit.dev'))) {
        req.headers['x-forwarded-host'] = req.headers.host;
      }
      
      return middleware(req, res, next);
    };
  },
};

if (config.resolver) {
  config.resolver.sourceExts.push('mjs');
  // Avoid bundling issues with certain libraries in web
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'pdf');
}

module.exports = config;
