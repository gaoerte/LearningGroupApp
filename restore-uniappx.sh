#!/bin/bash

echo "🔄 一键恢复 uni-app x"
echo "===================="
echo ""

if [ -f "main.uts.backup" ] && [ -f "App.uvue.backup" ]; then
  echo "📋 检测到 uni-app x 备份文件"
  echo ""
  
  echo "🔄 恢复操作："
  echo "1. 恢复 main.uts"
  mv main.uts.backup main.uts
  echo "   ✅ main.uts 已恢复"
  
  echo "2. 恢复 App.uvue"  
  mv App.uvue.backup App.uvue
  echo "   ✅ App.uvue 已恢复"
  
  echo "3. 恢复 vite.config.js"
  if [ -f "vite.config.js.backup" ]; then
    mv vite.config.js.backup vite.config.js
    echo "   ✅ vite.config.js 已恢复"
  fi
  
  echo "4. 备份传统 uni-app 文件"
  if [ -f "main.js" ]; then
    mv main.js main.js.backup
    echo "   ✅ main.js 已备份"
  fi
  
  if [ -f "App.vue" ]; then
    mv App.vue App.vue.backup  
    echo "   ✅ App.vue 已备份"
  fi
  
  echo "5. 更新 package.json"
  # 这里需要手动修改 package.json 的 main 字段
  
  echo ""
  echo "🎉 uni-app x 恢复完成！"
  echo ""
  echo "📋 下一步："
  echo "1. 修改 package.json 中的 main 字段为 main.uts"
  echo "2. 重新安装 uni-app x 依赖"
  echo "3. 在 HBuilderX 中重新打开项目"
  echo "4. 云函数应该可以正常显示了"
  
else
  echo "❌ 未找到 uni-app x 备份文件"
  echo "   无法自动恢复，需要手动重新配置"
fi
