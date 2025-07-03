// api/index.js - API统一导出入口

// 核心API模块
import { CoreAPI } from './coreAPI.js';
import { GroupAPI } from './groupAPI.js';
import { UserAPI } from './userAPI.js';
import { TestAPI } from './testAPI.js';
import { SupabaseConnection } from './supabaseConnection.js';

// 统一导出
export { CoreAPI, GroupAPI, UserAPI, TestAPI, SupabaseConnection };

// 便捷访问对象
export const API = {
  Core: CoreAPI,
  Group: GroupAPI,
  User: UserAPI,
  Test: TestAPI,
  Supabase: SupabaseConnection
};

// 统一错误处理
export const handleAPIError = (error) => {
  console.error('[API Error]:', error);
  
  // 统一错误格式
  const standardError = {
    success: false,
    message: error.message || '未知错误',
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
  
  // 根据错误类型显示不同提示
  if (error.message?.includes('网络')) {
    standardError.userMessage = '网络连接失败，请检查网络设置';
  } else if (error.message?.includes('云函数')) {
    standardError.userMessage = '服务暂时不可用，请稍后重试';
  } else if (error.message?.includes('权限')) {
    standardError.userMessage = '权限不足，请重新登录';
  } else {
    standardError.userMessage = '操作失败，请重试';
  }
  
  return standardError;
};

// 统一成功响应处理
export const handleAPISuccess = (response) => {
  return {
    success: true,
    data: response.data || response,
    message: response.message || '操作成功',
    timestamp: new Date().toISOString()
  };
};
