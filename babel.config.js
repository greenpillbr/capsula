module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-worklets/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/types': './src/types',
            '@/utils': './src/utils',
            '@/constants': './src/constants',
            '@/localization': './src/localization'
          }
        }
      ]
    ]
  };
};
