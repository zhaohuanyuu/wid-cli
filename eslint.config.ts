export default {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    'no-console': 'warn',
    'ts/ban-types': [
      'error',
      {
        extendDefaults: true,
        types: {
          '{}': {
            fixWith: 'Record<string, unknown>',
          },
          'object': {
            fixWith: 'Record<string, unknown>',
          },
          'Function': false,
        },
      },
    ],
    'ts/array-type': ['error', { default: 'generic' }],
  }
}