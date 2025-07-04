/**
 * 学习小组 API 管理器 - 兼容版本
 * 使用传统函数语法，避免类语法兼容性问题
 */

function LearningGroupAPI() {
  this.cloudFunctionName = 'learningGroupAPI';
  this.currentUser = null;
  console.log('[LearningGroupAPI] 初始化完成');
}

/**
 * 调用云函数
 */
LearningGroupAPI.prototype.callCloudFunction = async function(action, params) {
  params = params || {};
  
  try {
    console.log(`[API] 调用云函数 ${action}:`, params);
    
    const result = await uniCloud.callFunction({
      name: this.cloudFunctionName,
      data: {
        action: action,
        ...params
      }
    });
    
    console.log(`[API] ${action} 云函数响应:`, result);
    
    if (result.result && result.result.success) {
      return result.result.data;
    } else {
      throw new Error((result.result && result.result.error) || '调用失败');
    }
  } catch (error) {
    console.error(`[API] ${action} 云函数调用失败:`, error);
    throw error;
  }
};

/**
 * 初始化当前用户
 */
LearningGroupAPI.prototype.initCurrentUser = async function() {
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
};

/**
 * 获取微信用户信息
 */
LearningGroupAPI.prototype.getWechatUserInfo = function() {
  const self = this;
  return new Promise(function(resolve) {
    // 简化版本，直接使用默认信息
    resolve({
      openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
      nickName: '用户' + Math.floor(Math.random() * 1000),
      avatarUrl: '/static/default-avatar.png'
    });
  });
};

/**
 * 获取群组列表
 */
LearningGroupAPI.prototype.getGroups = async function(category, limit, offset) {
  category = category || null;
  limit = limit || 20;
  offset = offset || 0;
  
  return await this.callCloudFunction('getGroups', { 
    category: category, 
    limit: limit, 
    offset: offset 
  });
};

/**
 * 创建群组
 */
LearningGroupAPI.prototype.createGroup = async function(groupData) {
  if (!this.currentUser) {
    throw new Error('用户未登录');
  }
  
  return await this.callCloudFunction('createGroup', {
    ...groupData,
    creatorOpenid: this.currentUser.openid
  });
};

/**
 * 加入群组
 */
LearningGroupAPI.prototype.joinGroup = async function(groupId) {
  if (!this.currentUser) {
    throw new Error('用户未登录');
  }
  
  return await this.callCloudFunction('joinGroup', {
    groupId: groupId,
    userOpenid: this.currentUser.openid
  });
};

/**
 * 获取当前用户
 */
LearningGroupAPI.prototype.getCurrentUser = function() {
  return this.currentUser;
};

/**
 * 检查是否已登录
 */
LearningGroupAPI.prototype.isLoggedIn = function() {
  return this.currentUser !== null;
};

// 创建实例
const learningGroupAPICompat = new LearningGroupAPI();

// 导出
module.exports = learningGroupAPICompat;
