#!/bin/bash

echo "🔧 云函数显示修复工具"
echo "========================"
echo ""

echo "📋 1. 检查云函数目录结构："
if [ -d "cloudfunctions" ]; then
  echo "✅ cloudfunctions 目录存在"
  echo "   云函数列表："
  ls -la cloudfunctions/ | grep "^d" | awk '{print "   - " $9}' | grep -v "^\s*- \.$" | grep -v "^\s*- \.\.$"
else
  echo "❌ cloudfunctions 目录不存在"
fi
echo ""

echo "📋 2. 检查配置文件："
if grep -q "cloudfunctionRoot" manifest.json 2>/dev/null; then
  echo "✅ manifest.json 云函数配置存在"
  grep "cloudfunctionRoot" manifest.json
else
  echo "❌ manifest.json 云函数配置缺失"
fi

if grep -q "cloudfunctionRoot" project.config.json 2>/dev/null; then
  echo "✅ project.config.json 云函数配置存在"
  grep "cloudfunctionRoot" project.config.json
else
  echo "❌ project.config.json 云函数配置缺失"
fi
echo ""

echo "📋 3. 检查云函数完整性："
for dir in cloudfunctions/*/; do
  if [ -d "$dir" ]; then
    funcname=$(basename "$dir")
    if [ "$funcname" != "README.md" ] && [ "$funcname" != ".env" ]; then
      echo "   云函数: $funcname"
      if [ -f "${dir}index.js" ]; then
        echo "     ✅ index.js 存在"
      else
        echo "     ❌ index.js 缺失"
      fi
      if [ -f "${dir}package.json" ]; then
        echo "     ✅ package.json 存在"
      else
        echo "     ❌ package.json 缺失"
      fi
    fi
  fi
done
echo ""

echo "🚀 解决方案："
echo "如果云函数在 HBuilderX 中仍不可见，请尝试："
echo "1. 关闭 HBuilderX"
echo "2. 重新用 HBuilderX 打开项目根目录"
echo "3. 确保项目类型识别为 '微信小程序'"
echo "4. 检查 HBuilderX 左侧项目面板是否显示云函数节点"
echo ""
echo "如果仍有问题，可能需要："
echo "- 在 HBuilderX 中右键项目 -> 重新识别项目类型"
echo "- 或者转换回 uni-app x（支持更好的云函数集成）"
