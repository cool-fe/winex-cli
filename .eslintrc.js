module.exports = {
  env: {
    es6: true
  },
  extends: ['@winfe/eslint-config-winex/eslintrc.typescript-node.js', 'prettier'],
  globals: {
    use: true
  },
  parserOptions: {
    ecmaVersion: 2017
  },
  rules: {
    complexity: [
      'warn',
      {
        max: 10
      }
    ]
  }
};
