// config/env.js
// 环境配置管理

/**
 * 获取当前环境
 */
function getCurrentEnv() {
  // #ifdef MP-WEIXIN
  return 'weixin';
  // #endif
  
  // #ifdef H5
  return 'h5';
  // #endif
  
  // #ifdef APP-PLUS
  return 'app';
  // #endif
  
  return 'unknown';
}

/**
 * 判断是否为开发环境
 */
function isDevelopment() {
  // #ifdef APP-PLUS
  return process.env.NODE_ENV === 'development';
  // #endif
  
  // #ifdef H5
  return process.env.NODE_ENV === 'development';
  // #endif
  
  // #ifdef MP-WEIXIN
  // 小程序环境判断
  try {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo.miniProgram.envVersion === 'develop';
  } catch (e) {
    return false;
  }
  // #endif
  
  return false;
}

/**
 * 环境配置
 */
const configs = {
  // 开发环境
  development: {
    apiBaseUrl: 'https://dev-api.example.com',
    supabaseUrl: 'https://dev-project.supabase.co',
    supabaseAnonKey: 'dev-anon-key',
    cloudFunctionEnv: 'dev-env',
    enableDebug: true,
    enablePerformanceMonitor: true,
    logLevel: 'debug'
  },
  
  // 测试环境
  testing: {
    apiBaseUrl: 'https://test-api.example.com',
    supabaseUrl: 'https://test-project.supabase.co',
    supabaseAnonKey: 'test-anon-key',
    cloudFunctionEnv: 'test-env',
    enableDebug: true,
    enablePerformanceMonitor: true,
    logLevel: 'info'
  },
  
  // 生产环境
  production: {
    apiBaseUrl: 'https://api.example.com',
    supabaseUrl: 'https://your-project-id.supabase.co',
    supabaseAnonKey: 'your-anon-key',
    cloudFunctionEnv: 'prod-env',
    enableDebug: false,
    enablePerformanceMonitor: false,
    logLevel: 'error'
  }
};

/**
 * 获取当前环境配置
 */
function getConfig() {
  const env = isDevelopment() ? 'development' : 'production';
  const platform = getCurrentEnv();
  
  const baseConfig = configs[env];
  
  // 平台特定配置覆盖
  const platformConfig = {
    weixin: {
      // 微信小程序特定配置
      enableLocationApi: true,
      enableCameraApi: true
    },
    h5: {
      // H5 特定配置
      enableLocationApi: false,
      enableCameraApi: false
    },
    app: {
      // App 特定配置
      enableLocationApi: true,
      enableCameraApi: true,
      enablePushNotification: true
    }
  };
  
  return {
    ...baseConfig,
    ...(platformConfig[platform] || {}),
    platform,
    env,
    isDev: env === 'development'
  };
}

/**
 * 环境特定的调试工具
 */
const envUtils = {
  /**
   * 获取配置
   */
  getConfig,
  
  /**
   * 环境日志
   */
  log: {
    debug: (...args) => {
      const config = getConfig();
      if (config.enableDebug && ['debug', 'info', 'warn', 'error'].includes(config.logLevel)) {
        console.log('[DEBUG]', ...args);
      }
    },
    
    info: (...args) => {
      const config = getConfig();
      if (config.enableDebug && ['info', 'warn', 'error'].includes(config.logLevel)) {
        console.info('[INFO]', ...args);
      }
    },
    
    warn: (...args) => {
      const config = getConfig();
      if (config.enableDebug && ['warn', 'error'].includes(config.logLevel)) {
        console.warn('[WARN]', ...args);
      }
    },
    
    error: (...args) => {
      const config = getConfig();
      if (config.enableDebug && ['error'].includes(config.logLevel)) {
        console.error('[ERROR]', ...args);
      }
    }
  },
  
  /**
   * 开发工具
   */
  dev: {
    /**
     * 显示开发信息
     */
    showInfo() {
      const config = getConfig();
      if (!config.isDev) return;
      
      console.group('🔧 开发环境信息');
      console.log('平台:', config.platform);
      console.log('环境:', config.env);
      console.log('API地址:', config.apiBaseUrl);
      console.log('调试模式:', config.enableDebug);
      console.log('性能监控:', config.enablePerformanceMonitor);
      console.groupEnd();
    },
    
    /**
     * 快速测试工具
     */
    test: {
      /**
       * 测试网络连接
       */
      async network() {
        const config = getConfig();
        if (!config.isDev) return;
        
        console.log('🌐 测试网络连接...');
        
        try {
          const result = await new Promise((resolve, reject) => {
            uni.request({
              url: config.apiBaseUrl + '/health',
              timeout: 5000,
              success: resolve,
              fail: reject
            });
          });
          
          console.log('✅ 网络连接正常:', result);
        } catch (error) {
          console.log('❌ 网络连接失败:', error);
        }
      },
      
      /**
       * 测试存储
       */
      async storage() {
        const config = getConfig();
        if (!config.isDev) return;
        
        console.log('💾 测试本地存储...');
        
        try {
          const testKey = 'dev_test_' + Date.now();
          const testValue = { test: true, timestamp: Date.now() };
          
          // 设置
          uni.setStorageSync(testKey, testValue);
          
          // 获取
          const retrieved = uni.getStorageSync(testKey);
          
          // 删除
          uni.removeStorageSync(testKey);
          
          console.log('✅ 存储测试通过:', { original: testValue, retrieved });
        } catch (error) {
          console.log('❌ 存储测试失败:', error);
        }
      }
    }
  }
};

// 环境配置实例
export const ENV_CONFIG = getConfig();

// 导出工具
export const ENV_UTILS = envUtils;

// 默认导出
export default {
  config: ENV_CONFIG,
  utils: ENV_UTILS,
  getCurrentEnv,
  isDevelopment,
  getConfig
};
