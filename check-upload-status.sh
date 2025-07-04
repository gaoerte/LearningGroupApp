#!/bin/bash
# 云函数上传状态检查脚本

echo "🔍 检查云函数上传状态..."
echo "=================================================="

# 检查项目结构
echo "📁 项目结构检查:"
echo ""

if [ -d "uniCloud-aliyun" ]; then
    echo "✅ uniCloud-aliyun (阿里云)"
    if [ -d "uniCloud-aliyun/cloudfunctions/supabaseTest" ]; then
        echo "   ✓ supabaseTest 云函数存在"
        if [ -f "uniCloud-aliyun/cloudfunctions/supabaseTest/package.json" ]; then
            echo "   ✓ package.json 配置文件存在"
        fi
    else
        echo "   ❌ supabaseTest 云函数不存在"
    fi
    echo ""
fi

if [ -d "uniCloud-tcb" ]; then
    echo "✅ uniCloud-tcb (腾讯云)"
    if [ -d "uniCloud-tcb/cloudfunctions/supabaseTest" ]; then
        echo "   ✓ supabaseTest 云函数存在"
        if [ -f "uniCloud-tcb/cloudfunctions/supabaseTest/package.json" ]; then
            echo "   ✓ package.json 配置文件存在"
        fi
    else
        echo "   ❌ supabaseTest 云函数不存在"
    fi
    echo ""
fi

echo "=================================================="
echo "🎯 上传步骤提醒:"
echo ""
echo "1️⃣  在 HBuilderX 中打开项目"
echo "2️⃣  展开 uniCloud-xxx/cloudfunctions/"
echo "3️⃣  右键点击 'supabaseTest' 文件夹"
echo "4️⃣  选择 '上传并运行'"
echo "5️⃣  等待上传完成（可能需要几分钟）"
echo ""
echo "=================================================="
echo "✅ 上传成功标志:"
echo "   - HBuilderX 控制台显示 '上传成功'"
echo "   - 可以在 uniCloud 控制台看到云函数"
echo "   - 测试调用返回正确结果"
echo ""
echo "🔗 测试方法:"
echo "   运行项目 → 进入聊天页面 → 点击 🔗 按钮"
echo ""
