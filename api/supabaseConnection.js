// api/supabaseConnection.js
// 前端到 Supabase 的完整连接示例

/**
 * 通过云函数连接 Supabase 的统一接口
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
    console.log('[Supabase] 开始连接测试');
    
    try {
      // 方法1: 尝试简化版云函数
      const result1 = await this.callCloudFunction('supabaseProxySimple', {
        action: 'testConnection',
        data: this.config
      });
      
      if (result1.success) {
        console.log('[Supabase] 简化版云函数连接成功');
        this.isReady = true;
        return { success: true, method: 'cloudFunction-simple', data: result1 };
      }
    } catch (error1) {
      console.warn('[Supabase] 简化版云函数失败，尝试完整版:', error1.message);
    }

    try {
      // 方法2: 尝试完整版云函数
      const result2 = await this.callCloudFunction('supabaseProxy', {
        action: 'testConnection',
        data: this.config
      });
      
      if (result2.success) {
        console.log('[Supabase] 完整版云函数连接成功');
        this.isReady = true;
        return { success: true, method: 'cloudFunction-full', data: result2 };
      }
    } catch (error2) {
      console.warn('[Supabase] 完整版云函数失败，尝试直连:', error2.message);
    }

    try {
      // 方法3: 直接HTTP连接
      const result3 = await this.directHttpRequest();
      
      if (result3.success) {
        console.log('[Supabase] 直接HTTP连接成功');
        this.isReady = true;
        return { success: true, method: 'direct-http', data: result3 };
      }
    } catch (error3) {
      console.error('[Supabase] 所有连接方法都失败:', error3.message);
    }

    return { success: false, error: '所有连接方法都失败' };
  }

  /**
   * 调用云函数
   */
  async callCloudFunction(functionName, data) {
    return new Promise((resolve, reject) => {
      // 确保云函数已初始化
      if (!uni.cloud) {
        reject(new Error('云函数环境未初始化'));
        return;
      }
      
      uni.cloud.callFunction({
        name: functionName,
        data: data,
        success: (res) => {
          try {
            // 更安全的响应处理
            let result = res.result;
            
            // 如果result是字符串，尝试解析为JSON
            if (typeof result === 'string') {
              try {
                result = JSON.parse(result);
              } catch (parseError) {
                console.warn('云函数返回数据解析失败:', parseError);
                // 如果解析失败，直接使用字符串结果
                result = { success: false, error: '响应格式错误', raw: result };
              }
            }
            
            // 检查是否有有效的结果
            if (result && typeof result === 'object') {
              if (result.success) {
                resolve(result);
              } else {
                reject(new Error(result.error || '云函数执行失败'));
              }
            } else {
              reject(new Error('云函数返回格式异常'));
            }
          } catch (error) {
            console.error('云函数响应处理失败:', error);
            reject(new Error('解析云函数响应失败: ' + error.message));
          }
        },
        fail: (error) => {
          console.error('云函数调用失败:', error);
          reject(new Error('云函数调用失败: ' + (error.errMsg || error.message)));
        }
      });
    });
  }

  /**
   * 直接HTTP请求
   */
  async directHttpRequest() {
    return new Promise((resolve, reject) => {
      uni.request({
        url: this.config.url + '/rest/v1/',
        method: 'GET',
        header: {
          'Authorization': 'Bearer ' + this.config.anonKey,
          'apikey': this.config.anonKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
        dataType: 'text', // 避免自动JSON解析
        responseType: 'text',
        success: (res) => {
          try {
            console.log('[Supabase] HTTP请求成功，状态码:', res.statusCode);
            
            if (res.statusCode === 200 || res.statusCode === 404) {
              // 200表示成功，404表示路径不存在但连接正常
              resolve({ 
                success: true, 
                status: res.statusCode, 
                data: 'connection_ok',
                message: res.statusCode === 200 ? '连接成功' : '连接正常（端点不存在是预期行为）'
              });
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.data || '请求失败'}`));
            }
          } catch (error) {
            console.error('[Supabase] HTTP响应处理失败:', error);
            reject(new Error('处理响应失败: ' + error.message));
          }
        },
        fail: (error) => {
          console.error('[Supabase] HTTP请求失败:', error);
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });
  }

  /**
   * 用户相关操作
   */
  async getUserData(userId) {
    if (!this.isReady) {
      await this.testConnection();
    }

    try {
      // 优先使用云函数
      const result = await this.callCloudFunction('supabaseProxy', {
        action: 'getUser',
        data: { userId }
      });
      
      return result;
    } catch (error) {
      console.error('[Supabase] 获取用户数据失败:', error);
      throw error;
    }
  }

  /**
   * 创建用户
   */
  async createUser(userData) {
    if (!this.isReady) {
      await this.testConnection();
    }

    try {
      const result = await this.callCloudFunction('supabaseProxy', {
        action: 'createUser',
        data: userData
      });
      
      return result;
    } catch (error) {
      console.error('[Supabase] 创建用户失败:', error);
      throw error;
    }
  }

  /**
   * 学习打卡
   */
  async checkin(checkinData) {
    if (!this.isReady) {
      await this.testConnection();
    }

    try {
      const result = await this.callCloudFunction('supabaseProxy', {
        action: 'checkin',
        data: checkinData
      });
      
      return result;
    } catch (error) {
      console.error('[Supabase] 打卡失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户打卡记录
   */
  async getCheckinHistory(userId, limit = 10) {
    if (!this.isReady) {
      await this.testConnection();
    }

    try {
      const result = await this.callCloudFunction('supabaseProxy', {
        action: 'getCheckinHistory',
        data: { userId, limit }
      });
      
      return result;
    } catch (error) {
      console.error('[Supabase] 获取打卡记录失败:', error);
      throw error;
    }
  }

  /**
   * 群组相关操作
   */
  async getGroups(userId) {
    if (!this.isReady) {
      await this.testConnection();
    }

    try {
      const result = await this.callCloudFunction('supabaseProxy', {
        action: 'getUserGroups',
        data: { userId }
      });
      
      return result;
    } catch (error) {
      console.error('[Supabase] 获取群组失败:', error);
      throw error;
    }
  }

  /**
   * 加入群组
   */
  async joinGroup(userId, groupId) {
    if (!this.isReady) {
      await this.testConnection();
    }

    try {
      const result = await this.callCloudFunction('supabaseProxy', {
        action: 'joinGroup',
        data: { userId, groupId }
      });
      
      return result;
    } catch (error) {
      console.error('[Supabase] 加入群组失败:', error);
      throw error;
    }
  }
}

// 创建全局实例
const supabaseConnection = new SupabaseConnection();

export default supabaseConnection;

// 便捷方法导出
export const testSupabaseConnection = () => supabaseConnection.testConnection();
export const getUserData = (userId) => supabaseConnection.getUserData(userId);
export const createUser = (userData) => supabaseConnection.createUser(userData);
export const checkin = (checkinData) => supabaseConnection.checkin(checkinData);
export const getCheckinHistory = (userId, limit) => supabaseConnection.getCheckinHistory(userId, limit);
export const getGroups = (userId) => supabaseConnection.getGroups(userId);
export const joinGroup = (userId, groupId) => supabaseConnection.joinGroup(userId, groupId);
