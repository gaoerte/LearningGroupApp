// utils/apiTester.js
// API 测试工具

import { userAPI, checkinAPI, groupAPI, chatAPI } from '@/api/supabase-v2.js';
import { ENV_UTILS } from '@/config/env.js';

/**
 * API 测试管理器
 */
class APITester {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  /**
   * 执行单个测试
   */
  async runSingleTest(testName, testFunction, expectedResult = null) {
    const startTime = Date.now();
    
    try {
      ENV_UTILS.log.info(`🧪 开始测试: ${testName}`);
      
      const result = await testFunction();
      const duration = Date.now() - startTime;
      
      const testResult = {
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
      ENV_UTILS.log.info(`✅ 测试通过: ${testName} (${duration}ms)`);
      
      return testResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const testResult = {
        name: testName,
        status: 'error',
        error: error.message || error,
        duration,
        timestamp: new Date().toISOString()
      };
      
      this.testResults.push(testResult);
      ENV_UTILS.log.error(`❌ 测试失败: ${testName}`, error);
      
      return testResult;
    }
  }

  /**
   * 验证测试结果
   */
  validateResult(actual, expected) {
    if (typeof expected === 'object' && expected !== null) {
      return Object.keys(expected).every(key => {
        if (expected[key] === '*') return true; // 通配符
        return actual && actual[key] === expected[key];
      });
    }
    return actual === expected;
  }

  /**
   * 运行完整的 API 测试套件
   */
  async runFullTestSuite() {
    if (this.isRunning) {
      ENV_UTILS.log.warn('测试正在运行中...');
      return;
    }

    this.isRunning = true;
    this.testResults = [];
    
    ENV_UTILS.log.info('🚀 开始完整 API 测试套件');

    try {
      // 用户 API 测试
      await this.runUserAPITests();
      
      // 打卡 API 测试
      await this.runCheckinAPITests();
      
      // 群组 API 测试
      await this.runGroupAPITests();
      
      // 聊天 API 测试
      await this.runChatAPITests();
      
      // 生成测试报告
      const report = this.generateTestReport();
      ENV_UTILS.log.info('📊 测试完成，报告:', report);
      
      return report;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 用户 API 测试
   */
  async runUserAPITests() {
    ENV_UTILS.log.info('👤 开始用户 API 测试');

    // 测试创建用户
    await this.runSingleTest('创建用户', async () => {
      const userInfo = {
        nickName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg'
      };
      return await userAPI.createUser(userInfo);
    }, { success: true });

    // 测试获取用户资料
    await this.runSingleTest('获取用户资料', async () => {
      return await userAPI.getProfile();
    });

    // 测试更新用户资料
    await this.runSingleTest('更新用户资料', async () => {
      const updates = {
        nickname: 'Updated User',
        bio: 'Test bio'
      };
      return await userAPI.updateProfile(updates);
    }, { success: true });

    // 测试获取用户统计
    await this.runSingleTest('获取用户统计', async () => {
      return await userAPI.getUserStats();
    });
  }

  /**
   * 打卡 API 测试
   */
  async runCheckinAPITests() {
    ENV_UTILS.log.info('📅 开始打卡 API 测试');

    // 测试今日打卡
    await this.runSingleTest('今日打卡', async () => {
      const checkinData = {
        type: 'study',
        content: '学习了 JavaScript',
        duration: 60,
        location: '图书馆'
      };
      return await checkinAPI.todayCheckin(checkinData);
    }, { success: true });

    // 测试获取打卡历史
    await this.runSingleTest('获取打卡历史', async () => {
      return await checkinAPI.getHistory(1, 10);
    });

    // 测试获取打卡统计
    await this.runSingleTest('获取打卡统计', async () => {
      return await checkinAPI.getStats();
    });

    // 测试获取打卡排行榜
    await this.runSingleTest('获取打卡排行榜', async () => {
      return await checkinAPI.getLeaderboard();
    });
  }

  /**
   * 群组 API 测试
   */
  async runGroupAPITests() {
    ENV_UTILS.log.info('👥 开始群组 API 测试');

    // 测试获取推荐群组
    await this.runSingleTest('获取推荐群组', async () => {
      return await groupAPI.getRecommended();
    });

    // 测试搜索群组
    await this.runSingleTest('搜索群组', async () => {
      return await groupAPI.search('JavaScript');
    });

    // 测试创建群组
    await this.runSingleTest('创建群组', async () => {
      const groupData = {
        name: 'Test Study Group',
        description: 'A test study group',
        category: 'programming',
        tags: ['javascript', 'frontend'],
        maxMembers: 10
      };
      return await groupAPI.create(groupData);
    }, { success: true });

    // 测试获取我的群组
    await this.runSingleTest('获取我的群组', async () => {
      return await groupAPI.getMyGroups();
    });
  }

  /**
   * 聊天 API 测试
   */
  async runChatAPITests() {
    ENV_UTILS.log.info('💬 开始聊天 API 测试');

    // 测试发送 AI 消息
    await this.runSingleTest('发送 AI 消息', async () => {
      return await chatAPI.sendMessage('你好，AI助手');
    });

    // 测试获取聊天历史
    await this.runSingleTest('获取聊天历史', async () => {
      return await chatAPI.getHistory(1, 10);
    });

    // 测试清除聊天记录
    await this.runSingleTest('清除聊天记录', async () => {
      return await chatAPI.clearHistory();
    }, { success: true });
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const successTests = this.testResults.filter(r => r.status === 'success').length;
    const warningTests = this.testResults.filter(r => r.status === 'warning').length;
    const errorTests = this.testResults.filter(r => r.status === 'error').length;
    
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    const avgDuration = totalTests > 0 ? totalDuration / totalTests : 0;
    
    return {
      summary: {
        total: totalTests,
        success: successTests,
        warning: warningTests,
        error: errorTests,
        successRate: totalTests > 0 ? (successTests / totalTests * 100).toFixed(2) + '%' : '0%',
        totalDuration: totalDuration + 'ms',
        avgDuration: avgDuration.toFixed(2) + 'ms'
      },
      details: this.testResults,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取最后的测试结果
   */
  getLastResults() {
    return this.testResults;
  }

  /**
   * 清除测试结果
   */
  clearResults() {
    this.testResults = [];
  }

  /**
   * 导出测试结果
   */
  exportResults() {
    const report = this.generateTestReport();
    
    try {
      const jsonStr = JSON.stringify(report, null, 2);
      
      // #ifdef H5
      // H5 环境下载文件
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-test-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      // #endif
      
      // #ifdef MP-WEIXIN
      // 小程序环境保存到本地
      uni.setStorageSync('api_test_report', report);
      uni.showToast({
        title: '报告已保存到本地存储',
        icon: 'success'
      });
      // #endif
      
      return report;
    } catch (error) {
      ENV_UTILS.log.error('导出测试结果失败:', error);
      throw error;
    }
  }

  /**
   * 快速健康检查
   */
  async quickHealthCheck() {
    ENV_UTILS.log.info('🏥 开始快速健康检查');
    
    const healthTests = [
      {
        name: '用户API连通性',
        test: () => userAPI.getProfile()
      },
      {
        name: '打卡API连通性',
        test: () => checkinAPI.getStats()
      },
      {
        name: '群组API连通性',
        test: () => groupAPI.getRecommended()
      }
    ];

    const results = [];
    
    for (const healthTest of healthTests) {
      const result = await this.runSingleTest(
        healthTest.name,
        healthTest.test
      );
      results.push(result);
    }

    const healthReport = {
      status: results.every(r => r.status === 'success') ? 'healthy' : 'unhealthy',
      tests: results,
      timestamp: new Date().toISOString()
    };

    ENV_UTILS.log.info('🏥 健康检查完成:', healthReport);
    return healthReport;
  }
}

// 创建全局实例
const apiTester = new APITester();

// 导出便捷方法
export const testAPI = {
  // 运行完整测试套件
  runFullSuite: () => apiTester.runFullTestSuite(),
  
  // 快速健康检查
  healthCheck: () => apiTester.quickHealthCheck(),
  
  // 运行单个测试
  runSingle: (name, testFn, expected) => apiTester.runSingleTest(name, testFn, expected),
  
  // 获取结果
  getResults: () => apiTester.getLastResults(),
  
  // 生成报告
  getReport: () => apiTester.generateTestReport(),
  
  // 导出结果
  export: () => apiTester.exportResults(),
  
  // 清除结果
  clear: () => apiTester.clearResults()
};

export default apiTester;
