// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver options to help with module resolution
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    // Remove direct require.resolve that's causing the error
  },
  sourceExts: [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'],
};

module.exports = config;