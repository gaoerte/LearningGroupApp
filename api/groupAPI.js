// api/groupAPI.js - 群组相关API封装

/**
 * 群组API类
 */
class GroupAPI {
  
  /**
   * 通用云函数调用方法
   * @param {Object} params - 调用参数
   * @returns {Promise<Object>} - 返回Promise
   */
  static async callCloudFunction(params) {
    return new Promise((resolve, reject) => {
      console.log(`[GroupAPI] 调用云函数: ${params.action}`);
      
      uni.cloud.callFunction({
        name: 'supabaseCore',
        data: params,
        dataType: 'text',  // 避免自动JSON解析导致的问题
        success: (res) => {
          try {
            // 安全地处理响应
            let result = res.result;
            
            // 如果返回的是字符串，尝试解析JSON
            if (typeof result === 'string') {
              try {
                result = JSON.parse(result);
              } catch (parseError) {
                console.warn(`[GroupAPI] ${params.action} 响应解析失败:`, parseError);
              }
            }
            
            if (result && result.success) {
              console.log(`[GroupAPI] ${params.action} 成功:`, result);
              resolve(result);
            } else {
              console.error(`[GroupAPI] ${params.action} 失败:`, result?.error || '未知错误');
              reject(new Error(result?.error || `${params.action}操作失败`));
            }
          } catch (error) {
            console.error(`[GroupAPI] ${params.action} 响应处理异常:`, error);
            reject(error);
          }
        },
        fail: (error) => {
          console.error(`[GroupAPI] ${params.action} 请求失败:`, error);
          reject(new Error(error.errMsg || error.message || '请求失败'));
        }
      });
    });
  }
  
  /**
   * 创建群组
   * @param {String} openid - 用户openid
   * @param {Object} groupInfo - 群组信息对象
   * @returns {Promise<Object>} - 创建结果
   */
  static async createGroup(openid, groupInfo) {
    return this.callCloudFunction({
      action: 'create',
      openid,
      groupInfo
    });
  }

  /**
   * 搜索群组
   * @param {String} searchQuery - 搜索关键词
   * @returns {Promise<Object>} - 搜索结果
   */
  static async searchGroups(searchQuery = '') {
    return this.callCloudFunction({
      action: 'search',
      searchQuery
    });
  }

  /**
   * 加入群组
   * @param {String} openid - 用户openid
   * @param {String} groupId - 群组ID
   * @returns {Promise<Object>} - 操作结果
   */
  static async joinGroup(openid, groupId) {
    return this.callCloudFunction({
      action: 'join',
      openid,
      groupId
    });
  }

  /**
   * 退出群组
   * @param {String} openid - 用户openid
   * @param {String} groupId - 群组ID
   * @returns {Promise<Object>} - 操作结果
   */
  static async leaveGroup(openid, groupId) {
    return this.callCloudFunction({
      action: 'leave',
      openid,
      groupId
    });
  }

  /**
   * 获取用户加入的群组列表
   * @param {String} openid - 用户openid
   * @returns {Promise<Object>} - 群组列表
   */
  static async getUserGroups(openid) {
    return this.callCloudFunction({
      action: 'list',
      openid
    });
  }

  /**
   * 获取群组详情
   * @param {String} groupId - 群组ID
   * @returns {Promise<Object>} - 群组详情
   */
  static async getGroupInfo(groupId) {
    return this.callCloudFunction({
      action: 'get',
      groupId
    });
  }
  
  /**
   * 测试连接
   * @param {Boolean} testDB - 是否测试数据库连接
   * @returns {Promise<Object>} - 测试结果
   */
  static async testConnection(testDB = false) {
    return this.callCloudFunction({
      action: testDB ? 'healthCheckWithDB' : 'healthCheck'
    });
  }
}

export { GroupAPI };