module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'no-inner-declarations': 'off'
  },
  globals: {
    d3: 'readonly'
  }
};