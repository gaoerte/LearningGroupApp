#!/bin/bash

# 云函数上传问题修复脚本
# 解决函数状态冲突和版本兼容问题

echo "🔧 开始修复云函数上传问题..."

# 1. 等待云函数状态恢复
echo "⏳ 等待云函数状态恢复（60秒）..."
sleep 60

# 2. 检查 package.json 中的 Node.js 版本配置
echo "📋 检查 Node.js 版本配置..."

CLOUD_FUNCTIONS_DIR="uniCloud-tcb/cloudfunctions"

if [ -d "$CLOUD_FUNCTIONS_DIR" ]; then
    echo "✅ 找到云函数目录: $CLOUD_FUNCTIONS_DIR"
    
    # 遍历所有云函数
    for func_dir in "$CLOUD_FUNCTIONS_DIR"/*; do
        if [ -d "$func_dir" ] && [ -f "$func_dir/package.json" ]; then
            func_name=$(basename "$func_dir")
            echo "🔍 检查函数: $func_name"
            
            # 检查是否有 engines 配置
            if grep -q '"engines"' "$func_dir/package.json"; then
                echo "  ✅ 已有 engines 配置"
            else
                echo "  ⚠️  缺少 engines 配置，正在添加..."
                
                # 备份原文件
                cp "$func_dir/package.json" "$func_dir/package.json.backup"
                
                # 添加 engines 配置（兼容云端 Node.js 16.13.1）
                node -e "
                const fs = require('fs');
                const pkg = JSON.parse(fs.readFileSync('$func_dir/package.json', 'utf8'));
                pkg.engines = pkg.engines || {};
                pkg.engines.node = '>=16.13.1';
                fs.writeFileSync('$func_dir/package.json', JSON.stringify(pkg, null, 2));
                "
                
                echo "  ✅ 已添加 Node.js 版本配置"
            fi
        fi
    done
else
    echo "❌ 未找到云函数目录: $CLOUD_FUNCTIONS_DIR"
    exit 1
fi

echo ""
echo "🎯 修复建议："
echo "1. 等待当前函数更新完成（通常1-2分钟）"
echo "2. 在 HBuilderX 中右键单个云函数上传，而不是全部上传"
echo "3. 如果仍有问题，可以在腾讯云控制台手动删除处于异常状态的函数"
echo "4. 所有 package.json 已配置兼容 Node.js 16.13.1"

echo ""
echo "🚀 建议的上传顺序："
echo "1. 先上传基础函数: learningGroupAPI"
echo "2. 再上传其他函数: supabaseProxy, userProfile 等"
echo "3. 每次上传间隔 30 秒"

echo ""
echo "✅ 修复脚本执行完成！"
