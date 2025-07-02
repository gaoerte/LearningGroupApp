// utils/apiTester-safe.js
// 安全的 API 测试工具 - 避免循环引用

import { userAPI, checkinAPI, studyGroupAPI, supabaseUtils } from '@/api/supabase-v2.js';
import { safePerf } from './performance-safe.js';

/**
 * 安全的 API 测试管理器
 */
class SafeAPITester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
    this.testCount = 0;
  }

  /**
   * 安全执行单个测试
   */
  async runSingleTest(testName, testFunction, expectedResult = null) {
    // 防止重复执行
    if (this.isRunning) {
      console.warn('测试正在运行中，跳过:', testName);
      return null;
    }

    const testId = `test_${++this.testCount}`;
    safePerf.start(testId);
    
    try {
      console.log(`🧪 开始测试: ${testName}`);
      
      this.isRunning = true;
      const result = await testFunction();
      const duration = safePerf.end(testId);
      
      const testResult = {
        id: testId,
        name: testName,
        status: 'success',
        result,
        duration,
        timestamp: new Date().toISOString(),
        expected: expectedResult
      };
      
      // 验证期望结果
      if (expectedResult !== null) {
        const isValid = this.validateResult(result, expectedResult);
        if (!isValid) {
          testResult.status = 'warning';
          testResult.message = '结果与期望不符';
        }
      }
      
      this.testResults.push(testResult);
      console.log(`✅ 测试通过: ${testName} (${duration}ms)`);
      
      return testResult;
    } catch (error) {
      const duration = safePerf.end(testId);
      
      const testResult = {
        id: testId,
        name: testName,
        status: 'error',
        error: error.message || error,
        duration,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(testResult);
      console.error(`❌ 测试失败: ${testName}`, error);
      
      return testResult;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 验证测试结果
   */
  validateResult(actual, expected) {
    try {
      if (typeof expected === 'object' && expected !== null) {
        return Object.keys(expected).every(key => {
          if (expected[key] === '*') return true; // 通配符
          return actual && actual[key] === expected[key];
        });
      }
      return actual === expected;
    } catch (error) {
      console.warn('结果验证失败:', error);
      return false;
    }
  }

  /**
   * 运行用户 API 测试
   */
  async runUserAPITests() {
    const tests = [
      {
        name: '获取用户列表',
        fn: () => userAPI.getUsers(),
        expected: { success: true }
      },
      {
        name: '创建测试用户',
        fn: () => userAPI.createUser({
          nickname: `测试用户_${Date.now()}`,
          avatar_url: ''
        }),
        expected: { success: true }
      }
    ];

    const results = [];
    for (const test of tests) {
      const result = await this.runSingleTest(test.name, test.fn, test.expected);
      if (result) results.push(result);
      
      // 添加延迟，避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * 运行打卡 API 测试
   */
  async runCheckinAPITests() {
    const tests = [
      {
        name: '获取打卡记录',
        fn: () => checkinAPI.getCheckins(),
        expected: { success: true }
      },
      {
        name: '创建打卡记录',
        fn: () => checkinAPI.createCheckin({
          type: 'study',
          content: '测试学习打卡',
          duration: 30
        }),
        expected: { success: true }
      }
    ];

    const results = [];
    for (const test of tests) {
      const result = await this.runSingleTest(test.name, test.fn, test.expected);
      if (result) results.push(result);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * 运行群组 API 测试
   */
  async runGroupAPITests() {
    const tests = [
      {
        name: '获取学习群组',
        fn: () => studyGroupAPI.getGroups(),
        expected: { success: true }
      }
    ];

    const results = [];
    for (const test of tests) {
      const result = await this.runSingleTest(test.name, test.fn, test.expected);
      if (result) results.push(result);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return results;
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      console.log('🔍 开始健康检查...');
      
      const checks = [
        {
          name: 'Supabase连接',
          test: () => supabaseUtils.healthCheck()
        },
        {
          name: '用户API',
          test: () => userAPI.getUsers()
        },
        {
          name: '打卡API',
          test: () => checkinAPI.getCheckins()
        }
      ];

      const results = [];
      let successCount = 0;

      for (const check of checks) {
        try {
          const result = await check.test();
          if (result.success) {
            successCount++;
            results.push({ name: check.name, status: 'healthy' });
          } else {
            results.push({ name: check.name, status: 'unhealthy', error: result.error });
          }
        } catch (error) {
          results.push({ name: check.name, status: 'error', error: error.message });
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const healthStatus = successCount === checks.length ? 'healthy' : 'degraded';
      
      return {
        status: healthStatus,
        checks: results,
        successRate: (successCount / checks.length * 100).toFixed(2) + '%',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('健康检查失败:', error);
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTestSuite() {
    if (this.isRunning) {
      console.warn('测试套件正在运行中...');
      return this.getTestSummary();
    }

    console.log('🚀 开始完整 API 测试套件');
    this.testResults = [];

    try {
      // 逐步执行各类测试
      await this.runUserAPITests();
      await this.runCheckinAPITests();
      await this.runGroupAPITests();
      
      console.log('🎉 完整测试套件执行完成');
      return this.getTestSummary();
    } catch (error) {
      console.error('测试套件执行失败:', error);
      return {
        error: error.message,
        partialResults: this.getTestSummary()
      };
    }
  }

  /**
   * 获取测试摘要
   */
  getTestSummary() {
    const total = this.testResults.length;
    const success = this.testResults.filter(r => r.status === 'success').length;
    const warning = this.testResults.filter(r => r.status === 'warning').length;
    const error = this.testResults.filter(r => r.status === 'error').length;
    
    return {
      summary: {
        total,
        success,
        warning,
        error,
        successRate: total > 0 ? (success / total * 100).toFixed(2) + '%' : '0%'
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清理测试结果
   */
  cleanup() {
    this.testResults = [];
    this.isRunning = false;
    this.testCount = 0;
    console.log('🧹 API测试器已清理');
  }

  /**
   * 获取测试结果
   */
  getResults() {
    return this.testResults;
  }
}

// 创建安全的API测试实例
const safeTestAPI = new SafeAPITester();

// 导出
export { SafeAPITester, safeTestAPI };
export default safeTestAPI;
