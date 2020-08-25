import babel from '@rollup/plugin-babel';

export default {
  input: 'lib/index.js',
  plugins: [
    babel({ babelHelpers: 'bundled' })
  ]
};
