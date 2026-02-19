module.exports = {
  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
        plugins: ['prettier-plugin-astro'],
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.mdx',
      options: {
        parser: 'mdx',
      },
    },
  ],
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  singleAttributePerLine: false,
};
