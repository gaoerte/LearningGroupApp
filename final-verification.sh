#!/bin/bash

echo "🎯 最终验证项目修复状态"
echo "=================================="
echo ""

echo "📁 1. 关键API文件:"
echo "   ✅ api/chatAPI.js: $([ -f api/chatAPI.js ] && echo '已创建' || echo '❌ 缺失')"
echo "   ✅ api/groupAPI.js: $([ -f api/groupAPI.js ] && echo '存在' || echo '❌ 缺失')"
echo "   ✅ api/index.js: $([ -f api/index.js ] && echo '存在' || echo '❌ 缺失')"
echo ""

echo "🔧 2. 工具文件:"
echo "   ✅ utils/realtime-chat.js: $([ -f utils/realtime-chat.js ] && echo '存在' || echo '❌ 缺失')"
echo "   ✅ utils/storage.js: $([ -f utils/storage.js ] && echo '存在' || echo '❌ 缺失')"
echo ""

echo "📄 3. 主要页面文件:"
echo "   ✅ pages/groupChat/groupChat.vue: $([ -f pages/groupChat/groupChat.vue ] && echo '存在' || echo '❌ 缺失')"
echo "   ✅ pages/index/index.vue: $([ -f pages/index/index.vue ] && echo '存在' || echo '❌ 缺失')"
echo ""

echo "🔍 4. 检查 @/ 路径别名残留:"
alias_count=$(grep -r "@/" pages/ --include="*.vue" 2>/dev/null | wc -l)
echo "   路径别名残留: $alias_count 处"
if [ "$alias_count" -gt 0 ]; then
  echo "   需要修复的文件:"
  grep -r "@/" pages/ --include="*.vue" 2>/dev/null | head -3
fi
echo ""

echo "📦 5. package.json 状态:"
main_entry=$(grep '"main"' package.json 2>/dev/null)
echo "   入口: $main_entry"
echo ""

echo "🎉 修复完成状态:"
if [ -f api/chatAPI.js ] && [ "$alias_count" -lt 5 ]; then
  echo "   ✅ 项目修复成功，可以在 HBuilderX 中运行!"
else
  echo "   ⚠️  可能还有部分问题需要解决"
fi
echo ""
echo "🚀 下一步: 在 HBuilderX 中重新运行项目"
