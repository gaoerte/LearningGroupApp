import { defineConfig } from 'vite';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import uni from '@dcloudio/vite-plugin-uni';

// 获取当前文件的目录路径（ES模块兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyCloudFunctions() {
  return {
    name: 'copy-cloudfunctions',
    enforce: 'post',
    async writeBundle() {
      try {
        const sourceDir = path.resolve(__dirname, 'cloudfunctions');
        
        // 检查源目录是否存在
        if (!await fs.pathExists(sourceDir)) {
          console.warn('[云函数复制] 源目录不存在:', sourceDir);
          return;
        }

        // 构建目标路径
        const platform = process.env.UNI_PLATFORM || 'mp-weixin';
        const mode = process.env.NODE_ENV === 'production' ? 'build' : 'dev';
        
        const targetDir = path.join(
          __dirname,
          'unpackage/dist',
          mode,
          platform,
          'cloudfunctions'
        );

        console.log('[云函数复制] 开始复制...');
        console.log('[云函数复制] 源目录:', sourceDir);
        console.log('[云函数复制] 目标目录:', targetDir);

        // 确保目标目录存在
        await fs.ensureDir(targetDir);
        
        // 复制云函数
        await fs.copy(sourceDir, targetDir, {
          overwrite: true,
          filter: (src) => {
            // 过滤掉不需要的文件
            const relativePath = path.relative(sourceDir, src);
            return !relativePath.includes('node_modules') && 
                   !relativePath.includes('.git') &&
                   !relativePath.endsWith('.log');
          }
        });

        console.log('[云函数复制] 复制完成!');
      } catch (error) {
        console.error('[云函数复制] 复制失败:', error);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    uni(),
    copyCloudFunctions()
  ],
  // 添加一些优化配置
  build: {
    // 输出目录
    outDir: 'unpackage/dist',
    // 静态资源处理
    assetsDir: 'static',
    // 代码分割
    rollupOptions: {
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  // 解决路径别名问题
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/api': path.resolve(__dirname, 'api'),
      '@/utils': path.resolve(__dirname, 'utils'),
      '@/components': path.resolve(__dirname, 'components'),
      '@/styles': path.resolve(__dirname, 'styles')
    }
  }
});
