// api/testAPI.js - 系统测试API

import { CoreAPI } from './coreAPI.js';

/**
 * 测试API类
 */
class TestAPI {
  
  /**
   * 健康检查
   */
  static async healthCheck() {
    try {
      console.log('[TestAPI] 开始健康检查');
      return await CoreAPI.call('healthCheck');
    } catch (error) {
      console.error('[TestAPI] 健康检查失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 连接测试
   */
  static async connectionTest() {
    try {
      console.log('[TestAPI] 开始连接测试');
      return await CoreAPI.call('connectionTest');
    } catch (error) {
      console.error('[TestAPI] 连接测试失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 数据库测试
   */
  static async databaseTest() {
    try {
      console.log('[TestAPI] 开始数据库测试');
      return await CoreAPI.call('databaseTest');
    } catch (error) {
      console.error('[TestAPI] 数据库测试失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Supabase连接测试 (兼容旧接口)
   */
  static async testSupabaseConnection() {
    return await this.connectionTest();
  }
  
  /**
   * 群组API测试 (兼容旧接口)
   */
  static async testGroupAPI() {
    return await this.groupSystemTest();
  }
  
  /**
   * 用户系统测试
   */
  static async userSystemTest() {
    try {
      console.log('[TestAPI] 开始用户系统测试');
      const testUser = {
        openid: 'test_' + Date.now(),
        nickname: '测试用户',
        email: 'test@example.com'
      };
      return await CoreAPI.call('userSystemTest', testUser);
    } catch (error) {
      console.error('[TestAPI] 用户系统测试失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 群组系统测试
   */
  static async groupSystemTest() {
    try {
      console.log('[TestAPI] 开始群组系统测试');
      const testGroup = {
        name: '测试学习群',
        description: '这是一个测试群组',
        category: 'programming'
      };
      return await CoreAPI.call('groupSystemTest', testGroup);
    } catch (error) {
      console.error('[TestAPI] 群组系统测试失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 完整系统测试
   */
  static async fullSystemTest() {
    console.log('[TestAPI] 开始完整系统测试');
    const results = {};
    
    // 健康检查
    results.healthCheck = await this.healthCheck();
    
    // 连接测试
    results.connectionTest = await this.connectionTest();
    
    // 数据库测试
    results.databaseTest = await this.databaseTest();
    
    // 用户系统测试
    results.userSystemTest = await this.userSystemTest();
    
    // 群组系统测试
    results.groupSystemTest = await this.groupSystemTest();
    
    // 统计结果
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r.success).length;
    
    return {
      success: passedTests === totalTests,
      summary: `${passedTests}/${totalTests} 项测试通过`,
      details: results
    };
  }
}

export { TestAPI };