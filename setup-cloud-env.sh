#!/bin/bash

echo "🔧 云开发配置助手"
echo "================"
echo ""

echo "📋 当前配置状态："

# 检查 config/cloud.js 中的环境ID
if [ -f "config/cloud.js" ]; then
  current_env=$(grep -o "envId: '[^']*'" config/cloud.js | cut -d"'" -f2)
  echo "✅ config/cloud.js 当前环境ID: $current_env"
else
  echo "❌ config/cloud.js 文件不存在"
fi

# 检查 manifest.json 中的环境ID
if [ -f "manifest.json" ]; then
  manifest_env=$(grep -A1 "cloudDevelopment" manifest.json | grep "env" | cut -d'"' -f4)
  echo "✅ manifest.json 当前环境ID: $manifest_env"
else
  echo "❌ manifest.json 文件不存在"
fi

echo ""
echo "🔍 如何获取正确的环境ID："
echo "1. 在微信开发者工具中打开项目"
echo "2. 点击顶部菜单的 '云开发'"
echo "3. 在云开发控制台左上角查看环境ID"
echo "4. 环境ID格式通常为: xxxx-xxxxxxxxxxxxx"
echo ""

# 提供交互式配置选项
read -p "是否要修改环境ID？(y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
  read -p "请输入你的云开发环境ID: " new_env_id
  
  if [ ! -z "$new_env_id" ]; then
    echo ""
    echo "🔄 更新配置文件..."
    
    # 更新 config/cloud.js
    if [ -f "config/cloud.js" ]; then
      sed -i.bak "s/envId: '[^']*'/envId: '$new_env_id'/" config/cloud.js
      echo "✅ 已更新 config/cloud.js"
    fi
    
    # 更新 manifest.json  
    if [ -f "manifest.json" ]; then
      sed -i.bak "s/\"env\": \"[^\"]*\"/\"env\": \"$new_env_id\"/" manifest.json
      echo "✅ 已更新 manifest.json"
    fi
    
    echo ""
    echo "🎉 配置更新完成！"
    echo "新环境ID: $new_env_id"
    echo ""
    echo "📋 下一步："
    echo "1. 重新运行项目: npm run dev:mp-weixin"
    echo "2. 检查控制台是否显示: [App] 云开发初始化成功"
    echo "3. 如果仍有问题，请检查环境ID是否正确"
  else
    echo "❌ 环境ID不能为空"
  fi
else
  echo "操作已取消"
fi

echo ""
echo "📚 更多帮助请查看: docs/CLOUD_SETUP.md"
