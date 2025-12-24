import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],

    // Base path for FiveM NUI (important for asset loading)
    base: './',

    // Resolve aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './html'),
        '@components': path.resolve(__dirname, './html/components'),
        '@apps': path.resolve(__dirname, './html/components/apps'),
      },
    },

    // Environment variables
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
    },

    // Build configuration for FiveM NUI
    build: {
      // Output to html directory for FiveM
      outDir: 'html',
      emptyOutDir: false,

      // Target ES2020 for Node 16 compatibility
      target: 'es2020',

      // Minification
      minify: 'esbuild',

      // Sourcemaps for debugging (disable in production)
      sourcemap: mode === 'development',

      // Rollup options
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'html/index.html'),
        },
        output: {
          // Asset naming
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',

          // Manual chunks for better caching
          manualChunks: {
            react: ['react', 'react-dom'],
            icons: ['lucide-react'],
          },
        },
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
    },

    // Dev server configuration
    server: {
      port: 3000,
      strictPort: false,
      open: false,

      // CORS for NUI development
      cors: true,

      // HMR configuration
      hmr: {
        protocol: 'ws',
        host: 'localhost',
      },
    },

    // Preview server
    preview: {
      port: 4173,
      strictPort: false,
    },

    // CSS configuration
    css: {
      postcss: './postcss.config.cjs',
      devSourcemap: true,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'lucide-react'],
      exclude: [],
    },

    // ESBuild configuration
    esbuild: {
      target: 'es2020',
      supported: {
        'top-level-await': true,
      },
    },
  };
});
