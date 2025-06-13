module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
        absoluteRuntime: false,
      }]
    ],
  };
};