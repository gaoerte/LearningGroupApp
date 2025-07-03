// config/index.js - 统一配置管理

// 导入子配置
import { supabaseConfig } from './supabase';
import { ENV_CONFIG as envConfig } from './env';

// 应用配置
export const appConfig = {
  name: 'Learning Group App',
  version: '1.0.0',
  
  // 环境配置
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // 云函数配置
  cloudFunctions: {
    timeout: 10000,
    retryTimes: 3,
    retryDelay: 1000
  },
  
  // 日志配置
  logging: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
    enableConsole: true,
    enableRemote: false
  },
  
  // 缓存配置
  cache: {
    ttl: 300000, // 5分钟
    maxSize: 100
  }
};

// 网络配置
export const networkConfig = {
  timeout: 10000,
  retryTimes: 3,
  retryDelay: 1000
};

// 统一导出所有配置
export const config = {
  app: appConfig,
  env: envConfig,
  supabase: supabaseConfig,
  network: networkConfig
};

export default config;
