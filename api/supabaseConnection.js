// api/supabaseConnection.js
// 简化的 Supabase 连接类

/**
 * Supabase 连接类 - 通过云函数代理访问
 */
class SupabaseConnection {
  constructor() {
    this.isReady = false;
    this.config = {
      url: 'https://klpseujbhwvifsfshfdx.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
    };
  }

  /**
   * 测试连接
   */
  async testConnection() {
    console.log('[SupabaseConnection] 开始连接测试');
    
    try {
      const result = await this.callCloudFunction('supabaseCore', {
        action: 'connectionTest'
      });
      
      if (result.success) {
        console.log('[SupabaseConnection] 连接测试成功');
        this.isReady = true;
        return { success: true, method: 'cloudFunction', data: result };
      } else {
        console.error('[SupabaseConnection] 连接测试失败:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('[SupabaseConnection] 连接测试异常:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 调用云函数
   */
  async callCloudFunction(functionName, data) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: functionName,
        data: data,
        success: (res) => {
          try {
            let result = res.result;
            if (typeof result === 'string') {
              result = JSON.parse(result);
            }
            resolve(result);
          } catch (error) {
            reject(new Error('响应解析失败'));
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '云函数调用失败'));
        }
      });
    });
  }
}

export { SupabaseConnection };
