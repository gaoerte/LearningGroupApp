#!/bin/bash

# 云函数快速部署和测试脚本
# ==============================

echo "🚀 开始部署和测试云函数..."
echo "==============================="

# 进入项目根目录
cd /Users/sanshuifengyu/Documents/HBuilderProjects/LearningGroupApp

echo ""
echo "📁 当前目录: $(pwd)"
echo "📋 检查云函数文件..."

# 检查云函数文件是否存在
if [ -f "cloudfunctions/supabaseCore/index.js" ]; then
    echo "✅ 云函数文件存在"
    echo "📊 文件大小: $(wc -l < cloudfunctions/supabaseCore/index.js) 行"
else
    echo "❌ 云函数文件不存在"
    exit 1
fi

echo ""
echo "🔍 检查关键函数..."

# 检查关键函数是否存在
functions=("findOrCreateUser" "wechatLogin" "quickLogin" "simpleTest")
for func in "${functions[@]}"; do
    if grep -q "function $func" cloudfunctions/supabaseCore/index.js; then
        echo "✅ $func 函数存在"
    else
        echo "❌ $func 函数缺失"
    fi
done

echo ""
echo "🧪 建议的测试步骤："
echo "1. 在 HBuilderX 中右键点击 cloudfunctions/supabaseCore 文件夹"
echo "2. 选择 '上传并部署云函数'"
echo "3. 等待部署完成"
echo "4. 在登录页面测试快速登录功能"
echo "5. 检查控制台日志确认新版本已部署"

echo ""
echo "🔧 如果仍然出现错误，请尝试："
echo "• 清理浏览器缓存"
echo "• 重新编译小程序"
echo "• 检查云函数版本号是否为 2.0.0-fixed"

echo ""
echo "✅ 检查完成！"
echo "==============================="
