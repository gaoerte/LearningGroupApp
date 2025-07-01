// store/modules/user.js
// 用户模块状态管理

export default {
  namespaced: true,
  
  state: {
    // 当前用户信息
    currentUser: null,
    // 用户偏好设置
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'zh-CN'
    },
    // 登录状态
    isLoggedIn: false,
    // 用户统计
    userStats: {
      totalCheckins: 0,
      joinedGroups: 0,
      achievements: []
    }
  },
  
  mutations: {
    SET_CURRENT_USER(state, user) {
      state.currentUser = user;
      state.isLoggedIn = !!user;
    },
    
    SET_PREFERENCES(state, preferences) {
      state.preferences = { ...state.preferences, ...preferences };
    },
    
    SET_USER_STATS(state, stats) {
      state.userStats = { ...state.userStats, ...stats };
    },
    
    LOGOUT(state) {
      state.currentUser = null;
      state.isLoggedIn = false;
      state.userStats = {
        totalCheckins: 0,
        joinedGroups: 0,
        achievements: []
      };
    }
  },
  
  actions: {
    // 获取当前用户
    async getCurrentUser({ commit }, { supabaseApi }) {
      try {
        const user = await supabaseApi.getCurrentUser();
        commit('SET_CURRENT_USER', user);
        return user;
      } catch (error) {
        console.error('获取用户信息失败:', error);
        commit('SET_CURRENT_USER', null);
        return null;
      }
    },
    
    // 更新用户信息
    async updateUserProfile({ commit }, { supabaseApi, userData }) {
      try {
        const response = await supabaseApi.updateProfile(userData);
        if (response.success) {
          commit('SET_CURRENT_USER', { ...this.state.user.currentUser, ...userData });
          return { success: true };
        }
        return { success: false, error: response.error };
      } catch (error) {
        console.error('更新用户信息失败:', error);
        return { success: false, error: error.message };
      }
    },
    
    // 更新用户偏好
    async updatePreferences({ commit }, preferences) {
      try {
        // 可以调用API保存到服务器
        commit('SET_PREFERENCES', preferences);
        
        // 保存到本地存储
        uni.setStorageSync('userPreferences', preferences);
        
        return { success: true };
      } catch (error) {
        console.error('更新偏好设置失败:', error);
        return { success: false, error: error.message };
      }
    },
    
    // 登出
    async logout({ commit }) {
      try {
        // 清除本地存储
        uni.removeStorageSync('supabase_token');
        uni.removeStorageSync('user_id');
        uni.removeStorageSync('openid');
        uni.removeStorageSync('userPreferences');
        
        commit('LOGOUT');
        
        return { success: true };
      } catch (error) {
        console.error('登出失败:', error);
        return { success: false, error: error.message };
      }
    }
  },
  
  getters: {
    // 获取用户头像
    userAvatar: (state) => {
      return state.currentUser?.avatar_url || '/static/default-avatar.png';
    },
    
    // 获取用户昵称
    userNickname: (state) => {
      return state.currentUser?.nickname || '学习者';
    },
    
    // 获取用户等级
    userLevel: (state) => {
      const checkins = state.userStats.totalCheckins;
      if (checkins < 7) return { level: 1, name: '初学者', color: '#10b981' };
      if (checkins < 30) return { level: 2, name: '进步者', color: '#3b82f6' };
      if (checkins < 100) return { level: 3, name: '坚持者', color: '#8b5cf6' };
      return { level: 4, name: '学习达人', color: '#f59e0b' };
    }
  }
};
