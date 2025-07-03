# SCSS变量未定义错误修复

## 🐛 问题描述
```
[plugin:uts] Undefined variable.
╷
236 │   border-left: 6rpx solid $green-500;
    │                           ^^^^^^^^^^
╵
Error: Undefined variable.
```

## 🔍 问题原因
在样式文件中使用了未在`styles/variables.scss`中定义的SCSS变量：
- `$green-500` - 未定义
- `$orange-500` - 未定义

## ✅ 解决方案
将未定义的变量替换为已定义的语义颜色变量：

### 修复的变量映射
| 原始变量 | 替换变量 | 对应颜色 | 用途 |
|---------|---------|---------|------|
| `$green-500` | `$success-500` | `#22c55e` | 成功状态/推荐群组 |
| `$orange-500` | `$accent-500` | `#f97316` | 强调色/创建功能 |

### 修复的文件
1. **`pages/studyGroups/studyGroups.vue`**
   ```scss
   .recommend-card {
     border-left: 6rpx solid $success-500; // 原: $green-500
   }
   
   .create-card {
     border-left: 6rpx solid $accent-500;  // 原: $orange-500
   }
   ```

2. **`pages/myGroups/myGroups.vue`**
   ```scss
   .status-dot {
     background: $success-500; // 原: $green-500
   }
   ```

## 📋 已定义的颜色变量系统

### 主要语义颜色
- **主色系**: `$primary-50` ~ `$primary-900` (蓝色)
- **辅助色**: `$secondary-50` ~ `$secondary-900` (紫色)
- **强调色**: `$accent-50` ~ `$accent-900` (橙色)
- **成功色**: `$success-50` ~ `$success-900` (绿色)
- **警告色**: `$warning-50` ~ `$warning-900` (黄色)
- **错误色**: `$error-50` ~ `$error-900` (红色)
- **信息色**: `$info-50` ~ `$info-900` (蓝色)

### 中性色系
- **灰色**: `$gray-50` ~ `$gray-900`
- **基础色**: `$white`, `$black`

### 间距变量
- **间距**: `$space-0` ~ `$space-32` (0 ~ 256rpx)

### 文本大小
- **字体**: `$text-xs` ~ `$text-6xl`

## 🧪 验证结果
- ✅ `pages/studyGroups/studyGroups.vue` - 无语法错误
- ✅ `pages/myGroups/myGroups.vue` - 无语法错误
- ✅ `pages/groupMatch/groupMatch.vue` - 无语法错误
- ✅ `pages/groupChat/groupChat.vue` - 无语法错误
- ✅ 所有SCSS变量都已正确定义

## 📱 最佳实践
1. **使用语义化变量名**: 优先使用`$success-500`而不是`$green-500`
2. **查阅变量文档**: 修改前检查`styles/variables.scss`中的定义
3. **保持一致性**: 在整个项目中使用统一的变量命名规范
4. **避免硬编码**: 所有颜色都应使用变量而不是直接写颜色值

## 🚀 现在可以正常编译
所有SCSS变量错误已修复，应用现在可以正常编译运行。

请重新启动编译器或运行：
```bash
npm run dev:mp-weixin
```
