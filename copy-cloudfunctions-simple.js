import fs from 'fs';
import path from 'path';

// 简单的文件复制函数
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) {
    console.error('❌ 源目录不存在:', src);
    return false;
  }

  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const files = fs.readdirSync(src);
    files.forEach(file => {
      copyRecursive(path.join(src, file), path.join(dest, file));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
  return true;
}

// 复制云函数
const env = process.env.NODE_ENV || 'development';
const targetDir = env === 'development' ? 'unpackage/dist/dev' : 'unpackage/dist/build';
const to = `./${targetDir}/mp-weixin/cloudfunctions`;

console.log('🔧 开始复制云函数...');
console.log('源目录: ./cloudfunctions');
console.log('目标目录:', to);

// 确保目标目录存在
fs.mkdirSync(path.dirname(to), { recursive: true });

// 复制文件
if (copyRecursive('./cloudfunctions', to)) {
  console.log('✅ 云函数复制完成！');
  
  // 列出复制的文件
  try {
    const files = fs.readdirSync(to);
    console.log('📁 已复制的云函数:', files.join(', '));
  } catch (err) {
    console.log('📁 目标目录:', to);
  }
} else {
  console.log('❌ 云函数复制失败！');
}
