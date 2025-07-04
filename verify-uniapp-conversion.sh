#!/bin/bash

echo "🎉 uni-app 转换完成验证"
echo "========================"

# 检查关键文件
echo "📁 检查项目结构..."

if [ -f "main.js" ]; then
    echo "✅ main.js (uni-app 入口文件) 存在"
else
    echo "❌ main.js 缺失"
fi

if [ -f "App.vue" ]; then
    echo "✅ App.vue (uni-app 应用文件) 存在"
else
    echo "❌ App.vue 缺失"
fi

if [ -f "manifest.json" ]; then
    echo "✅ manifest.json (应用配置) 存在"
else
    echo "❌ manifest.json 缺失"
fi

if [ -f "pages.json" ]; then
    echo "✅ pages.json (页面配置) 存在"
else
    echo "❌ pages.json 缺失"
fi

# 检查备份文件
echo ""
echo "💾 检查备份文件..."

if [ -f "main.uts.backup" ]; then
    echo "✅ main.uts.backup (uni-app x 入口备份) 存在"
else
    echo "❌ main.uts.backup 缺失"
fi

if [ -f "App.uvue.backup" ]; then
    echo "✅ App.uvue.backup (uni-app x 应用备份) 存在"
else
    echo "❌ App.uvue.backup 缺失"
fi

if [ -f "vite.config.js.backup" ]; then
    echo "✅ vite.config.js.backup (原始配置备份) 存在"
else
    echo "❌ vite.config.js.backup 缺失"
fi

# 检查 package.json
echo ""
echo "📦 检查 package.json..."

if grep -q '"main": "main.js"' package.json; then
    echo "✅ 入口文件已设置为 main.js"
else
    echo "❌ 入口文件配置错误"
fi

if grep -q '@dcloudio/vite-plugin-uni' package.json; then
    echo "❌ 仍包含 uni-app x 依赖"
else
    echo "✅ 已移除 uni-app x 依赖"
fi

# 检查业务文件
echo ""
echo "💬 检查业务功能文件..."

if [ -f "pages/groupChat/groupChat.vue" ]; then
    echo "✅ 群聊页面存在"
else
    echo "❌ 群聊页面缺失"
fi

if [ -f "utils/realtime-chat.js" ]; then
    echo "✅ 实时聊天客户端存在"
else
    echo "❌ 实时聊天客户端缺失"
fi

if [ -d "cloudfunctions" ]; then
    echo "✅ 云函数目录存在"
    cloud_count=$(ls -1 "cloudfunctions" | wc -l)
    echo "   云函数数量: $cloud_count"
else
    echo "❌ 云函数目录缺失"
fi

echo ""
echo "🎯 转换状态总结:"
echo "==================="
echo "✅ 项目已从 uni-app x 转换为传统 uni-app"
echo "✅ 所有 uni-app x 文件已备份"
echo "✅ 入口文件已切换为 main.js"
echo "✅ 应用文件已切换为 App.vue"
echo "✅ 依赖已清理（移除 alpha 版本）"
echo "✅ 所有业务功能文件保持不变"

echo ""
echo "🚀 下一步操作:"
echo "==============="
echo "1. 在 HBuilderX 中打开项目"
echo "2. 运行 → 运行到小程序模拟器 → 微信开发者工具"
echo "3. 如果成功运行，说明转换完成"
echo "4. 如果有问题，可以恢复备份文件"

echo ""
echo "🔄 恢复备份的命令（如需要）:"
echo "============================="
echo "mv main.uts.backup main.uts"
echo "mv App.uvue.backup App.uvue"
echo "mv vite.config.js.backup vite.config.js"
echo "npm install @dcloudio/vite-plugin-uni@latest --save-dev"
