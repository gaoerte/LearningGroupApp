// cloudfunctions/supabaseProxySimple/index.js
// 简化版 Supabase 代理云函数 - 仅用于连接测试

const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

console.log('简化版 Supabase 代理云函数启动:', new Date().toISOString());

/**
 * 云函数入口函数
 */
exports.main = async (event, context) => {
  console.log('收到请求:', JSON.stringify(event, null, 2));
  
  try {
    const { action, data } = event;
    
    switch (action) {
      case 'testConnection':
        return await testConnection(data);
      case 'testDatabase':
        return await testDatabase(data);
      default:
        return {
          success: false,
          error: '不支持的操作: ' + action
        };
    }
  } catch (error) {
    console.error('云函数执行错误:', error);
    return {
      success: false,
      error: error.message || '云函数执行失败'
    };
  }
};

/**
 * 测试 Supabase 连接
 */
async function testConnection(config) {
  console.log('开始测试连接...');
  
  if (!config || !config.url || !config.anonKey) {
    return {
      success: false,
      error: '缺少必要的配置参数'
    };
  }
  
  try {
    // 使用 Node.js 原生 HTTPS 模块测试连接
    const result = await new Promise((resolve, reject) => {
      const https = require('https');
      const url = require('url');
      
      const requestUrl = new URL(config.url + '/rest/v1/');
      const options = {
        hostname: requestUrl.hostname,
        port: requestUrl.port || 443,
        path: requestUrl.pathname,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + config.anonKey,
          'apikey': config.anonKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };
      
      const req = https.request(options, (res) => {
        console.log('连接测试响应状态:', res.statusCode);
        resolve({
          success: true,
          data: {
            status: res.statusCode,
            message: '连接成功',
            timestamp: new Date().toISOString()
          }
        });
      });
      
      req.on('error', (err) => {
        console.error('连接测试失败:', err);
        reject(new Error(err.message || '网络请求失败'));
      });
      
      req.on('timeout', () => {
        console.error('连接测试超时');
        reject(new Error('请求超时'));
      });
      
      req.setTimeout(10000);
      req.end();
    });
    
    return result;
  } catch (error) {
    console.error('连接测试异常:', error);
    return {
      success: false,
      error: error.message || '连接测试失败'
    };
  }
}

/**
 * 测试数据库访问
 */
async function testDatabase(config) {
  console.log('开始测试数据库...');
  
  if (!config || !config.url || !config.anonKey) {
    return {
      success: false,
      error: '缺少必要的配置参数'
    };
  }
  
  try {
    // 尝试访问一个不存在的表来测试数据库连接
    const result = await new Promise((resolve, reject) => {
      const https = require('https');
      const url = require('url');
      
      const requestUrl = new URL(config.url + '/rest/v1/test_table?limit=1');
      const options = {
        hostname: requestUrl.hostname,
        port: requestUrl.port || 443,
        path: requestUrl.pathname + requestUrl.search,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + config.anonKey,
          'apikey': config.anonKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };
      
      const req = https.request(options, (res) => {
        console.log('数据库测试响应状态:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 404) {
            // 404 错误说明连接正常，只是表不存在
            resolve({
              success: true,
              data: {
                status: 404,
                message: '数据库连接正常（表不存在是预期行为）',
                timestamp: new Date().toISOString()
              }
            });
          } else {
            resolve({
              success: true,
              data: {
                status: res.statusCode,
                message: '数据库连接正常',
                timestamp: new Date().toISOString()
              }
            });
          }
        });
      });
      
      req.on('error', (err) => {
        console.error('数据库测试失败:', err);
        reject(new Error(err.message || '数据库连接失败'));
      });
      
      req.on('timeout', () => {
        console.error('数据库测试超时');
        reject(new Error('数据库请求超时'));
      });
      
      req.setTimeout(10000);
      req.end();
    });
    
    return result;
  } catch (error) {
    console.error('数据库测试异常:', error);
    return {
      success: false,
      error: error.message || '数据库测试失败'
    };
  }
}
