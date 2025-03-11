import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['hairsalon-web.onrender.com', 'localhost', '127.0.0.1']
  }
})
