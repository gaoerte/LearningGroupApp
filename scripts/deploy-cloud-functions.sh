#!/bin/bash

# 云函数部署辅助脚本
echo "🚀 云函数部署辅助工具"
echo "========================"

# 检查项目结构
if [ ! -d "cloudfunctions" ]; then
    echo "❌ 错误：未找到 cloudfunctions 目录"
    echo "请确保在项目根目录下运行此脚本"
    exit 1
fi

echo "✅ 找到云函数目录"

# 列出可用的云函数
echo ""
echo "📁 可用的云函数："
for dir in cloudfunctions/*/; do
    if [ -d "$dir" ]; then
        func_name=$(basename "$dir")
        echo "  - $func_name"
    fi
done

echo ""
echo "🔧 部署步骤："
echo "1. 在微信开发者工具中打开此项目"
echo "2. 确保已开通云开发环境"
echo "3. 右键点击要部署的云函数文件夹"
echo "4. 选择 '上传并部署：云端安装依赖'"
echo ""

# 检查简化版云函数
if [ -d "cloudfunctions/supabaseProxySimple" ]; then
    echo "💡 建议先部署: supabaseProxySimple (简化版，成功率更高)"
fi

# 检查完整版云函数
if [ -d "cloudfunctions/supabaseProxy" ]; then
    echo "💡 然后部署: supabaseProxy (完整版功能)"
fi

echo ""
echo "📖 详细指南请查看: docs/CLOUD_FUNCTION_DEPLOYMENT.md"
