#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 复制目录的辅助函数
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcFile = path.join(src, file);
    const destFile = path.join(dest, file);
    
    if (fs.statSync(srcFile).isDirectory()) {
      copyDirectory(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  });
}

// 复制云函数
function copyCloudFunctions() {
  try {
    const cloudFunctionsPath = path.join(projectRoot, 'cloudfunctions');
    
    // 可能的目标路径
    const possibleTargets = [
      path.join(projectRoot, 'unpackage/dist/build/mp-weixin/cloudfunctions'),
      path.join(projectRoot, 'unpackage/dist/dev/mp-weixin/cloudfunctions'),
      path.join(projectRoot, 'dist/mp-weixin/cloudfunctions')
    ];
    
    if (!fs.existsSync(cloudFunctionsPath)) {
      console.log('❌ 云函数目录不存在:', cloudFunctionsPath);
      return;
    }
    
    console.log('📁 源目录:', cloudFunctionsPath);
    
    // 为每个可能的目标创建复制
    possibleTargets.forEach(outputPath => {
      // 确保输出目录存在
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      
      // 复制云函数
      const functions = fs.readdirSync(cloudFunctionsPath);
      functions.forEach(func => {
        const srcPath = path.join(cloudFunctionsPath, func);
        const destPath = path.join(outputPath, func);
        
        if (fs.statSync(srcPath).isDirectory()) {
          copyDirectory(srcPath, destPath);
          console.log(`📁 复制云函数 ${func} 到: ${destPath}`);
        }
      });
      
      console.log(`✅ 复制到目标目录: ${outputPath}`);
    });
    
    console.log('🎉 云函数复制完成！');
    console.log('');
    console.log('📋 接下来的步骤：');
    console.log('1. 在微信开发者工具中打开项目');
    console.log('2. 找到 cloudfunctions 文件夹');
    console.log('3. 右键点击云函数文件夹');
    console.log('4. 选择"上传并部署：云端安装依赖"');
    console.log('5. 等待部署完成');
    console.log('');
    console.log('💡 提示：如果看不到 cloudfunctions 文件夹，请检查微信开发者工具的项目路径是否正确');
    
  } catch (error) {
    console.error('❌ 云函数复制失败:', error.message);
    console.error(error.stack);
  }
}

// 检查云函数状态
function checkCloudFunctions() {
  const cloudFunctionsPath = path.join(projectRoot, 'cloudfunctions');
  
  if (!fs.existsSync(cloudFunctionsPath)) {
    console.log('❌ 云函数目录不存在');
    return;
  }
  
  const functions = fs.readdirSync(cloudFunctionsPath).filter(item => {
    return fs.statSync(path.join(cloudFunctionsPath, item)).isDirectory();
  });
  
  console.log('🔍 发现以下云函数:');
  functions.forEach(func => {
    const funcPath = path.join(cloudFunctionsPath, func);
    const indexPath = path.join(funcPath, 'index.js');
    const packagePath = path.join(funcPath, 'package.json');
    
    console.log(`  📦 ${func}`);
    console.log(`    - index.js: ${fs.existsSync(indexPath) ? '✅' : '❌'}`);
    console.log(`    - package.json: ${fs.existsSync(packagePath) ? '✅' : '❌'}`);
  });
  
  console.log('');
}

// 主函数
function main() {
  console.log('🚀 云函数部署辅助工具');
  console.log('========================');
  
  checkCloudFunctions();
  copyCloudFunctions();
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  copyCloudFunctions,
  checkCloudFunctions
};
