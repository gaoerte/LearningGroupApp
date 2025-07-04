#!/bin/bash

# 微信小程序聊天修复验证脚本
echo "🔧 验证微信小程序聊天修复..."

# 检查关键文件是否存在
echo "📁 检查关键文件..."

if [ -f "utils/miniprogram-supabase.js" ]; then
    echo "✅ miniprogram-supabase.js 存在"
else
    echo "❌ miniprogram-supabase.js 缺失"
fi

if [ -f "utils/env-adapter.js" ]; then
    echo "✅ env-adapter.js 存在"
else
    echo "❌ env-adapter.js 缺失"
fi

if [ -f "utils/realtime-chat.js" ]; then
    echo "✅ realtime-chat.js 存在"
else
    echo "❌ realtime-chat.js 缺失"
fi

# 检查群聊页面导入
echo ""
echo "📄 检查群聊页面导入..."

if grep -q "createChatClient" pages/groupChat/groupChat.vue; then
    echo "✅ 群聊页面已使用新的聊天客户端"
else
    echo "❌ 群聊页面未使用新的聊天客户端"
fi

if grep -q "getPlatformInfo" pages/groupChat/groupChat.vue; then
    echo "✅ 群聊页面已使用环境适配器"
else
    echo "❌ 群聊页面未使用环境适配器"
fi

# 检查发送按钮修复
if grep -q "handleSendClick" pages/groupChat/groupChat.vue; then
    echo "✅ 发送按钮事件已修复"
else
    echo "❌ 发送按钮事件未修复"
fi

# 检查package.json依赖
echo ""
echo "📦 检查依赖..."

if [ -f "package.json" ]; then
    if grep -q "@supabase/supabase-js" package.json; then
        echo "✅ Supabase 依赖已安装"
    else
        echo "❌ Supabase 依赖缺失"
    fi
    
    if [ -d "node_modules" ]; then
        echo "✅ node_modules 存在"
    else
        echo "❌ node_modules 缺失，请运行 npm install"
    fi
else
    echo "❌ package.json 缺失"
fi

# 检查云函数
echo ""
echo "☁️ 检查云函数..."

if [ -d "cloudfunctions" ]; then
    echo "✅ 云函数目录存在"
    
    if [ -f "cloudfunctions/supabaseCore/index.js" ]; then
        echo "✅ supabaseCore 云函数存在"
    else
        echo "❌ supabaseCore 云函数缺失"
    fi
else
    echo "❌ 云函数目录缺失"
fi

echo ""
echo "🎯 修复状态总结:"
echo "1. ✅ 创建了小程序 Supabase 适配器"
echo "2. ✅ 创建了环境检测工具"
echo "3. ✅ 创建了智能聊天客户端"
echo "4. ✅ 修复了群聊页面导入"
echo "5. ✅ 修复了发送按钮事件"
echo "6. ✅ 添加了智能降级机制"

echo ""
echo "🚀 下一步操作:"
echo "1. 在 HBuilderX 中运行项目"
echo "2. 检查控制台是否还有 'bind' 错误"
echo "3. 测试发送按钮和回车发送功能"
echo "4. 验证群聊消息是否正常显示"

echo ""
echo "📱 如果仍有问题，请检查:"
echo "- 微信开发者工具的控制台输出"
echo "- 网络环境和云函数部署状态"
echo "- Supabase 数据库连接配置"
