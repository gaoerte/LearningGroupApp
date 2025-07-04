/**
 * 简化版 学习小组 API 管理器
 * 用于解决模块加载问题
 */

class SimpleLearningGroupAPI {
  constructor() {
    this.cloudFunctionName = 'learningGroupAPI';
    this.currentUser = null;
    console.log('[SimpleLearningGroupAPI] 初始化完成');
  }

  /**
   * 调用云函数
   */
  async callCloudFunction(action, params = {}) {
    try {
      console.log(`[API] 调用云函数 ${action}:`, params);
      
      const result = await uniCloud.callFunction({
        name: this.cloudFunctionName,
        data: {
          action,
          ...params
        }
      });
      
      console.log(`[API] ${action} 云函数响应:`, result);
      
      if (result.result?.success) {
        return result.result.data;
      } else {
        throw new Error(result.result?.error || '调用失败');
      }
    } catch (error) {
      console.error(`[API] ${action} 云函数调用失败:`, error);
      throw error;
    }
  }

  /**
   * 初始化当前用户
   */
  async initCurrentUser() {
    try {
      // 获取微信用户信息
      const userInfo = await this.getWechatUserInfo();
      
      // 创建或更新用户信息
      this.currentUser = await this.callCloudFunction('createUser', {
        openid: userInfo.openid,
        nickname: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
      
      console.log('[API] 当前用户初始化成功:', this.currentUser);
      return this.currentUser;
      
    } catch (error) {
      console.error('[API] 用户初始化失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取微信用户信息
   */
  async getWechatUserInfo() {
    return new Promise((resolve) => {
      // 简化版本，直接使用默认信息
      resolve({
        openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
        nickName: '用户' + Math.floor(Math.random() * 1000),
        avatarUrl: '/static/default-avatar.png'
      });
    });
  }

  /**
   * 获取群组列表
   */
  async getGroups(category = null, limit = 20, offset = 0) {
    return await this.callCloudFunction('getGroups', { category, limit, offset });
  }

  /**
   * 创建群组
   */
  async createGroup(groupData) {
    if (!this.currentUser) {
      throw new Error('用户未登录');
    }
    
    return await this.callCloudFunction('createGroup', {
      ...groupData,
      creatorOpenid: this.currentUser.openid
    });
  }

  /**
   * 加入群组
   */
  async joinGroup(groupId) {
    if (!this.currentUser) {
      throw new Error('用户未登录');
    }
    
    return await this.callCloudFunction('joinGroup', {
      groupId,
      userOpenid: this.currentUser.openid
    });
  }

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return this.currentUser !== null;
  }
}

// 创建实例
const simpleLearningGroupAPI = new SimpleLearningGroupAPI();

// 导出
module.exports = simpleLearningGroupAPI;
