#!/bin/bash
# 云函数自动复制脚本 - 在 HBuilderX 构建前运行

echo "🔧 检测构建环境并复制云函数..."

# 检查是否存在开发构建目录
if [ -d "unpackage/dist/dev/mp-weixin" ]; then
    TARGET_DIR="unpackage/dist/dev/mp-weixin/cloudfunctions"
    echo "📁 发现开发构建，复制到: $TARGET_DIR"
elif [ -d "unpackage/dist/build/mp-weixin" ]; then
    TARGET_DIR="unpackage/dist/build/mp-weixin/cloudfunctions"
    echo "📁 发现生产构建，复制到: $TARGET_DIR"
else
    # 默认复制到开发目录
    TARGET_DIR="unpackage/dist/dev/mp-weixin/cloudfunctions"
    echo "📁 创建开发构建目录，复制到: $TARGET_DIR"
fi

# 创建目标目录
mkdir -p "$TARGET_DIR"

# 复制云函数
if [ -d "cloudfunctions" ]; then
    echo "📦 复制云函数文件..."
    rsync -av --delete "cloudfunctions/" "$TARGET_DIR/"
    echo "✅ 云函数复制完成！"
    echo ""
    echo "📋 已复制的云函数："
    ls -la "$TARGET_DIR"
else
    echo "❌ 云函数目录不存在: cloudfunctions"
    exit 1
fi
