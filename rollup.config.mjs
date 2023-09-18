import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'lib/index.js',
  output: [
    {
      name: 'immediate',
      file: 'build/index.umd.js',
      format: 'umd',
    },
    {
      file: 'build/index.es.js',
      format: 'es',
    },
  ],
  plugins: [commonjs()]
}
