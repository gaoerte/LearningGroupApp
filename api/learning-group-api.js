/**
 * 学习小组 API 管理器
 * 统一管理所有数据库API调用，替换模拟数据
 */

class LearningGroupAPI {
  
  constructor() {
    this.cloudFunctionName = 'learningGroupAPI';
    this.currentUser = null;
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
      
      // 如果是网络错误或云函数不可用，则提供用户友好的错误信息
      if (error.message?.includes('uniCloud')) {
        throw new Error('网络连接失败，请检查网络后重试');
      }
      
      throw error;
    }
  }
  
  /**
   * 模拟数据降级方法（现在不再使用，但保留以备测试）
   */
  getMockData(action, params) {
    console.log(`[API] 使用模拟数据 ${action}:`, params);
    
    switch (action) {
      case 'getCurrentUser':
        return {
          id: 'mock_user_001',
          openid: 'mock_user_001',
          nickname: '测试用户',
          avatar_url: '/static/logo.png',
          bio: '这是一个测试用户'
        };
        
      case 'getGroups':
        return [
          {
            id: 'mock_group_001',
            name: '前端开发学习小组',
            description: '一起学习React、Vue、JavaScript等前端技术',
            category: 'programming',
            member_count: 12,
            created_at: new Date().toISOString()
          },
          {
            id: 'mock_group_002', 
            name: 'UI设计交流群',
            description: '分享设计灵感，讨论用户体验',
            category: 'design',
            member_count: 8,
            created_at: new Date().toISOString()
          }
        ];
        
      case 'joinGroup':
        return { success: true, message: '加入成功' };
        
      case 'createGroup':
        return {
          id: 'mock_group_' + Date.now(),
          name: params.name || '新建群组',
          description: params.description || '',
          category: params.category || 'other',
          member_count: 1,
          created_at: new Date().toISOString(),
          creator_id: 'mock_user_001'
        };
        
      default:
        return { success: false, error: '不支持的操作' };
    }
  }

  // ================================
  // 用户相关API
  // ================================
  
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
    return new Promise((resolve, reject) => {
      // 先尝试获取用户设置
      uni.getSetting({
        success: (settingRes) => {
          if (settingRes.authSetting['scope.userInfo']) {
            // 已经授权，直接获取用户信息
            uni.getUserInfo({
              success: (userRes) => {
                const userInfo = userRes.userInfo;
                // 生成模拟 openid（实际应用中需要调用微信登录接口）
                userInfo.openid = 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8);
                resolve(userInfo);
              },
              fail: reject
            });
          } else {
            // 未授权，使用默认信息
            resolve({
              openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
              nickName: '用户' + Math.floor(Math.random() * 1000),
              avatarUrl: '/static/default-avatar.png'
            });
          }
        },
        fail: (error) => {
          // 获取设置失败，使用默认信息
          resolve({
            openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
            nickName: '用户' + Math.floor(Math.random() * 1000),
            avatarUrl: '/static/default-avatar.png'
          });
        }
      });
    });
  }
  
  /**
   * 获取用户信息
   */
  async getUserInfo(openid) {
    return await this.callCloudFunction('getUserInfo', { openid });
  }
  
  /**
   * 更新用户信息
   */
  async updateUser(openid, updates) {
    return await this.callCloudFunction('updateUser', { openid, updates });
  }
  
  // ================================
  // 群组相关API
  // ================================
  
  /**
   * 获取群组列表
   */
  async getGroups(category = null, limit = 20, offset = 0) {
    return await this.callCloudFunction('getGroups', { category, limit, offset });
  }
  
  /**
   * 获取群组详情
   */
  async getGroupDetail(groupId) {
    return await this.callCloudFunction('getGroupDetail', { groupId });
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
   * 离开群组
   */
  async leaveGroup(groupId) {
    if (!this.currentUser) {
      throw new Error('用户未登录');
    }
    
    return await this.callCloudFunction('leaveGroup', {
      groupId,
      userOpenid: this.currentUser.openid
    });
  }
  
  // ================================
  // 消息相关API
  // ================================
  
  /**
   * 获取群组消息
   */
  async getMessages(groupId, limit = 50, offset = 0, before = null) {
    return await this.callCloudFunction('getMessages', {
      groupId,
      limit,
      offset,
      before
    });
  }
  
  /**
   * 发送消息
   */
  async sendMessage(groupId, content, messageType = 'text', replyTo = null) {
    if (!this.currentUser) {
      throw new Error('用户未登录');
    }
    
    return await this.callCloudFunction('sendMessage', {
      groupId,
      userOpenid: this.currentUser.openid,
      content,
      messageType,
      replyTo
    });
  }
  
  /**
   * 删除消息
   */
  async deleteMessage(messageId) {
    if (!this.currentUser) {
      throw new Error('用户未登录');
    }
    
    return await this.callCloudFunction('deleteMessage', {
      messageId,
      userOpenid: this.currentUser.openid
    });
  }
  
  // ================================
  // 成员相关API
  // ================================
  
  /**
   * 获取群组成员
   */
  async getGroupMembers(groupId) {
    return await this.callCloudFunction('getGroupMembers', { groupId });
  }
  
  /**
   * 更新成员角色
   */
  async updateMemberRole(groupId, userOpenid, newRole) {
    if (!this.currentUser) {
      throw new Error('用户未登录');
    }
    
    return await this.callCloudFunction('updateMemberRole', {
      groupId,
      userOpenid,
      newRole,
      operatorOpenid: this.currentUser.openid
    });
  }
  
  // ================================
  // 工具方法
  // ================================
  
  /**
   * 测试连接
   */
  async testConnection() {
    return await this.callCloudFunction('ping');
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

// 创建全局实例
const learningGroupAPI = new LearningGroupAPI();

// 兼容性导出 - 支持 CommonJS 和 ES6 模块
module.exports = learningGroupAPI;
module.exports.default = learningGroupAPI;

// 如果支持 ES6 导出，也提供支持
if (typeof exports !== 'undefined') {
  exports.default = learningGroupAPI;
}
