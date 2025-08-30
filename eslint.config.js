const js = require('@eslint/js');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.electron,
      },
    },
    plugins: {
      prettier,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      
      // Common JS best practices
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  // Main process files (Node.js environment)
  {
    files: ['src/index.js', 'src/preload.js', 'forge.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.electronMain,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  // Renderer process files (Browser environment)
  {
    files: ['src/renderer/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.electronRenderer,
        Alpine: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
    },
  },
];
