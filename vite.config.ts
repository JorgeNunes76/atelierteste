import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const assetMap: Record<string, string> = {
  '6399465932709e595f6f97b150204568d9a0c14c.png': 'novo_01.png',
  'e6ea0ef70bf8ac9c274b680d74b6d0dfa80a65f1.png': 'novo_02.png',
  'cd5e5be9bbc847f612d6eee464133e65f8dd8c6f.png': 'novo_03.png',
  'ebb5a35e5e40ac74234d1f58fb628000a9ca00b1.png': 'novo_04.png',
  '3b08e0afa2ba39cc6be257854ede12f6f68096d3.png': 'novo_05.png',
  '216030aa6aaefa5e7f9facf26aaaa3f4d5ff33bf.png': 'wall_mockup_bedroom.png',
  '8541df0425952db8221403f49b9cf0fd6b776313.png': 'wall_mockup_office.png',
  '616e7e71ec3da1615a495603bb9d8ad200d1ca85.png': 'wall_mockup_gallery.png',
  '37ae076f9c70040c1e86be4bab8a3370e8023d9e.png': 'margarida_child_enhanced.png',
  '26fa80762b3bb676a93d34e2887e0e81b564bb76.png': '26fa80762b3bb676a93d34e2887e0e81b564bb76.png',
  'b7b24245abcdea29bab902e1ad12d72e9afc2799.png': 'artist_portrait.jpg',
  'ae632b3d89a4d086032a660429b1a01696ef459e.png': 'artist_main.jpg',
  '9e49ce9bc26e1e634dc598fea63b188cbb9a363d.png': 'flagship_art_placeholder.jpg',
  '1566f939421df90e36298942ae45397471258acd.png': 'hero_atelier.jpg',
  '5e6eb64a41281458609227fd07658963b447aa31.png': 'wall_mockup_living_room.png',
  '647362d01162297203a407c70c1a4e77cf57a719.png': 'wall_mockup.jpg',
  'aa31aa09cda51a3c67f8269dc5d7f355182d82ed.png': 'exhibition_1.jpg',
  '0d7fde90ec48230c3808e9b6ceed02fefe8e4a0f.png': 'exhibition_2.jpg',
  '8b799b9061113d500f7cda6a170d147e2226ecaf.png': 'exhibition_3.jpg',
  'e3ebd450bf669425543eab28f6d0c6bbe28bea85.png': 'margarida_child.jpg',
  'c6ec47ad31a374d698871b53f04cffacae2d696b.png': 'bg-art.png',
  '0fb117f1894ee3a8ddb0d956bce777924e5e36c4.png': 'wall_mockup_landscape.jpg',
  '170c757da3ac42fa32a32a3cbf1f2416044743dd.png': 'wall_mockup_portrait.jpg',
}

function figmaAssetPlugin() {
  return {
    name: 'figma-asset-plugin',
    enforce: 'pre' as const,
    resolveId(source) {
      if (source.startsWith('figma:asset/') || source.includes('/figma:asset/')) {
        return source.replace(/^.*figma:asset\//, 'virtual:figma-asset/')
      }
      return null
    },
    load(id) {
      if (id.startsWith('virtual:figma-asset/')) {
        const hash = id.replace('virtual:figma-asset/', '')
        const mappedFile = assetMap[hash]
        if (mappedFile) {
          return `export default '/assets/${mappedFile}'`
        }
        return `export default '/assets/margarida_child_enhanced.png'`
      }
      return null
    }
  }
}

export default defineConfig({
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('react-simple-maps') || id.includes('d3-') || id.includes('topojson')) {
            return 'vendor-map'
          }

          if (id.includes('@stripe') || id.includes('/stripe/')) {
            return 'vendor-stripe'
          }

          if (id.includes('motion') || id.includes('framer-motion')) {
            return 'vendor-motion'
          }

          if (id.includes('@supabase')) {
            return 'vendor-supabase'
          }

          if (id.includes('react') || id.includes('scheduler') || id.includes('react-router')) {
            return 'vendor-react'
          }
        },
      },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
