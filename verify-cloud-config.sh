#!/bin/bash

echo "✅ 云开发环境ID配置验证"
echo "========================"
echo ""

ENV_ID="cloud1-5gefd2w950febab8"

echo "🎯 目标环境ID: $ENV_ID"
echo ""

# 检查 config/cloud.js
echo "📁 检查 config/cloud.js:"
if grep -q "$ENV_ID" config/cloud.js; then
  echo "   ✅ 环境ID配置正确"
else
  echo "   ❌ 环境ID配置错误或缺失"
fi

# 检查 manifest.json
echo ""
echo "📁 检查 manifest.json:"
if grep -q "$ENV_ID" manifest.json; then
  echo "   ✅ 环境ID配置正确"
else
  echo "   ❌ 环境ID配置错误或缺失"
fi

echo ""
echo "🚀 下一步操作:"
echo "1. 重新运行项目: npm run dev:mp-weixin"
echo "2. 检查控制台输出应显示:"
echo "   [App] 云开发初始化成功"
echo "   [Cloud] 云开发初始化成功, 环境ID: $ENV_ID"
echo ""
echo "3. 尝试登录功能，应该不再出现 'wx.cloud.init first' 错误"
echo ""
echo "📋 如果仍有问题:"
echo "- 确认云开发环境已开通"
echo "- 检查网络连接"
echo "- 确认小程序 appid 与云开发环境匹配"
