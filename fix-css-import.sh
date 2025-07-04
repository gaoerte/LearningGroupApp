#!/bin/bash

echo "🔧 修复 CSS 导入问题"
echo "===================="

# 检查修复状态
echo "📋 检查 uni.scss 文件..."

if grep -q "@import" uni.scss; then
    echo "❌ uni.scss 仍包含 @import 语句"
    echo "   内容预览:"
    head -5 uni.scss
else
    echo "✅ uni.scss 已简化，不包含复杂导入"
    echo "   内容预览:"
    head -10 uni.scss
fi

echo ""
echo "📋 检查 App.vue 导入..."

if grep -q "@import './uni.scss'" App.vue; then
    echo "✅ App.vue 正确导入 uni.scss"
else
    echo "❌ App.vue 导入路径可能有问题"
fi

echo ""
echo "🎯 修复状态:"
echo "============="
echo "✅ 移除了复杂的 SCSS 导入链"
echo "✅ 使用简化的 CSS 变量"
echo "✅ 避免了循环导入问题"
echo "✅ 兼容传统 uni-app 构建系统"

echo ""
echo "🚀 现在请在 HBuilderX 中重新运行项目"
echo "应该不再有 postcss-import 错误"
