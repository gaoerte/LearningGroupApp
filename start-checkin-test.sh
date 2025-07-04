#!/bin/bash

# 打卡功能快速测试脚本
echo "🚀 启动打卡功能测试..."
echo "========================="

PROJECT_ROOT="/Users/sanshuifengyu/Documents/HBuilderProjects/LearningGroupApp"
cd "$PROJECT_ROOT"

echo ""
echo "📋 测试前检查..."
echo "---------------------"

# 检查关键文件
if [ -f "pages/checkin/checkin.vue" ] && [ -f "pages/checkin/checkin-simple.vue" ]; then
    echo "✅ 打卡页面文件齐全"
else
    echo "❌ 打卡页面文件缺失"
    exit 1
fi

# 检查组件
if [ -f "components/ModernButton.vue" ] && [ -f "components/Modal.vue" ]; then
    echo "✅ 组件文件齐全"
else
    echo "❌ 组件文件缺失"
    exit 1
fi

echo ""
echo "🎯 测试步骤指南..."
echo "---------------------"
echo "请按照以下步骤测试打卡功能："
echo ""
echo "1️⃣ 在 HBuilderX 中运行项目"
echo "   - 点击运行按钮"
echo "   - 选择运行到浏览器或微信开发者工具"
echo ""
echo "2️⃣ 测试简化版（推荐先测试）"
echo "   - 访问首页"
echo "   - 点击调试区域的'✅ 打卡功能测试'按钮"
echo "   - 在简化版页面测试基本功能"
echo ""
echo "3️⃣ 测试完整版"
echo "   - 访问首页"
echo "   - 点击'学习打卡'进入完整版页面"
echo "   - 尝试点击'开始打卡'按钮"
echo "   - 如果不行，尝试点击'备用按钮：开始打卡'"
echo ""
echo "4️⃣ 观察调试信息"
echo "   - 打开浏览器开发者工具（F12）"
echo "   - 查看 Console 控制台输出"
echo "   - 观察页面上的调试信息显示"
echo ""
echo "5️⃣ 功能测试"
echo "   - 点击按钮后应该出现弹窗"
echo "   - 填写学习内容"
echo "   - 点击'完成打卡'提交"
echo "   - 查看成功提示和状态更新"

echo ""
echo "🔍 问题排查..."
echo "---------------------"
echo "如果遇到问题，请检查："
echo ""
echo "▶️ 按钮无法点击："
echo "   - 检查是否已登录（首页有'设置Token'按钮）"
echo "   - 查看页面调试信息：todayChecked 应该为 false"
echo "   - 尝试使用备用按钮"
echo ""
echo "▶️ 弹窗不显示："
echo "   - 查看控制台是否有错误信息"
echo "   - 检查 isModalVisible 状态变化"
echo "   - 尝试简化版页面"
echo ""
echo "▶️ 提交失败："
echo "   - 确保填写了学习内容"
echo "   - 查看网络请求状态"
echo "   - 检查本地存储权限"

echo ""
echo "📞 技术支持..."
echo "---------------------"
echo "如果问题仍然存在，请提供以下信息："
echo "• 浏览器类型和版本"
echo "• 控制台错误信息截图"
echo "• 具体操作步骤和现象描述"
echo "• 页面调试信息的值"

echo ""
echo "🎉 测试准备完成！"
echo "现在可以开始测试打卡功能了。"
echo "祝测试顺利！ 💪"
echo ""
