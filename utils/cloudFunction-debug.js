// utils/cloudFunction-debug.js
// 云函数调用调试工具

/**
 * 云函数调试器
 */
class CloudFunctionDebugger {
  constructor() {
    this.logs = [];
    this.isDebugEnabled = true;
  }

  // 记录日志
  log(type, message, data = null) {
    const logEntry = {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.logs.push(logEntry);
    
    if (this.isDebugEnabled) {
      console.log(`[CloudFunction-${type}]`, message, data);
    }
    
    // 保持最近100条日志
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  // 安全调用云函数
  async safeCallFunction(name, data = {}, timeout = 10000) {
    this.log('INFO', `开始调用云函数: ${name}`, data);
    
    try {
      // 检查云函数环境
      if (!uni.cloud) {
        throw new Error('uni.cloud 不可用，请检查云开发配置');
      }

      // 设置超时
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('云函数调用超时')), timeout);
      });

      // 云函数调用
      const callPromise = uni.cloud.callFunction({
        name,
        data
      });

      const result = await Promise.race([callPromise, timeoutPromise]);
      
      if (result.result) {
        this.log('SUCCESS', `云函数调用成功: ${name}`, {
          success: result.result.success,
          hasData: !!result.result.data,
          message: result.result.message
        });
        return result.result;
      } else {
        this.log('ERROR', `云函数返回异常: ${name}`, result);
        return {
          success: false,
          error: result.errMsg || '云函数返回格式异常',
          code: 'INVALID_RESPONSE'
        };
      }
      
    } catch (error) {
      this.log('ERROR', `云函数调用失败: ${name}`, {
        error: error.message,
        stack: error.stack
      });
      
      return {
        success: false,
        error: error.message,
        code: 'CALL_FAILED'
      };
    }
  }

  // 批量测试云函数
  async batchTest(tests) {
    const results = [];
    
    for (const test of tests) {
      this.log('INFO', `执行测试: ${test.name}`);
      
      const startTime = Date.now();
      const result = await this.safeCallFunction(test.functionName, test.data);
      const duration = Date.now() - startTime;
      
      results.push({
        name: test.name,
        functionName: test.functionName,
        success: result.success,
        duration,
        result,
        timestamp: new Date().toISOString()
      });
      
      // 测试间隔
      if (test.delay) {
        await new Promise(resolve => setTimeout(resolve, test.delay));
      }
    }
    
    return results;
  }

  // 诊断云函数环境
  async diagnose() {
    this.log('INFO', '开始云函数环境诊断');
    
    const diagnosis = {
      environment: {
        hasUniCloud: !!uni.cloud,
        platform: this.getSystemInfo().platform,
        version: this.getSystemInfo().version
      },
      tests: []
    };

    // 测试基本连接
    const pingTest = await this.safeCallFunction('testProxy', { action: 'ping' });
    diagnosis.tests.push({
      name: '基本连接测试',
      success: pingTest.success,
      result: pingTest
    });

    if (pingTest.success) {
      // 测试环境变量
      const envTest = await this.safeCallFunction('testProxy', { action: 'env' });
      diagnosis.tests.push({
        name: '环境变量检查',
        success: envTest.success,
        result: envTest
      });

      // 测试外部请求
      const requestTest = await this.safeCallFunction('testProxy', { action: 'request' });
      diagnosis.tests.push({
        name: '外部请求测试',
        success: requestTest.success,
        result: requestTest
      });
    }

    this.log('INFO', '云函数环境诊断完成', diagnosis);
    return diagnosis;
  }

  // 获取诊断报告
  getReport() {
    return {
      logs: this.logs,
      summary: {
        totalLogs: this.logs.length,
        errorCount: this.logs.filter(log => log.type === 'ERROR').length,
        successCount: this.logs.filter(log => log.type === 'SUCCESS').length
      },
      timestamp: new Date().toISOString()
    };
  }

  // 清除日志
  clearLogs() {
    this.logs = [];
    this.log('INFO', '日志已清除');
  }

  // 导出日志
  exportLogs() {
    const report = this.getReport();
    
    // #ifdef H5
    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloud-function-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    // #endif
    
    // #ifdef MP-WEIXIN
    uni.setStorageSync('cloudFunction_debug_logs', report);
    // #endif
    
    this.log('INFO', '日志已导出');
    return report;
  }

  // 获取系统信息（使用新API）
  getSystemInfo() {
    try {
      return {
        platform: uni.getDeviceInfo().platform,
        version: uni.getAppBaseInfo().version,
        system: uni.getDeviceInfo().system
      };
    } catch (error) {
      console.warn('[CloudFunction-Debug] 获取系统信息失败:', error);
      return {
        platform: 'unknown',
        version: 'unknown',
        system: 'unknown'
      };
    }
  }
}

// 创建全局调试器实例
const cloudDebugger = new CloudFunctionDebugger();

// 导出
export { CloudFunctionDebugger, cloudDebugger };
export default cloudDebugger;
