/**
 * 内联 API 管理器
 * 直接在页面中定义，避免模块导入问题
 */

// 内联版本的 API 管理器
function createInlineLearningGroupAPI() {
  var api = {
    cloudFunctionName: 'learningGroupAPI',
    currentUser: null,
    
    // 调用云函数
    callCloudFunction: function(action, params) {
      params = params || {};
      
      return new Promise(function(resolve, reject) {
        console.log('[API] 调用云函数 ' + action + ':', params);
        
        uniCloud.callFunction({
          name: api.cloudFunctionName,
          data: Object.assign({ action: action }, params)
        }).then(function(result) {
          console.log('[API] ' + action + ' 云函数响应:', result);
          
          if (result.result && result.result.success) {
            resolve(result.result.data);
          } else {
            reject(new Error((result.result && result.result.error) || '调用失败'));
          }
        }).catch(function(error) {
          console.error('[API] ' + action + ' 云函数调用失败:', error);
          reject(error);
        });
      });
    },
    
    // 初始化当前用户
    initCurrentUser: function() {
      return api.getWechatUserInfo().then(function(userInfo) {
        return api.callCloudFunction('createUser', {
          openid: userInfo.openid,
          nickname: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }).then(function(user) {
          api.currentUser = user;
          console.log('[API] 当前用户初始化成功:', api.currentUser);
          return api.currentUser;
        });
      });
    },
    
    // 获取微信用户信息
    getWechatUserInfo: function() {
      return Promise.resolve({
        openid: 'user_wx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 8),
        nickName: '用户' + Math.floor(Math.random() * 1000),
        avatarUrl: '/static/default-avatar.png'
      });
    },
    
    // 获取群组列表
    getGroups: function(category, limit, offset) {
      return api.callCloudFunction('getGroups', {
        category: category || null,
        limit: limit || 20,
        offset: offset || 0
      });
    },
    
    // 创建群组
    createGroup: function(groupData) {
      if (!api.currentUser) {
        return Promise.reject(new Error('用户未登录'));
      }
      
      return api.callCloudFunction('createGroup', Object.assign({}, groupData, {
        creatorOpenid: api.currentUser.openid
      }));
    },
    
    // 加入群组
    joinGroup: function(groupId) {
      if (!api.currentUser) {
        return Promise.reject(new Error('用户未登录'));
      }
      
      return api.callCloudFunction('joinGroup', {
        groupId: groupId,
        userOpenid: api.currentUser.openid
      });
    },
    
    // 获取当前用户
    getCurrentUser: function() {
      return api.currentUser;
    },
    
    // 检查是否已登录
    isLoggedIn: function() {
      return api.currentUser !== null;
    }
  };
  
  return api;
}

// 导出创建函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createInlineLearningGroupAPI;
} else if (typeof exports !== 'undefined') {
  exports.createInlineLearningGroupAPI = createInlineLearningGroupAPI;
}

// 如果在浏览器环境，挂载到 window
if (typeof window !== 'undefined') {
  window.createInlineLearningGroupAPI = createInlineLearningGroupAPI;
}
