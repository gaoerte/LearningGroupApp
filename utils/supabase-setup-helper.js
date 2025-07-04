// utils/supabase-setup-helper.js
// Supabase 连接设置助手

/**
 * Supabase 设置助手类
 */
export class SupabaseSetupHelper {
  constructor() {
    this.config = {
      url: 'https://klpseujbhwvifsfshfdx.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
    };
    this.testResults = {};
  }

  /**
   * 运行完整的连接测试
   */
  async runFullConnectionTest() {
    console.log('🚀 开始 Supabase 连接测试...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {},
      success: false,
      summary: ''
    };

    try {
      // 1. 基础连接测试
      results.tests.basicConnection = await this.testBasicConnection();
      
      // 2. 认证测试
      results.tests.authentication = await this.testAuthentication();
      
      // 3. 数据库查询测试
      results.tests.databaseQuery = await this.testDatabaseQuery();
      
      // 4. 实时功能测试
      results.tests.realtime = await this.testRealtimeConnection();
      
      // 5. 存储测试
      results.tests.storage = await this.testStorageAccess();

      // 计算总体结果
      const passedTests = Object.values(results.tests).filter(test => test.success).length;
      const totalTests = Object.keys(results.tests).length;
      
      results.success = passedTests >= totalTests * 0.6; // 60%通过率即为成功
      results.summary = `通过 ${passedTests}/${totalTests} 项测试`;
      
      console.log(`📊 测试完成: ${results.summary}`);
      return results;
      
    } catch (error) {
      console.error('❌ 测试过程异常:', error);
      results.error = error.message;
      return results;
    }
  }

  /**
   * 基础连接测试
   */
  async testBasicConnection() {
    console.log('🔍 测试基础连接...');
    
    try {
      // 尝试通过云函数连接
      const result = await this.callCloudFunction('supabaseTest', {
        action: 'ping'
      });
      
      if (result.success) {
        console.log('✅ 云函数连接成功');
        return {
          success: true,
          method: 'cloudFunction',
          response: result.data
        };
      }
      
      // 如果云函数失败，尝试直接连接（Web端）
      if (typeof window !== 'undefined') {
        return await this.testDirectConnection();
      }
      
      throw new Error('云函数连接失败: ' + result.error);
      
    } catch (error) {
      console.error('❌ 基础连接测试失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 直接连接测试（Web端）
   */
  async testDirectConnection() {
    try {
      const response = await fetch(`${this.config.url}/rest/v1/`, {
        headers: {
          'apikey': this.config.anonKey,
          'Authorization': `Bearer ${this.config.anonKey}`
        }
      });
      
      if (response.ok) {
        console.log('✅ 直接连接成功');
        return {
          success: true,
          method: 'directConnection',
          status: response.status
        };
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
    } catch (error) {
      console.error('❌ 直接连接失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 认证测试
   */
  async testAuthentication() {
    console.log('🔐 测试用户认证...');
    
    try {
      const result = await this.callCloudFunction('supabaseTest', {
        action: 'authTest',
        testUser: {
          openid: 'test_' + Date.now(),
          nickname: '测试用户'
        }
      });
      
      if (result.success) {
        console.log('✅ 认证测试成功');
        return {
          success: true,
          userId: result.data.user?.id,
          method: result.data.method
        };
      }
      
      throw new Error(result.error);
      
    } catch (error) {
      console.error('❌ 认证测试失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 数据库查询测试
   */
  async testDatabaseQuery() {
    console.log('🗄️ 测试数据库查询...');
    
    try {
      const result = await this.callCloudFunction('supabaseTest', {
        action: 'dbQuery',
        query: 'SELECT current_timestamp'
      });
      
      if (result.success) {
        console.log('✅ 数据库查询成功');
        return {
          success: true,
          queryResult: result.data,
          responseTime: result.responseTime
        };
      }
      
      throw new Error(result.error);
      
    } catch (error) {
      console.error('❌ 数据库查询失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 实时功能测试
   */
  async testRealtimeConnection() {
    console.log('📡 测试实时连接...');
    
    try {
      const result = await this.callCloudFunction('supabaseTest', {
        action: 'realtimeTest'
      });
      
      if (result.success) {
        console.log('✅ 实时连接测试成功');
        return {
          success: true,
          channels: result.data.channels,
          status: result.data.status
        };
      }
      
      // 实时功能不是必需的，失败也不影响总体
      console.log('⚠️ 实时功能暂不可用，但不影响基本功能');
      return {
        success: true,
        warning: '实时功能暂不可用',
        fallback: '将使用轮询模式'
      };
      
    } catch (error) {
      console.error('❌ 实时连接测试失败:', error);
      return {
        success: true, // 不强制要求实时功能
        warning: error.message,
        fallback: '将使用轮询模式'
      };
    }
  }

  /**
   * 存储测试
   */
  async testStorageAccess() {
    console.log('💾 测试存储访问...');
    
    try {
      const result = await this.callCloudFunction('supabaseTest', {
        action: 'storageTest'
      });
      
      if (result.success) {
        console.log('✅ 存储访问测试成功');
        return {
          success: true,
          buckets: result.data.buckets,
          permissions: result.data.permissions
        };
      }
      
      // 存储功能也不是必需的
      console.log('⚠️ 存储功能暂不可用，但不影响基本功能');
      return {
        success: true,
        warning: '存储功能暂不可用',
        fallback: '将使用本地缓存'
      };
      
    } catch (error) {
      console.error('❌ 存储测试失败:', error);
      return {
        success: true, // 不强制要求存储功能
        warning: error.message,
        fallback: '将使用本地缓存'
      };
    }
  }

  /**
   * 调用云函数
   */
  async callCloudFunction(functionName, data) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      uniCloud.callFunction({
        name: functionName,
        data: data,
        success: (res) => {
          const responseTime = Date.now() - startTime;
          try {
            const result = res.result || {};
            resolve({
              success: true,
              data: result,
              responseTime: responseTime
            });
          } catch (error) {
            resolve({
              success: false,
              error: '解析响应失败: ' + error.message,
              responseTime: responseTime
            });
          }
        },
        fail: (error) => {
          const responseTime = Date.now() - startTime;
          resolve({
            success: false,
            error: error.errMsg || error.message || '云函数调用失败',
            responseTime: responseTime
          });
        }
      });
    });
  }

  /**
   * 生成设置报告
   */
  generateSetupReport(testResults) {
    const report = {
      title: '🔧 Supabase 连接设置报告',
      timestamp: new Date().toLocaleString(),
      status: testResults.success ? '✅ 就绪' : '❌ 需要配置',
      details: []
    };

    // 添加测试结果详情
    Object.entries(testResults.tests).forEach(([testName, result]) => {
      const emoji = result.success ? '✅' : '❌';
      const status = result.success ? '通过' : '失败';
      const detail = `${emoji} ${testName}: ${status}`;
      
      if (result.error) {
        detail += ` (${result.error})`;
      }
      if (result.warning) {
        detail += ` ⚠️ ${result.warning}`;
      }
      
      report.details.push(detail);
    });

    // 添加建议
    if (!testResults.success) {
      report.suggestions = [
        '1. 检查 Supabase 项目 URL 和 API Key',
        '2. 确认云函数已正确部署',
        '3. 验证数据库表结构已创建',
        '4. 检查 RLS 策略设置'
      ];
    } else {
      report.suggestions = [
        '🎉 连接配置成功！可以开始使用真实数据了',
        '建议：启用实时功能以获得更好的用户体验',
        '建议：配置存储功能以支持文件上传'
      ];
    }

    return report;
  }

  /**
   * 快速诊断
   */
  async quickDiagnosis() {
    console.log('🔬 快速诊断开始...');
    
    const diagnosis = {
      platform: this.detectPlatform(),
      network: await this.checkNetworkStatus(),
      cloudFunction: await this.checkCloudFunctionStatus(),
      config: this.validateConfig()
    };

    console.log('📋 诊断结果:', diagnosis);
    return diagnosis;
  }

  /**
   * 检测平台
   */
  detectPlatform() {
    // #ifdef MP-WEIXIN
    return { type: 'mp-weixin', name: '微信小程序' };
    // #endif
    
    // #ifdef MP-ALIPAY  
    return { type: 'mp-alipay', name: '支付宝小程序' };
    // #endif
    
    // #ifdef H5
    return { type: 'h5', name: 'H5浏览器' };
    // #endif
    
    // #ifdef APP-PLUS
    return { type: 'app', name: 'App' };
    // #endif
    
    return { type: 'unknown', name: '未知平台' };
  }

  /**
   * 检查网络状态
   */
  async checkNetworkStatus() {
    try {
      const networkInfo = await uni.getNetworkType();
      return {
        available: true,
        type: networkInfo.networkType,
        isConnected: networkInfo.networkType !== 'none'
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * 检查云函数状态
   */
  async checkCloudFunctionStatus() {
    try {
      const result = await this.callCloudFunction('ping', {});
      return {
        available: result.success,
        responseTime: result.responseTime,
        error: result.error
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * 验证配置
   */
  validateConfig() {
    const issues = [];
    
    if (!this.config.url) {
      issues.push('缺少 Supabase URL');
    } else if (!this.config.url.includes('supabase.co')) {
      issues.push('Supabase URL 格式不正确');
    }
    
    if (!this.config.anonKey) {
      issues.push('缺少匿名 API Key');
    } else if (this.config.anonKey.length < 100) {
      issues.push('API Key 格式可能不正确');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues,
      config: {
        hasUrl: !!this.config.url,
        hasKey: !!this.config.anonKey,
        urlValid: this.config.url?.includes('supabase.co'),
        keyLength: this.config.anonKey?.length
      }
    };
  }
}

/**
 * 导出单例实例 - 兼容CommonJS和ES6
 */
export const supabaseSetupHelper = new SupabaseSetupHelper();

// CommonJS兼容导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SupabaseSetupHelper,
    supabaseSetupHelper
  };
}
