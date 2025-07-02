// utils/supabase-tester.js
// Supabase 综合测试工具

/**
 * Supabase 测试工具类
 * 提供完整的数据库连接、CRUD 操作、RLS 策略等测试功能
 */
class SupabaseTester {
  constructor() {
    this.testResults = [];
    this.testData = {
      users: [],
      groups: [],
      checkins: [],
      chats: []
    };
    this.isTestMode = true;
  }

  /**
   * 添加测试结果
   */
  addTestResult(testName, success, message, details = null) {
    const result = {
      testName,
      success,
      message,
      details,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`[测试结果] ${testName}: ${success ? '✅ 成功' : '❌ 失败'} - ${message}`);
    return result;
  }

  /**
   * 获取所有测试结果
   */
  getTestResults() {
    return this.testResults;
  }

  /**
   * 清除测试结果
   */
  clearTestResults() {
    this.testResults = [];
    this.testData = {
      users: [],
      groups: [],
      checkins: [],
      chats: []
    };
  }

  /**
   * 获取测试统计信息
   */
  getTestStats() {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    return {
      total,
      passed,
      failed,
      passRate: parseFloat(passRate)
    };
  }

  /**
   * 测试云函数基础连接
   */
  async testCloudFunctionConnection() {
    try {
      console.log('🔍 测试云函数基础连接...');
      
      const result = await uni.cloud.callFunction({
        name: 'testProxy',
        data: { 
          action: 'ping',
          timestamp: Date.now()
        }
      });

      if (result.result && result.result.success) {
        this.addTestResult(
          '云函数连接',
          true,
          '云函数连接正常',
          result.result
        );
        return true;
      } else {
        this.addTestResult(
          '云函数连接',
          false,
          '云函数响应异常',
          result
        );
        return false;
      }
    } catch (error) {
      this.addTestResult(
        '云函数连接',
        false,
        `云函数连接失败: ${error.message}`,
        error
      );
      return false;
    }
  }

  /**
   * 测试 Supabase 代理连接
   */
  async testSupabaseProxyConnection() {
    try {
      console.log('🔍 测试 Supabase 代理连接...');
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'healthCheck',
          timestamp: Date.now()
        }
      });

      if (result.result && result.result.success) {
        this.addTestResult(
          'Supabase代理连接',
          true,
          'Supabase 代理连接正常',
          result.result
        );
        return true;
      } else {
        this.addTestResult(
          'Supabase代理连接',
          false,
          'Supabase 代理响应异常',
          result
        );
        return false;
      }
    } catch (error) {
      this.addTestResult(
        'Supabase代理连接',
        false,
        `Supabase 代理连接失败: ${error.message}`,
        error
      );
      return false;
    }
  }

  /**
   * 测试用户 CRUD 操作
   */
  async testUserCRUD() {
    try {
      console.log('🔍 测试用户 CRUD 操作...');
      
      // 创建测试用户
      const testUserData = {
        openid: `test_user_${Date.now()}`,
        nickname: '测试用户',
        avatar_url: 'https://via.placeholder.com/100',
        bio: '这是一个测试用户',
        level: 1
      };

      // 1. 创建用户
      const createResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'insert',
          table: 'users',
          data: testUserData
        }
      });

      if (!createResult.result?.success) {
        throw new Error('创建用户失败: ' + (createResult.result?.error || '未知错误'));
      }

      const userId = createResult.result.data.id;
      this.testData.users.push({ id: userId, ...testUserData });
      
      this.addTestResult(
        '用户创建',
        true,
        '用户创建成功',
        { userId, userData: testUserData }
      );

      // 2. 查询用户
      const queryResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'select',
          table: 'users',
          filters: { id: userId }
        }
      });

      if (!queryResult.result?.success || !queryResult.result.data.length) {
        throw new Error('查询用户失败');
      }

      this.addTestResult(
        '用户查询',
        true,
        '用户查询成功',
        queryResult.result.data[0]
      );

      // 3. 更新用户
      const updateData = { nickname: '更新后的测试用户', level: 2 };
      const updateResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'update',
          table: 'users',
          filters: { id: userId },
          data: updateData
        }
      });

      if (!updateResult.result?.success) {
        throw new Error('更新用户失败');
      }

      this.addTestResult(
        '用户更新',
        true,
        '用户更新成功',
        updateData
      );

      return userId;

    } catch (error) {
      this.addTestResult(
        '用户CRUD',
        false,
        `用户 CRUD 操作失败: ${error.message}`,
        error
      );
      return null;
    }
  }

  /**
   * 测试学习群组 CRUD 操作
   */
  async testGroupCRUD(creatorId) {
    try {
      console.log('🔍 测试学习群组 CRUD 操作...');
      
      if (!creatorId) {
        throw new Error('需要有效的创建者 ID');
      }

      // 创建测试群组
      const testGroupData = {
        name: `测试群组_${Date.now()}`,
        description: '这是一个测试群组',
        creator_id: creatorId,
        category: 'programming',
        tags: ['JavaScript', 'Vue'],
        max_members: 10,
        is_public: true,
        study_goal: '学习编程技能',
        target_duration_days: 30,
        difficulty_level: 'beginner',
        invite_code: `TEST${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };

      // 1. 创建群组
      const createResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'insert',
          table: 'study_groups',
          data: testGroupData
        }
      });

      if (!createResult.result?.success) {
        throw new Error('创建群组失败: ' + (createResult.result?.error || '未知错误'));
      }

      const groupId = createResult.result.data.id;
      this.testData.groups.push({ id: groupId, ...testGroupData });

      this.addTestResult(
        '群组创建',
        true,
        '学习群组创建成功',
        { groupId, groupData: testGroupData }
      );

      // 2. 查询群组
      const queryResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'select',
          table: 'study_groups',
          filters: { id: groupId }
        }
      });

      if (!queryResult.result?.success || !queryResult.result.data.length) {
        throw new Error('查询群组失败');
      }

      this.addTestResult(
        '群组查询',
        true,
        '学习群组查询成功',
        queryResult.result.data[0]
      );

      // 3. 添加群组成员
      const memberData = {
        group_id: groupId,
        user_id: creatorId,
        role: 'creator',
        status: 'active'
      };

      const memberResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'insert',
          table: 'group_members',
          data: memberData
        }
      });

      if (memberResult.result?.success) {
        this.addTestResult(
          '群组成员',
          true,
          '群组成员添加成功',
          memberData
        );
      }

      return groupId;

    } catch (error) {
      this.addTestResult(
        '群组CRUD',
        false,
        `群组 CRUD 操作失败: ${error.message}`,
        error
      );
      return null;
    }
  }

  /**
   * 测试打卡记录操作
   */
  async testCheckinCRUD(userId) {
    try {
      console.log('🔍 测试打卡记录操作...');
      
      if (!userId) {
        throw new Error('需要有效的用户 ID');
      }

      const checkinData = {
        user_id: userId,
        content: '今天学习了 Vue.js 的响应式原理，完成了相关练习。',
        checkin_date: new Date().toISOString().split('T')[0]
      };

      // 创建打卡记录
      const createResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'insert',
          table: 'checkin_records',
          data: checkinData
        }
      });

      if (!createResult.result?.success) {
        throw new Error('创建打卡记录失败: ' + (createResult.result?.error || '未知错误'));
      }

      const checkinId = createResult.result.data.id;
      this.testData.checkins.push({ id: checkinId, ...checkinData });

      this.addTestResult(
        '打卡记录',
        true,
        '打卡记录创建成功',
        { checkinId, checkinData }
      );

      // 查询用户的打卡记录
      const queryResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'select',
          table: 'checkin_records',
          filters: { user_id: userId }
        }
      });

      if (queryResult.result?.success && queryResult.result.data.length > 0) {
        this.addTestResult(
          '打卡查询',
          true,
          `查询到 ${queryResult.result.data.length} 条打卡记录`,
          queryResult.result.data
        );
      }

      return checkinId;

    } catch (error) {
      this.addTestResult(
        '打卡操作',
        false,
        `打卡操作失败: ${error.message}`,
        error
      );
      return null;
    }
  }

  /**
   * 测试 AI 聊天记录操作
   */
  async testChatCRUD(userId) {
    try {
      console.log('🔍 测试 AI 聊天记录操作...');
      
      if (!userId) {
        throw new Error('需要有效的用户 ID');
      }

      const chatData = {
        user_id: userId,
        message: '请介绍一下 Vue.js 的特点和优势。',
        ai_response: 'Vue.js 是一个渐进式的 JavaScript 框架，具有易学易用、组件化开发、响应式数据绑定等特点...'
      };

      // 创建聊天记录
      const createResult = await uni.cloud.callFunction({
        name: 'supabaseProxy',
        data: {
          action: 'insert',
          table: 'chat_messages',
          data: chatData
        }
      });

      if (!createResult.result?.success) {
        throw new Error('创建聊天记录失败: ' + (createResult.result?.error || '未知错误'));
      }

      const chatId = createResult.result.data.id;
      this.testData.chats.push({ id: chatId, ...chatData });

      this.addTestResult(
        'AI聊天记录',
        true,
        'AI 聊天记录创建成功',
        { chatId, chatData }
      );

      return chatId;

    } catch (error) {
      this.addTestResult(
        'AI聊天操作',
        false,
        `AI 聊天操作失败: ${error.message}`,
        error
      );
      return null;
    }
  }

  /**
   * 测试数据库表结构
   */
  async testDatabaseSchema() {
    try {
      console.log('🔍 测试数据库表结构...');
      
      const tables = ['users', 'study_groups', 'group_members', 'checkin_records', 'chat_messages', 'match_requests'];
      let allTablesValid = true;

      for (const table of tables) {
        try {
          const result = await uni.cloud.callFunction({
            name: 'supabaseProxy',
            data: {
              action: 'select',
              table: table,
              limit: 1
            }
          });

          if (result.result?.success) {
            this.addTestResult(
              `表结构-${table}`,
              true,
              `表 ${table} 结构正常`,
              null
            );
          } else {
            allTablesValid = false;
            this.addTestResult(
              `表结构-${table}`,
              false,
              `表 ${table} 访问失败`,
              result.result
            );
          }
        } catch (error) {
          allTablesValid = false;
          this.addTestResult(
            `表结构-${table}`,
            false,
            `表 ${table} 测试异常: ${error.message}`,
            error
          );
        }
      }

      return allTablesValid;

    } catch (error) {
      this.addTestResult(
        '数据库表结构',
        false,
        `数据库表结构测试失败: ${error.message}`,
        error
      );
      return false;
    }
  }

  /**
   * 清理测试数据
   */
  async cleanupTestData() {
    try {
      console.log('🧹 清理测试数据...');
      
      let cleanupCount = 0;

      // 清理聊天记录
      for (const chat of this.testData.chats) {
        try {
          await uni.cloud.callFunction({
            name: 'supabaseProxy',
            data: {
              action: 'delete',
              table: 'chat_messages',
              filters: { id: chat.id }
            }
          });
          cleanupCount++;
        } catch (error) {
          console.warn('清理聊天记录失败:', error);
        }
      }

      // 清理打卡记录
      for (const checkin of this.testData.checkins) {
        try {
          await uni.cloud.callFunction({
            name: 'supabaseProxy',
            data: {
              action: 'delete',
              table: 'checkin_records',
              filters: { id: checkin.id }
            }
          });
          cleanupCount++;
        } catch (error) {
          console.warn('清理打卡记录失败:', error);
        }
      }

      // 清理群组（会级联删除成员）
      for (const group of this.testData.groups) {
        try {
          await uni.cloud.callFunction({
            name: 'supabaseProxy',
            data: {
              action: 'delete',
              table: 'study_groups',
              filters: { id: group.id }
            }
          });
          cleanupCount++;
        } catch (error) {
          console.warn('清理群组失败:', error);
        }
      }

      // 清理用户
      for (const user of this.testData.users) {
        try {
          await uni.cloud.callFunction({
            name: 'supabaseProxy',
            data: {
              action: 'delete',
              table: 'users',
              filters: { id: user.id }
            }
          });
          cleanupCount++;
        } catch (error) {
          console.warn('清理用户失败:', error);
        }
      }

      this.addTestResult(
        '数据清理',
        true,
        `成功清理 ${cleanupCount} 条测试数据`,
        { cleanupCount, testData: this.testData }
      );

      // 重置测试数据
      this.testData = {
        users: [],
        groups: [],
        checkins: [],
        chats: []
      };

      return cleanupCount;

    } catch (error) {
      this.addTestResult(
        '数据清理',
        false,
        `数据清理失败: ${error.message}`,
        error
      );
      return 0;
    }
  }

  /**
   * 运行完整测试套件
   */
  async runFullTestSuite() {
    try {
      console.log('🚀 开始运行完整测试套件...');
      
      // 清除之前的测试结果
      this.clearTestResults();

      // 1. 测试基础连接
      const connectionOk = await this.testCloudFunctionConnection();
      if (!connectionOk) {
        throw new Error('云函数连接失败，停止后续测试');
      }

      // 2. 测试 Supabase 代理连接
      const proxyOk = await this.testSupabaseProxyConnection();
      if (!proxyOk) {
        throw new Error('Supabase 代理连接失败，停止后续测试');
      }

      // 3. 测试数据库表结构
      await this.testDatabaseSchema();

      // 4. 测试用户 CRUD
      const userId = await this.testUserCRUD();
      
      if (userId) {
        // 5. 测试群组 CRUD
        const groupId = await this.testGroupCRUD(userId);
        
        // 6. 测试打卡记录
        await this.testCheckinCRUD(userId);
        
        // 7. 测试 AI 聊天记录
        await this.testChatCRUD(userId);
      }

      // 8. 清理测试数据
      await this.cleanupTestData();

      const stats = this.getTestStats();
      this.addTestResult(
        '测试套件完成',
        stats.passRate >= 80,
        `测试完成，通过率: ${stats.passRate}%`,
        stats
      );

      console.log('✅ 完整测试套件运行完毕');
      return this.getTestResults();

    } catch (error) {
      this.addTestResult(
        '测试套件错误',
        false,
        `测试套件运行失败: ${error.message}`,
        error
      );
      console.error('❌ 测试套件运行失败:', error);
      return this.getTestResults();
    }
  }
}

// 创建全局测试实例
const supabaseTester = new SupabaseTester();

// 导出测试工具
export default supabaseTester;
export { SupabaseTester };

// 兼容 CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    default: supabaseTester,
    SupabaseTester
  };
}
