const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: 5000,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Allow Replit proxy hosts
      res.setHeader('Access-Control-Allow-Origin', '*');
      return middleware(req, res, next);
    };
  },
};

// Ensure we allow all hosts for the dev server
if (config.resolver) {
  config.resolver.sourceExts.push('mjs');
}

module.exports = config;
