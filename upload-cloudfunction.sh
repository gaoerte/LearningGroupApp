#!/bin/bash
# 云函数上传脚本

echo "🚀 开始上传云函数..."

# 检查 HBuilderX CLI 是否可用
if ! command -v hx &> /dev/null; then
    echo "❌ HBuilderX CLI 不可用，请使用图形界面上传"
    echo "📋 手动上传步骤："
    echo "1. 在 HBuilderX 中右键 uniCloud-xxx/cloudfunctions/supabaseTest"
    echo "2. 选择 '上传并运行'"
    echo "3. 等待上传完成"
    exit 1
fi

# 上传云函数
echo "📤 上传 supabaseTest 云函数..."
hx unicloud function deploy supabaseTest

echo "✅ 上传完成！"
