import CopyPlugin from 'vite-plugin-files-copy';
import { build } from 'vite';

// 简单的复制脚本
const env = process.env.NODE_ENV || 'development';
const to = "./" + (env === 'development' ? 'unpackage/dist/dev' : 'unpackage/dist/build') + '/mp-weixin/cloudfunctions';

console.log('🔧 开始复制云函数...');
console.log('目标路径:', to);

// 使用 vite 的复制插件
build({
  plugins: [
    CopyPlugin({
      patterns: [
        {
          from: './cloudfunctions',
          to: to
        },
      ],
    }),
  ],
  build: {
    write: false, // 不写入构建文件，只执行插件
  }
}).then(() => {
  console.log('✅ 云函数复制完成！');
}).catch(err => {
  console.error('❌ 复制失败:', err);
});
