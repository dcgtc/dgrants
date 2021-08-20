import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      process: 'process/browser',
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
  optimizeDeps: {
    exclude: ['electron'],
  },
  define: {
    'process.env': process.env,
  },
});
