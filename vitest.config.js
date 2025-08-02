import { defineConfig } from 'vitest/config';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      instances: [{ 
        browser: 'chromium',
        launch: {
          headless: false,
        }
      }],
      provider: 'playwright',
    },
    globals: true,
    setupFiles: ['./tests/setup.js']
  },
  esbuild: {
    target: 'es2020',
    loader: 'jsx', // default for .js and .jsx
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    }
  }
});