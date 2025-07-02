import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url';
import path from 'path';
import CopyPlugin from 'vite-plugin-files-copy';

// 获取当前文件的目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 获取环境变量，确定目标路径
const env = process.env.NODE_ENV;
const targetPath = './' + (env === 'development' ? 'unpackage/dist/dev' : 'unpackage/dist/build') + '/mp-weixin/cloudfunctions';

console.log('🔧 云函数复制目标路径:', targetPath);

export default defineConfig({
  plugins: [
    uni(),
    CopyPlugin({
      patterns: [
        {
          from: './cloudfunctions',
          to: targetPath
        },
      ],
    }),
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@/api': resolve(__dirname, './api'),
      '@/components': resolve(__dirname, './components'),
      '@/pages': resolve(__dirname, './pages'),
      '@/static': resolve(__dirname, './static'),
      '@/styles': resolve(__dirname, './styles'),
      '@/utils': resolve(__dirname, './utils'),
      '@/store': resolve(__dirname, './store')
    }
  },
  
  // 构建优化
  build: {
    // 分包优化
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/api/')) {
            return 'api';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
        }
      }
    },
    // 资源内联阈值
    assetsInlineLimit: 4096,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 构建目标
    target: 'es2015'
  },
  
  // CSS 预处理器配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // API 代理配置（如需要）
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 预构建优化
  optimizeDeps: {
    include: [
      // 添加需要预构建的依赖
    ]
  }
});
