#!/bin/bash

# 数据库表结构冲突修复脚本
# ================================

echo "🔧 学习小组App - 数据库表结构冲突修复"
echo "=================================="

echo ""
echo "📋 问题诊断："
echo "❌ 错误：invalid input syntax for type uuid: \"system_test\""
echo "🔍 原因：study_groups 表的 creator_id 字段可能是 uuid 类型或有外键约束"
echo "💡 解决：重新创建表结构，确保 creator_id 为 varchar(255) 类型"

echo ""
echo "📁 可用的修复方案："
echo ""

echo "方案一：完全重置表结构（推荐）⭐"
echo "   文件：database/reset_schema.sql"
echo "   操作：删除现有表，重新创建正确的表结构"
echo "   优点：确保表结构完全正确，无冲突"
echo ""

echo "方案二：增量修复表结构"
echo "   文件：database/test_schema.sql"
echo "   操作：使用 CREATE TABLE IF NOT EXISTS，可能仍有冲突"
echo "   注意：如果表已存在且结构错误，此方案可能无效"
echo ""

echo "🚀 推荐操作步骤："
echo ""

echo "第一步：在 Supabase 控制台执行重置脚本"
echo "   1. 访问：https://klpseujbhwvifsfshfdx.supabase.co"
echo "   2. 进入 SQL Editor"
echo "   3. 复制并执行 database/reset_schema.sql 的全部内容"
echo "   4. 确认看到成功消息和数据统计"
echo ""

echo "第二步：验证表结构和数据"
echo "   执行以下 SQL 验证："
echo ""
echo "   -- 检查表结构"
echo "   SELECT column_name, data_type FROM information_schema.columns"
echo "   WHERE table_name = 'study_groups' AND column_name = 'creator_id';"
echo ""
echo "   -- 验证测试数据"
echo "   SELECT u.openid, sg.name, sg.creator_id FROM users u"
echo "   JOIN study_groups sg ON u.openid = sg.creator_id;"
echo ""

echo "第三步：在小程序中测试"
echo "   访问测试页面，点击 '数据库测试' 按钮"
echo "   应该显示 '数据库连接正常'"
echo ""

echo "📊 预期结果："
echo "   ✅ users 表：1条记录（system_test 用户）"
echo "   ✅ study_groups 表：1条记录（系统测试群）"
echo "   ✅ creator_id 字段：varchar(255) 类型，值为 'system_test'"
echo "   ✅ 所有测试通过，无类型错误"
echo ""

echo "💾 相关文件："
echo "   📄 database/reset_schema.sql - 完全重置脚本（推荐使用）"
echo "   📄 database/test_schema.sql - 增量更新脚本"
echo "   📄 DATABASE_FIX_GUIDE.md - 详细故障排查指南"
echo ""

echo "🔗 Supabase 控制台链接："
echo "   https://klpseujbhwvifsfshfdx.supabase.co"
echo ""

echo "🎯 执行建议："
echo "   立即使用 database/reset_schema.sql 重置表结构"
echo "   这是最快、最安全的解决方案！"
echo ""

echo "✅ 修复完成后，数据库测试应该完全正常！"
echo "=================================="
