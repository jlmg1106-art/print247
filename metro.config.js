const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para Replit (Web) y Expo Go (iOS)
config.server = {
  ...config.server,
  // Solo forzamos el puerto 5000 si estamos en un entorno Replit para la previsualización web
  port: process.env.REPLIT_SLUG ? 5000 : 8081,
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
  // Filtramos PDF de los assets para evitar problemas de bundling en web con pdf-lib
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'pdf');
}

module.exports = config;
