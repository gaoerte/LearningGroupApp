#!/bin/bash
# 简单的构建脚本来触发云函数复制

echo "🔧 触发云函数复制..."

# 设置开发环境并运行 vite
NODE_ENV=development npx vite build --mode development

echo "✅ 云函数复制完成！"
echo ""
echo "📁 检查复制结果："
ls -la unpackage/dist/dev/mp-weixin/cloudfunctions/ 2>/dev/null || echo "目录不存在或为空"
