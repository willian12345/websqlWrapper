import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: {
    file: 'output/websqlwrapper.js',
    format: 'es'
  },
  plugins: [
    typescript()]
};