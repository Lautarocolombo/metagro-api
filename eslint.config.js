import globals from 'globals';

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['backend/**/*.js', 'tools/**/*.{mjs,cjs}', 'tests/**/*.js'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'script'
      }
    }
  },
  {
    ignores: [
      'node_modules/**',
      'frontend/dist/**',
      'backend/coverage/**',
      'backend/data/uploads/**',
      'frontend/productos/**'
    ]
  }
];
