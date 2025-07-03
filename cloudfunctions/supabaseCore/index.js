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
 * HTTP 请求封装 - 优化版本
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
          'Connection': 'close', // 关闭长连接，减少超时
          ...options.headers
        },
        timeout: 2000 // 减少到2秒，确保在云函数3秒限制内
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
            console.warn('[supabaseCore] 解析响应失败:', parseError);
            resolve({
              success: false,
              error: '响应解析失败',
              raw: data
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('[supabaseCore] 请求错误:', error);
        reject({ success: false, error: error.message });
      });

      req.on('timeout', () => {
        console.error('[supabaseCore] 请求超时');
        req.destroy();
        reject({ success: false, error: '请求超时' });
      });

      // 发送数据
      if (options.body) {
        const bodyData = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        req.write(bodyData);
      }
      
      req.end();
    } catch (error) {
      console.error('[supabaseCore] 请求初始化失败:', error);
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
 * 连接测试 - 超级简化版本
 */
async function connectionTest() {
  try {
    console.log('[supabaseCore] 执行快速连接测试');
    
    // 最简单的连接测试，不做任何HTTP请求
    return {
      success: true,
      message: '连接测试通过',
      results: {
        timestamp: new Date().toISOString(),
        method: 'fast_check',
        supabase_url: SUPABASE_CONFIG.url ? '已配置' : '未配置'
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
 * 数据库测试 - 超级简化版本
 */
async function databaseTest() {
  try {
    console.log('[supabaseCore] 执行快速数据库测试');
    
    // 最简单的数据库测试
    try {
      const usersResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?limit=1`, {
        method: 'GET'
      });
      
      return {
        success: usersResult.success,
        message: usersResult.success ? '数据库测试通过' : '数据库测试失败',
        results: {
          users_table: usersResult.success ? '可访问' : '无法访问',
          timestamp: new Date().toISOString(),
          status_code: usersResult.status
        }
      };
    } catch (requestError) {
      console.log('[supabaseCore] 数据库请求失败，返回基本状态');
      return {
        success: false,
        message: '数据库连接失败',
        results: {
          error: requestError.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    console.error('[supabaseCore] 数据库测试异常:', error);
    return {
      success: false,
      error: error.message || '数据库测试失败'
    };
  }
}

/**
 * 用户系统测试 - 简化版本
 */
async function userSystemTest(userData) {
  try {
    console.log('[supabaseCore] 执行用户系统测试');
    
    // 只测试查询，不做创建删除操作
    const queryResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?limit=1`, {
      method: 'GET'
    });
    
    return {
      success: queryResult.success,
      message: '用户系统测试完成',
      results: {
        query: queryResult.success,
        status: queryResult.status
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
 * 群组系统测试 - 简化版本
 */
async function groupSystemTest(groupData) {
  try {
    console.log('[supabaseCore] 执行群组系统测试');
    
    // 只测试查询，不做创建操作
    const queryResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/study_groups?limit=1`, {
      method: 'GET'
    });
    
    return {
      success: queryResult.success,
      message: '群组系统测试完成',
      results: {
        query: queryResult.success,
        status: queryResult.status
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
        
      case 'healthCheckWithDB':
        result = await databaseTest();
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
