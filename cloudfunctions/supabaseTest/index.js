// cloudfunctions/supabaseTest/index.js
// 专用于测试的简化 Supabase 云函数

const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 简化的 HTTP 请求函数
 */
function makeHttpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      url: url,
      method: options.method || 'GET',
      header: {
        'Content-Type': 'application/json',
        'apikey': options.apikey || '',
        'Authorization': options.authorization || '',
        ...options.headers
      },
      data: options.body ? JSON.stringify(options.body) : undefined,
      timeout: 10000,
      success: (res) => {
        console.log('HTTP 请求成功:', res);
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          data: res.data,
          headers: res.header
        });
      },
      fail: (err) => {
        console.error('HTTP 请求失败:', err);
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    };

    console.log('发起 HTTP 请求:', requestOptions);
    cloud.request(requestOptions);
  });
}

/**
 * 测试 Supabase 连接
 */
async function testSupabaseConnection(config) {
  try {
    console.log('开始测试 Supabase 连接...');
    
    const { url, anonKey } = config;
    if (!url || !anonKey) {
      throw new Error('缺少必要的配置参数: url 或 anonKey');
    }

    // 测试基础连接 - 获取服务状态
    const healthCheckUrl = `${url}/rest/v1/`;
    const response = await makeHttpRequest(healthCheckUrl, {
      method: 'GET',
      apikey: anonKey,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log('健康检查响应:', response);

    return {
      success: true,
      message: 'Supabase 连接成功',
      data: {
        status: response.status,
        connected: response.ok,
        url: url.replace(/\/rest\/v1\/$/, '')
      }
    };

  } catch (error) {
    console.error('Supabase 连接测试失败:', error);
    return {
      success: false,
      message: `连接失败: ${error.message}`,
      error: error.toString()
    };
  }
}

/**
 * 测试数据库表访问
 */
async function testTableAccess(config, tableName = 'users') {
  try {
    console.log(`开始测试表访问: ${tableName}`);
    
    const { url, anonKey } = config;
    const tableUrl = `${url}/rest/v1/${tableName}?limit=1`;
    
    const response = await makeHttpRequest(tableUrl, {
      method: 'GET',
      apikey: anonKey,
      headers: {
        'Accept': 'application/json'
      }
    });

    console.log(`表 ${tableName} 访问响应:`, response);

    return {
      success: true,
      message: `表 ${tableName} 访问成功`,
      data: {
        table: tableName,
        accessible: response.ok,
        recordCount: Array.isArray(response.data) ? response.data.length : 0
      }
    };

  } catch (error) {
    console.error(`表 ${tableName} 访问失败:`, error);
    return {
      success: false,
      message: `表访问失败: ${error.message}`,
      error: error.toString(),
      table: tableName
    };
  }
}

/**
 * 测试用户创建
 */
async function testUserCreation(config) {
  try {
    console.log('开始测试用户创建...');
    
    const { url, anonKey } = config;
    const usersUrl = `${url}/rest/v1/users`;
    
    const testUser = {
      openid: `test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      nickname: '测试用户',
      bio: '这是一个测试用户',
      level: 1
    };

    const response = await makeHttpRequest(usersUrl, {
      method: 'POST',
      apikey: anonKey,
      headers: {
        'Accept': 'application/json',
        'Prefer': 'return=representation'
      },
      body: testUser
    });

    console.log('用户创建响应:', response);

    if (response.ok && response.data) {
      // 创建成功，立即删除测试数据
      try {
        const deleteUrl = `${usersUrl}?openid=eq.${testUser.openid}`;
        await makeHttpRequest(deleteUrl, {
          method: 'DELETE',
          apikey: anonKey
        });
        console.log('测试用户已删除');
      } catch (deleteError) {
        console.warn('删除测试用户失败:', deleteError);
      }

      return {
        success: true,
        message: '用户创建测试成功',
        data: {
          created: true,
          user: response.data
        }
      };
    } else {
      throw new Error(`创建失败，状态码: ${response.status}`);
    }

  } catch (error) {
    console.error('用户创建测试失败:', error);
    return {
      success: false,
      message: `用户创建失败: ${error.message}`,
      error: error.toString()
    };
  }
}

/**
 * 云函数主入口
 */
exports.main = async (event, context) => {
  console.log('Supabase 测试云函数被调用:', event);

  try {
    const { action, config } = event;

    // 默认配置
    const defaultConfig = {
      url: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
      anonKey: process.env.SUPABASE_ANON_KEY || 'your-anon-key'
    };

    const testConfig = { ...defaultConfig, ...config };

    switch (action) {
      case 'ping':
        return {
          success: true,
          message: '云函数连接正常',
          timestamp: new Date().toISOString(),
          env: cloud.DYNAMIC_CURRENT_ENV
        };

      case 'testConnection':
        return await testSupabaseConnection(testConfig);

      case 'testTable':
        const tableName = event.table || 'users';
        return await testTableAccess(testConfig, tableName);

      case 'testAllTables':
        const tables = ['users', 'study_groups', 'group_members', 'checkin_records', 'chat_messages', 'match_requests'];
        const results = [];
        
        for (const table of tables) {
          const result = await testTableAccess(testConfig, table);
          results.push(result);
        }
        
        const successCount = results.filter(r => r.success).length;
        return {
          success: successCount === tables.length,
          message: `表测试完成: ${successCount}/${tables.length} 成功`,
          data: {
            totalTables: tables.length,
            successCount,
            results
          }
        };

      case 'testUserCRUD':
        return await testUserCreation(testConfig);

      case 'fullTest':
        console.log('开始完整测试...');
        
        const testResults = [];
        
        // 1. 测试连接
        const connectionResult = await testSupabaseConnection(testConfig);
        testResults.push({ test: 'connection', ...connectionResult });
        
        if (!connectionResult.success) {
          return {
            success: false,
            message: '连接测试失败，停止后续测试',
            results: testResults
          };
        }
        
        // 2. 测试所有表
        const tableResults = await testTableAccess(testConfig, 'users');
        testResults.push({ test: 'table_access', ...tableResults });
        
        // 3. 测试用户创建
        const userResult = await testUserCreation(testConfig);
        testResults.push({ test: 'user_crud', ...userResult });
        
        const totalTests = testResults.length;
        const passedTests = testResults.filter(r => r.success).length;
        const passRate = Math.round((passedTests / totalTests) * 100);
        
        return {
          success: passRate >= 80,
          message: `完整测试完成，通过率: ${passRate}%`,
          data: {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            passRate,
            results: testResults
          }
        };

      default:
        return {
          success: false,
          message: `未知的操作: ${action}`,
          supportedActions: ['ping', 'testConnection', 'testTable', 'testAllTables', 'testUserCRUD', 'fullTest']
        };
    }

  } catch (error) {
    console.error('云函数执行失败:', error);
    return {
      success: false,
      message: `云函数执行失败: ${error.message}`,
      error: error.toString(),
      stack: error.stack
    };
  }
};
