module.exports = {
  '**/*.{js,ts}': [
    'prettier   -c  --write  --config ./.prettierrc.js',
    'eslint  --config  ./.eslintrc.js --fix'
  ]
};
