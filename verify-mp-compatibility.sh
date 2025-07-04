#!/bin/bash
# verify-mp-compatibility.sh - 验证微信小程序兼容性修复

echo "=== 微信小程序兼容性修复验证 ==="
echo

# 项目根目录
PROJECT_ROOT="/Users/sanshuifengyu/Documents/HBuilderProjects/LearningGroupApp"
cd "$PROJECT_ROOT"

echo "📍 当前目录: $(pwd)"
echo

# 1. 检查 package.json 依赖
echo "1️⃣ 检查 package.json 依赖..."
if grep -q "@supabase/supabase-js" package.json; then
    echo "❌ 仍然包含 @supabase/supabase-js 依赖"
else
    echo "✅ 已移除 @supabase/supabase-js 依赖"
fi
echo

# 2. 检查是否存在 mp-compatible-chat.js
echo "2️⃣ 检查小程序兼容的聊天客户端..."
if [ -f "utils/mp-compatible-chat.js" ]; then
    echo "✅ mp-compatible-chat.js 存在"
    echo "   文件大小: $(wc -c < utils/mp-compatible-chat.js) 字节"
else
    echo "❌ mp-compatible-chat.js 不存在"
fi
echo

# 3. 检查 chatAPI.js 导入
echo "3️⃣ 检查 chatAPI.js 导入..."
if grep -q "mp-compatible-chat" api/chatAPI.js; then
    echo "✅ chatAPI.js 已更新使用 mp-compatible-chat"
else
    echo "❌ chatAPI.js 仍使用旧的导入"
fi
echo

# 4. 检查云函数
echo "4️⃣ 检查新的云函数..."
if [ -d "cloudfunctions/getGroupMessages" ]; then
    echo "✅ getGroupMessages 云函数存在"
else
    echo "❌ getGroupMessages 云函数不存在"
fi

if [ -d "cloudfunctions/sendMessage" ]; then
    echo "✅ sendMessage 云函数存在"
else
    echo "❌ sendMessage 云函数不存在"
fi
echo

# 5. 检查 chat-demo.vue 页面
echo "5️⃣ 检查 chat-demo.vue 页面..."
if [ -f "pages/chat-demo/chat-demo.vue" ]; then
    echo "✅ chat-demo.vue 存在"
    if grep -q "mp-compatible-chat" pages/chat-demo/chat-demo.vue; then
        echo "❌ chat-demo.vue 仍包含旧的导入"
    else
        echo "✅ chat-demo.vue 已更新"
    fi
else
    echo "❌ chat-demo.vue 不存在"
fi
echo

# 6. 检查是否有残留的 Supabase 导入
echo "6️⃣ 检查残留的 Supabase 导入..."
SUPABASE_FILES=$(grep -r "@supabase/supabase-js" --include="*.js" --include="*.vue" --exclude-dir=node_modules --exclude-dir=unpackage --exclude="*.backup" . 2>/dev/null | grep -v cloudfunctions | wc -l)
if [ "$SUPABASE_FILES" -gt 0 ]; then
    echo "❌ 发现 $SUPABASE_FILES 个文件仍包含 Supabase 导入:"
    grep -r "@supabase/supabase-js" --include="*.js" --include="*.vue" --exclude-dir=node_modules --exclude-dir=unpackage --exclude="*.backup" . 2>/dev/null | grep -v cloudfunctions
else
    echo "✅ 前端文件已完全移除 Supabase 依赖"
fi
echo

# 7. 检查备份文件
echo "7️⃣ 检查备份文件..."
BACKUP_COUNT=$(find . -name "*.backup" 2>/dev/null | wc -l)
echo "📁 备份文件数量: $BACKUP_COUNT"
if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "   备份文件列表:"
    find . -name "*.backup" 2>/dev/null | sed 's/^/   - /'
fi
echo

# 8. 检查 pages.json 中的 chat-demo 页面注册
echo "8️⃣ 检查页面注册..."
if grep -q "chat-demo" pages.json; then
    echo "✅ chat-demo 页面已在 pages.json 中注册"
else
    echo "⚠️  chat-demo 页面未在 pages.json 中注册"
fi
echo

echo "=== 验证完成 ==="
echo "📋 下一步操作建议:"
echo "   1. 在 HBuilderX 中重新编译项目"
echo "   2. 在微信开发者工具中上传并部署新的云函数"
echo "   3. 测试聊天功能是否正常工作"
echo "   4. 如果仍有错误，检查控制台输出"
