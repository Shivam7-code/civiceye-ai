import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Forwards browser requests to Groq, injecting the API key server-side
        // so it never appears in the client bundle, and sidestepping CORS.
        '/api/groq': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/groq/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.GROQ_API_KEY}`)
            })
          },
        },
      },
    },
  }
})
