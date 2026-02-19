import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub 프로젝트 사이트(예: username.github.io/order_app)면 base를 저장소 이름으로 설정
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  plugins: [react()],
  base,
  // GitHub Pages - Branch: main, Folder: / (root) → 빌드 결과를 repo 루트에 출력
  build: {
    outDir: '..',
    emptyOutDir: false, // repo 루트의 docs/, ui/ 등 기존 폴더를 지우지 않음
  },
})
