// cloudfunctions/supabaseCore/index.js
// 核心 Supabase 代理云函数 - 统一的数据访问层

const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

console.log('[supabaseCore] 云函数启动:', new Date().toISOString());

// Supabase 配置
const SUPABASE_CONFIG = {
  url: 'https://klpseujbhwvifsfshfdx.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MDg1NSwiZXhwIjoyMDY3MDE2ODU1fQ.-KRD7JaC50uWfTQPdnGI5ZYDZttTZcl-uKuIl6Y0jGc',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
};

/**
 * HTTP 请求封装
 */
async function makeRequest(url, options = {}) {
  const https = require('https');
  const { URL } = require('url');
  
  return new Promise((resolve, reject) => {
    try {
      const requestUrl = new URL(url);
      const requestOptions = {
        hostname: requestUrl.hostname,
        port: 443,
        path: requestUrl.pathname + requestUrl.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.serviceKey}`,
          ...options.headers
        },
        timeout: 10000
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = data ? JSON.parse(data) : {};
            resolve({
              success: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: result
            });
          } catch (parseError) {
            resolve({
              success: false,
              error: '响应解析失败',
              raw: data
            });
          }
        });
      });

      req.on('error', (error) => {
        reject({ success: false, error: error.message });
      });

      req.on('timeout', () => {
        req.destroy();
        reject({ success: false, error: '请求超时' });
      });

      // 发送数据
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      
      req.end();
    } catch (error) {
      reject({ success: false, error: error.message });
    }
  });
}

/**
 * 健康检查
 */
async function healthCheck() {
  try {
    console.log('[supabaseCore] 执行健康检查');
    
    const result = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET'
    });
    
    return {
      success: true,
      message: '健康检查通过',
      timestamp: new Date().toISOString(),
      supabase: result.success ? '连接正常' : '连接异常'
    };
  } catch (error) {
    console.error('[supabaseCore] 健康检查失败:', error);
    return {
      success: false,
      error: error.message || '健康检查失败'
    };
  }
}

/**
 * 连接测试
 */
async function connectionTest() {
  try {
    console.log('[supabaseCore] 执行连接测试');
    
    // 测试基本连接
    const healthResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET'
    });
    
    // 测试数据库连接（查询一个简单的表）
    const dbResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?limit=1`, {
      method: 'GET'
    });
    
    return {
      success: true,
      message: '连接测试完成',
      results: {
        api: healthResult.success,
        database: dbResult.success,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 连接测试失败:', error);
    return {
      success: false,
      error: error.message || '连接测试失败'
    };
  }
}

/**
 * 数据库测试
 */
async function databaseTest() {
  try {
    console.log('[supabaseCore] 执行数据库测试');
    
    // 测试各个表的基本查询
    const tests = [];
    
    // 测试 users 表
    try {
      const usersResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?limit=1`, {
        method: 'GET'
      });
      tests.push({ table: 'users', success: usersResult.success });
    } catch (error) {
      tests.push({ table: 'users', success: false, error: error.message });
    }
    
    // 测试 study_groups 表
    try {
      const groupsResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/study_groups?limit=1`, {
        method: 'GET'
      });
      tests.push({ table: 'study_groups', success: groupsResult.success });
    } catch (error) {
      tests.push({ table: 'study_groups', success: false, error: error.message });
    }
    
    const passedTests = tests.filter(t => t.success).length;
    
    return {
      success: passedTests > 0,
      message: `数据库测试完成: ${passedTests}/${tests.length} 个表测试通过`,
      tests: tests
    };
  } catch (error) {
    console.error('[supabaseCore] 数据库测试失败:', error);
    return {
      success: false,
      error: error.message || '数据库测试失败'
    };
  }
}

/**
 * 用户系统测试
 */
async function userSystemTest(userData) {
  try {
    console.log('[supabaseCore] 执行用户系统测试');
    
    const testUser = {
      openid: userData.openid || 'test_' + Date.now(),
      nickname: userData.nickname || '测试用户',
      email: userData.email || 'test@example.com',
      created_at: new Date().toISOString()
    };
    
    // 尝试创建用户
    const createResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users`, {
      method: 'POST',
      body: testUser
    });
    
    let cleanupResult = null;
    if (createResult.success) {
      // 尝试清理测试数据
      try {
        cleanupResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?openid=eq.${testUser.openid}`, {
          method: 'DELETE'
        });
      } catch (cleanupError) {
        console.warn('[supabaseCore] 清理测试数据失败:', cleanupError);
      }
    }
    
    return {
      success: createResult.success,
      message: '用户系统测试完成',
      results: {
        create: createResult.success,
        cleanup: cleanupResult ? cleanupResult.success : false
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 用户系统测试失败:', error);
    return {
      success: false,
      error: error.message || '用户系统测试失败'
    };
  }
}

/**
 * 群组系统测试
 */
async function groupSystemTest(groupData) {
  try {
    console.log('[supabaseCore] 执行群组系统测试');
    
    const testGroup = {
      name: groupData.name || '测试学习群',
      description: groupData.description || '这是一个测试群组',
      category: groupData.category || 'programming',
      creator_id: 'test_creator_' + Date.now(),
      created_at: new Date().toISOString()
    };
    
    // 尝试创建群组
    const createResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/study_groups`, {
      method: 'POST',
      body: testGroup
    });
    
    return {
      success: createResult.success,
      message: '群组系统测试完成',
      results: {
        create: createResult.success
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 群组系统测试失败:', error);
    return {
      success: false,
      error: error.message || '群组系统测试失败'
    };
  }
}

/**
 * 主函数入口
 */
exports.main = async (event, context) => {
  console.log('[supabaseCore] 收到请求:', event);
  
  const { action, data = {} } = event;
  
  if (!action) {
    return {
      success: false,
      error: '缺少 action 参数'
    };
  }
  
  try {
    let result;
    
    switch (action) {
      case 'healthCheck':
        result = await healthCheck();
        break;
        
      case 'connectionTest':
        result = await connectionTest();
        break;
        
      case 'databaseTest':
        result = await databaseTest();
        break;
        
      case 'userSystemTest':
        result = await userSystemTest(data);
        break;
        
      case 'groupSystemTest':
        result = await groupSystemTest(data);
        break;
        
      default:
        result = {
          success: false,
          error: `不支持的操作: ${action}`
        };
    }
    
    console.log(`[supabaseCore] ${action} 执行结果:`, result);
    return result;
    
  } catch (error) {
    console.error(`[supabaseCore] ${action} 执行异常:`, error);
    return {
      success: false,
      error: error.message || '云函数执行异常',
      action: action
    };
  }
};
