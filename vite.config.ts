import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves under /<repo-name>/
const base = process.env.VITE_BASE ?? '/multi-robot-planner/'

export default defineConfig({
  plugins: [react()],
  base,
})
