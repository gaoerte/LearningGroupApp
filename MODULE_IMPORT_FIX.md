# 微信小程序模块导入问题修复

## 问题描述
```
Error: module 'api/learning-group-api.js' is not defined, require args is './api/learning-group-api.js'
```

## 根本原因
1. **ES6 类语法兼容性**: 微信小程序某些版本可能不完全支持 ES6 class 语法
2. **模块导出格式**: CommonJS 导出格式在某些环境下可能有问题
3. **main.js 中的 require**: 微信小程序主入口文件不支持 require 调用

## 解决方案

### 1. 移除 main.js 中的全局 API 导入
```javascript
// 修改前
const learningGroupAPI = require('./api/learning-group-api.js');

// 修改后
// 完全移除，因为微信小程序不支持在 main.js 中使用 require
```

### 2. 创建兼容版本 API
创建了三个版本的 API 文件以确保兼容性：

1. **learning-group-api-compat.js** - 使用传统函数语法
2. **simple-learning-group-api.js** - 简化版本
3. **learning-group-api.js** - 原始版本

### 3. 实现渐进式导入策略
```javascript
const getLearningGroupAPI = () => {
  try {
    // 优先尝试兼容版本
    const api = require('../../api/learning-group-api-compat.js');
    console.log('[页面] 兼容API 导入成功:', typeof api);
    return api;
  } catch (error) {
    console.error('[页面] 兼容API 导入失败:', error);
    // 降级到简化版本
    try {
      const api = require('../../api/simple-learning-group-api.js');
      console.log('[页面] 简化API 导入成功:', typeof api);
      return api;
    } catch (error2) {
      console.error('[页面] 简化API 导入失败:', error2);
      return null;
    }
  }
};
```

## 技术改进

### API 兼容性设计
- ✅ 使用传统函数语法替代 ES6 类
- ✅ 避免箭头函数和解构赋值
- ✅ 使用 `var` 和 `function` 关键字
- ✅ 兼容低版本 JavaScript 环境

### 错误处理优化
- ✅ 多重降级策略
- ✅ 详细的调试日志
- ✅ 友好的错误提示

## 测试验证

1. **重启微信开发者工具**
2. **清除缓存并重新编译**
3. **检查控制台 API 导入日志**
4. **测试各页面功能**

## 预期结果
- ✅ 解决模块导入错误
- ✅ 所有页面正常加载
- ✅ API 调用正常工作
- ✅ 用户可以创建和浏览群组

## 长期方案
建议使用兼容版本 API，确保在各种微信小程序环境下的稳定性。
