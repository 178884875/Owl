import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  resolve:{
    alias: {
      '@': resolve(__dirname, './src'),
    },
    extensions:['.js','.jsx','.ts','.tsx']
  },
  plugins: [react()],
  server: {
    port: 9000,
    proxy: {
      '/api': 'http://localhost:5255'
    }
  }
})
