#!/bin/bash

echo "☁️  云函数部署检查助手"
echo "====================="
echo ""

echo "📋 检查云函数目录结构:"
for dir in cloudfunctions/*/; do
  if [ -d "$dir" ]; then
    funcname=$(basename "$dir")
    if [ "$funcname" != "README.md" ] && [ "$funcname" != ".env" ]; then
      echo "🔹 云函数: $funcname"
      
      # 检查必要文件
      if [ -f "${dir}index.js" ]; then
        echo "   ✅ index.js 存在"
      else
        echo "   ❌ index.js 缺失"
      fi
      
      if [ -f "${dir}package.json" ]; then
        echo "   ✅ package.json 存在"
      else
        echo "   ❌ package.json 缺失"
      fi
      
      # 检查依赖
      if [ -d "${dir}node_modules" ]; then
        echo "   ✅ 依赖已安装"
      else
        echo "   ⚠️  依赖未安装"
      fi
    fi
  fi
done

echo ""
echo "🚀 云函数部署步骤:"
echo "1. 在微信开发者工具中打开项目"
echo "2. 右键点击 cloudfunctions 目录"
echo "3. 选择 '上传并部署：云端安装依赖'"
echo "4. 等待所有云函数部署完成"
echo ""
echo "📋 测试云函数:"
echo "1. 在微信开发者工具的云开发控制台中"
echo "2. 进入云函数管理页面"
echo "3. 点击 'supabaseCore' 云函数"
echo "4. 在测试标签页中输入测试数据:"
echo '   {"action": "test", "data": {}}'
echo "5. 点击测试，查看返回结果"
echo ""
echo "⚠️  如果云函数超时:"
echo "- 检查网络连接"
echo "- 确认 Supabase 配置正确"
echo "- 考虑优化云函数代码"
echo "- 增加云函数超时时间（已调整到20秒）"
