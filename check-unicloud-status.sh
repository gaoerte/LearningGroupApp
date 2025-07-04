#!/bin/bash
# uniCloud 状态检测脚本

echo "🔍 检测 uniCloud 配置状态..."

# 检查项目结构
echo "📁 项目结构检查:"
if [ -d "uniCloud-aliyun" ]; then
    echo "✅ uniCloud-aliyun 目录存在"
    echo "   云函数数量: $(ls uniCloud-aliyun/cloudfunctions/ 2>/dev/null | wc -l)"
else
    echo "❌ uniCloud-aliyun 目录不存在"
fi

if [ -d "uniCloud-tcb" ]; then
    echo "✅ uniCloud-tcb 目录存在"
    echo "   云函数数量: $(ls uniCloud-tcb/cloudfunctions/ 2>/dev/null | wc -l)"
else
    echo "❌ uniCloud-tcb 目录不存在"
fi

# 检查 supabaseTest 云函数
echo ""
echo "🔧 supabaseTest 云函数检查:"
for provider in "aliyun" "tcb"; do
    func_path="uniCloud-${provider}/cloudfunctions/supabaseTest"
    if [ -d "$func_path" ]; then
        echo "✅ ${provider}: supabaseTest 存在"
        if [ -f "${func_path}/index.js" ]; then
            echo "   ✓ index.js 存在"
        else
            echo "   ❌ index.js 不存在"
        fi
        if [ -f "${func_path}/package.json" ]; then
            echo "   ✓ package.json 存在"
        else
            echo "   ❌ package.json 不存在"
        fi
    else
        echo "❌ ${provider}: supabaseTest 不存在"
    fi
done

# 检查配置文件
echo ""
echo "📋 配置文件检查:"
if [ -f "manifest.json" ]; then
    echo "✅ manifest.json 存在"
    if grep -q "uniCloud" manifest.json; then
        echo "   ✓ 包含 uniCloud 配置"
    else
        echo "   ⚠️ 可能缺少 uniCloud 配置"
    fi
else
    echo "❌ manifest.json 不存在"
fi

echo ""
echo "🎯 下一步操作建议:"
echo "1. 在 HBuilderX 中右键项目根目录"
echo "2. 选择 '关联云服务空间或项目'"
echo "3. 选择阿里云或腾讯云提供商"
echo "4. 右键 uniCloud-xxx/cloudfunctions/supabaseTest"
echo "5. 选择 '上传并运行'"
echo ""
echo "💡 提示:"
echo "- 如果是微信小程序，建议使用腾讯云 (uniCloud-tcb)"
echo "- 如果是多端应用，建议使用阿里云 (uniCloud-aliyun)"
