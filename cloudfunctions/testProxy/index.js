// cloudfunctions/testProxy/index.js
// 简化的测试云函数 - 用于调试小程序连接问题

const cloud = require('wx-server-sdk');

// 初始化
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 简单的测试云函数
 */
exports.main = async (event, context) => {
  console.log('测试云函数被调用:', {
    event,
    context: {
      openId: context.OPENID,
      appId: context.APPID,
      unionId: context.UNIONID
    },
    timestamp: new Date().toISOString()
  });

  const { action = 'ping', data = {} } = event;

  try {
    switch (action) {
      case 'ping':
        return {
          success: true,
          message: '云函数连接正常',
          timestamp: new Date().toISOString(),
          context: {
            openId: context.OPENID,
            hasOpenId: !!context.OPENID
          }
        };

      case 'echo':
        return {
          success: true,
          message: '回显测试',
          receivedData: data,
          timestamp: new Date().toISOString()
        };

      case 'error':
        throw new Error('这是一个测试错误');

      case 'timeout':
        // 模拟超时
        await new Promise(resolve => setTimeout(resolve, 15000));
        return {
          success: true,
          message: '超时测试完成'
        };

      case 'memory':
        // 内存使用情况
        const memUsage = process.memoryUsage();
        return {
          success: true,
          memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
          },
          timestamp: new Date().toISOString()
        };

      case 'env':
        // 环境变量检查
        return {
          success: true,
          environment: {
            nodeVersion: process.version,
            platform: process.platform,
            hasSupabaseUrl: !!process.env.SUPABASE_URL,
            hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
            envType: process.env.NODE_ENV || 'unknown'
          },
          timestamp: new Date().toISOString()
        };

      case 'request':
        // 测试外部请求
        try {
          const testResult = await cloud.request({
            url: 'https://httpbin.org/json',
            method: 'GET',
            timeout: 5000
          });
          
          return {
            success: true,
            message: '外部请求测试成功',
            requestResult: {
              statusCode: testResult.statusCode,
              hasData: !!testResult.data
            },
            timestamp: new Date().toISOString()
          };
        } catch (requestError) {
          return {
            success: false,
            error: '外部请求测试失败: ' + requestError.message,
            code: 'REQUEST_FAILED'
          };
        }

      default:
        return {
          success: false,
          error: `未知的测试操作: ${action}`,
          availableActions: ['ping', 'echo', 'error', 'timeout', 'memory', 'env', 'request']
        };
    }
  } catch (error) {
    console.error('测试云函数执行失败:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
  }
};
