module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/common/components',
            '@/types': './src/common/types',
            '@/utils': './src/common/utils',
            '@/store': './src/store',
            '@/lib': './src/lib',
            '@/modules': './src/modules',
            '@/constants': './src/constants',
            '@/config': './src/config',
          },
        },
      ],
    ],
  };
};