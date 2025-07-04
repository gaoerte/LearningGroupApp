#!/bin/bash

# 打卡功能诊断脚本
# 用于排查打卡功能的各种问题

echo "🔍 打卡功能诊断开始..."
echo "========================="

PROJECT_ROOT="/Users/sanshuifengyu/Documents/HBuilderProjects/LearningGroupApp"
cd "$PROJECT_ROOT"

echo ""
echo "📁 检查文件结构..."
echo "---------------------"

# 检查打卡相关文件是否存在
echo "✅ 检查打卡页面文件:"
if [ -f "pages/checkin/checkin.vue" ]; then
    echo "  ✓ checkin.vue 存在"
else
    echo "  ✗ checkin.vue 不存在"
fi

if [ -f "pages/checkin/checkin-simple.vue" ]; then
    echo "  ✓ checkin-simple.vue 存在"
else
    echo "  ✗ checkin-simple.vue 不存在"
fi

echo ""
echo "✅ 检查组件依赖:"
components=("ModernButton.vue" "ModernCard.vue" "ModernInput.vue" "Modal.vue")
for component in "${components[@]}"; do
    if [ -f "components/$component" ]; then
        echo "  ✓ $component 存在"
    else
        echo "  ✗ $component 不存在"
    fi
done

echo ""
echo "✅ 检查工具依赖:"
utils=("storage.js" "notification.js")
for util in "${utils[@]}"; do
    if [ -f "utils/$util" ]; then
        echo "  ✓ $util 存在"
    else
        echo "  ✗ $util 不存在"
    fi
done

echo ""
echo "📋 检查 pages.json 配置..."
echo "---------------------"
if grep -q "pages/checkin/checkin" pages.json; then
    echo "  ✓ checkin.vue 已配置"
else
    echo "  ✗ checkin.vue 未配置"
fi

if grep -q "pages/checkin/checkin-simple" pages.json; then
    echo "  ✓ checkin-simple.vue 已配置"
else
    echo "  ✗ checkin-simple.vue 未配置"
fi

echo ""
echo "🔍 检查语法错误..."
echo "---------------------"

# 检查主要文件是否有语法错误
echo "检查 checkin.vue:"
if command -v node >/dev/null 2>&1; then
    node -e "
    try {
      const fs = require('fs');
      const content = fs.readFileSync('pages/checkin/checkin.vue', 'utf8');
      
      // 检查基本的Vue结构
      if (!content.includes('<template>')) {
        console.log('  ✗ 缺少 <template> 标签');
      } else if (!content.includes('<script>')) {
        console.log('  ✗ 缺少 <script> 标签');
      } else if (!content.includes('<style>')) {
        console.log('  ✗ 缺少 <style> 标签');
      } else {
        console.log('  ✓ 基本结构完整');
      }
      
      // 检查方法定义
      if (content.includes('openCheckinModal()')) {
        console.log('  ✓ openCheckinModal 方法存在');
      } else {
        console.log('  ✗ openCheckinModal 方法不存在');
      }
      
      if (content.includes('@tap=\"openCheckinModal\"')) {
        console.log('  ✓ 按钮事件绑定存在');
      } else {
        console.log('  ✗ 按钮事件绑定不存在');
      }
      
    } catch (error) {
      console.log('  ✗ 文件读取失败:', error.message);
    }"
else
    echo "  ⚠️  无法检查语法（需要 Node.js）"
fi

echo ""
echo "🎯 检查打卡功能关键点..."
echo "---------------------"

# 检查关键方法
echo "检查关键方法定义:"
if grep -q "openCheckinModal" pages/checkin/checkin.vue; then
    echo "  ✓ openCheckinModal 方法已定义"
else
    echo "  ✗ openCheckinModal 方法未定义"
fi

if grep -q "submitCheckin" pages/checkin/checkin.vue; then
    echo "  ✓ submitCheckin 方法已定义"
else
    echo "  ✗ submitCheckin 方法未定义"
fi

if grep -q "isModalVisible" pages/checkin/checkin.vue; then
    echo "  ✓ isModalVisible 状态已定义"
else
    echo "  ✗ isModalVisible 状态未定义"
fi

echo ""
echo "检查事件绑定:"
if grep -q "@tap=\"openCheckinModal\"" pages/checkin/checkin.vue; then
    echo "  ✓ 按钮点击事件已绑定"
else
    echo "  ✗ 按钮点击事件未绑定"
fi

if grep -q "v-if=\"isModalVisible\"" pages/checkin/checkin.vue; then
    echo "  ✓ 弹窗显示条件已设置"
else
    echo "  ✗ 弹窗显示条件未设置"
fi

echo ""
echo "📱 生成测试建议..."
echo "---------------------"
echo "1. 在 HBuilderX 中运行项目，打开调试面板查看控制台输出"
echo "2. 访问首页 → 点击'打卡功能测试'按钮测试简化版本"
echo "3. 访问打卡页面，检查按钮是否可点击"
echo "4. 点击'开始打卡'时观察控制台日志输出"
echo "5. 如果弹窗不显示，检查 isModalVisible 状态变化"

echo ""
echo "🚀 快速修复建议..."
echo "---------------------"
echo "如果按钮无法点击，可能的原因:"
echo "• 按钮被 CSS 样式覆盖（z-index 问题）"
echo "• 按钮被其他元素遮挡"
echo "• 事件绑定错误或方法未定义"
echo "• isSubmitting 状态导致按钮禁用"
echo "• todayChecked 状态导致按钮隐藏"

echo ""
echo "🔧 调试命令:"
echo "• 在 HBuilderX 控制台运行: console.log('按钮点击测试')"
echo "• 检查元素: 右键检查按钮元素的 CSS 和事件监听"
echo "• 手动设置状态: this.isModalVisible = true"

echo ""
echo "========================="
echo "🎉 诊断完成！请根据上述信息进行调试。"
echo ""
