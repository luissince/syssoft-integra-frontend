module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
  },

  parser: '@typescript-eslint/parser',

  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },

  settings: {
    react: {
      version: 'detect',
    },
  },

  plugins: [
    'react-refresh',
    '@typescript-eslint',
  ],

  ignorePatterns: [
    'dist',
    '.eslintrc.cjs',
  ],

  rules: {

    // Detecta variables, funciones, imports no usados
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],

    // evita que la regla antigua choque
    'no-unused-vars': 'off',

    'no-console': 'warn',

    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    'react/prop-types': 'off',

    'react/react-in-jsx-scope': 'off',
  },
}