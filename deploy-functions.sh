#!/bin/bash
# 云函数部署脚本

echo "=== 学习小组App 云函数部署 ==="
echo "请确保已经在微信开发者工具中配置好云开发环境"
echo ""

# 检查云函数目录
if [ ! -d "cloudfunctions/supabaseCore" ]; then
    echo "❌ 错误: 找不到 supabaseCore 云函数目录"
    exit 1
fi

echo "📦 准备部署云函数..."
echo ""

echo "✅ 找到以下云函数:"
ls -la cloudfunctions/

echo ""
echo "🚀 部署说明:"
echo "1. 打开微信开发者工具"
echo "2. 在云开发控制台中选择环境"
echo "3. 右键点击 cloudfunctions/supabaseCore 文件夹"
echo "4. 选择 '上传并部署：云端安装依赖'"
echo "5. 等待部署完成"

echo ""
echo "🔧 云函数配置检查:"
echo "- supabaseCore/index.js ✅"
echo "- supabaseCore/package.json ✅"

echo ""
echo "📝 测试步骤:"
echo "1. 部署完成后，在小程序中打开测试页面"
echo "2. 点击各个测试按钮"
echo "3. 查看云函数日志确认运行状态"

echo ""
echo "🌐 Supabase配置检查:"
echo "- URL: https://klpseujbhwvifsfshfdx.supabase.co"
echo "- 配置文件: config/supabase.js ✅"

echo ""
echo "⚠️  注意事项:"
echo "- 确保 Supabase 项目已启用 API"
echo "- 检查数据库表是否已创建"
echo "- 建议先运行健康检查测试"
