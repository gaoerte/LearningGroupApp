/**
 * 学习小组 API 全局初始化器
 * 在 main.js 中引入，确保全局可用
 */

// 引入 API 类
const LearningGroupAPIClass = require('./learning-group-api.js');

// 创建全局实例
const globalAPI = new LearningGroupAPIClass();

// 挂载到全局
if (typeof global !== 'undefined') {
  global.learningGroupAPI = globalAPI;
}

// Vue 原型挂载
if (typeof Vue !== 'undefined') {
  Vue.prototype.$learningGroupAPI = globalAPI;
}

// 导出
module.exports = globalAPI;
