// api/supabase.js
// 完整的 Supabase 后端 API 调用封装

import { callCloudFunction } from './cloudFunction.js';

/**
 * 用户相关 API
 */
export const userAPI = {
  // 获取用户信息
  async getProfile() {
    return await callCloudFunction('userData', {
      action: 'getUserProfile'
    });
  },

  // 更新用户信息
  async updateProfile(userData) {
    return await callCloudFunction('userData', {
      action: 'updateUserProfile',
      data: userData
    });
  },

  // 创建用户
  async createUser(userData) {
    return await callCloudFunction('userData', {
      action: 'createUser',
      data: userData
    });
  },

  // 获取用户偏好设置
  async getPreferences() {
    return await callCloudFunction('userData', {
      action: 'getUserPreferences'
    });
  },

  // 更新用户偏好设置
  async updatePreferences(preferences) {
    return await callCloudFunction('userData', {
      action: 'updateUserPreferences',
      data: preferences
    });
  },

  // 更新用户兴趣
  async updateInterests(interests) {
    return await callCloudFunction('userData', {
      action: 'updateUserInterests',
      data: { interests }
    });
  }
};

/**
 * 打卡相关 API
 */
export const checkinAPI = {
  // 获取打卡记录
  async getRecords(options = {}) {
    return await callCloudFunction('userData', {
      action: 'getCheckinRecords',
      data: options
    });
  },

  // 创建打卡记录
  async createRecord(content, options = {}) {
    return await callCloudFunction('userData', {
      action: 'createCheckinRecord',
      data: {
        content,
        ...options
      }
    });
  },

  // 获取公开的打卡记录
  async getPublicRecords(options = {}) {
    return await callCloudFunction('userData', {
      action: 'getPublicCheckins',
      data: options
    });
  },

  // 点赞打卡
  async likeRecord(checkinId) {
    return await callCloudFunction('userData', {
      action: 'likeCheckin',
      data: { checkin_id: checkinId }
    });
  },

  // 取消点赞
  async unlikeRecord(checkinId) {
    return await callCloudFunction('userData', {
      action: 'unlikeCheckin',
      data: { checkin_id: checkinId }
    });
  }
};

/**
 * 学习群组相关 API
 */
export const studyGroupAPI = {
  // 获取群组列表
  async getGroups(options = {}) {
    return await callCloudFunction('userData', {
      action: 'getStudyGroups',
      data: options
    });
  },

  // 创建群组
  async createGroup(groupData) {
    return await callCloudFunction('userData', {
      action: 'createStudyGroup',
      data: groupData
    });
  },

  // 加入群组
  async joinGroup(groupId) {
    return await callCloudFunction('userData', {
      action: 'joinStudyGroup',
      data: { group_id: groupId }
    });
  },

  // 离开群组
  async leaveGroup(groupId) {
    return await callCloudFunction('userData', {
      action: 'leaveStudyGroup',
      data: { group_id: groupId }
    });
  },

  // 获取群组成员
  async getGroupMembers(groupId) {
    return await callCloudFunction('userData', {
      action: 'getGroupMembers',
      data: { group_id: groupId }
    });
  }
};

/**
 * AI聊天相关 API
 */
export const chatAPI = {
  // 发送消息
  async sendMessage(message, chatType = 'general') {
    return await callCloudFunction('userData', {
      action: 'sendChatMessage',
      data: {
        message,
        chat_type: chatType
      }
    });
  },

  // 获取聊天历史
  async getHistory(options = {}) {
    return await callCloudFunction('userData', {
      action: 'getChatHistory',
      data: options
    });
  }
};

/**
 * 匹配相关 API
 */
export const matchAPI = {
  // 创建匹配请求
  async createRequest(requestData) {
    return await callCloudFunction('userData', {
      action: 'createMatchRequest',
      data: requestData
    });
  },

  // 获取匹配请求
  async getRequests() {
    return await callCloudFunction('userData', {
      action: 'getMatchRequests'
    });
  }
};

/**
 * 通用的后端数据操作工具
 */
export const supabaseHelper = {
  /**
   * 初始化用户数据
   * 在用户首次登录时调用
   */
  async initializeUser(userInfo) {
    try {
      // 先尝试获取用户信息
      const existingUser = await userAPI.getProfile();
      
      if (existingUser.success && existingUser.data) {
        console.log('用户已存在:', existingUser.data);
        return existingUser;
      }
      
      // 用户不存在，创建新用户
      console.log('创建新用户:', userInfo);
      return await userAPI.createUser({
        nickname: userInfo.nickName || '新用户',
        avatar_url: userInfo.avatarUrl
      });
      
    } catch (error) {
      console.error('初始化用户数据失败:', error);
      throw error;
    }
  },

  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
  },

  /**
   * 检查今日是否已打卡
   */
  async checkTodayCheckin() {
    try {
      const records = await checkinAPI.getRecords({ limit: 1 });
      
      if (records.success && records.data && records.data.length > 0) {
        const latestRecord = records.data[0];
        const today = this.formatDate();
        
        return latestRecord.checkin_date === today;
      }
      
      return false;
    } catch (error) {
      console.error('检查打卡状态失败:', error);
      return false;
    }
  },

  /**
   * 获取用户统计信息
   */
  async getUserStats() {
    try {
      const user = await userAPI.getProfile();
      if (!user.success || !user.data) {
        return null;
      }

      return {
        totalCheckinDays: user.data.total_checkin_days || 0,
        continuousCheckinDays: user.data.continuous_checkin_days || 0,
        lastCheckinDate: user.data.last_checkin_date
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return null;
    }
  },

  /**
   * 获取推荐的学习群组
   */
  async getRecommendedGroups(limit = 10) {
    try {
      const result = await studyGroupAPI.getGroups({
        limit,
        is_public: true
      });
      
      return result.success ? result.data : [];
    } catch (error) {
      console.error('获取推荐群组失败:', error);
      return [];
    }
  },

  /**
   * 获取学习分类列表
   */
  getStudyCategories() {
    return [
      { value: '编程开发', label: '编程开发', icon: '💻' },
      { value: '语言学习', label: '语言学习', icon: '🌐' },
      { value: '考研考证', label: '考研考证', icon: '📚' },
      { value: '设计创意', label: '设计创意', icon: '🎨' },
      { value: '数据分析', label: '数据分析', icon: '📊' },
      { value: '产品运营', label: '产品运营', icon: '📈' },
      { value: '职业技能', label: '职业技能', icon: '💼' },
      { value: '兴趣爱好', label: '兴趣爱好', icon: '🎯' }
    ];
  },

  /**
   * 获取心情选项
   */
  getMoodOptions() {
    return [
      { value: 'happy', label: '开心', icon: '😊', color: '#FFD93D' },
      { value: 'motivated', label: '有动力', icon: '💪', color: '#6BCF7F' },
      { value: 'neutral', label: '平静', icon: '😐', color: '#B0BEC5' },
      { value: 'tired', label: '疲惫', icon: '😴', color: '#FFB74D' },
      { value: 'accomplished', label: '成就感', icon: '🏆', color: '#81C784' }
    ];
  },

  /**
   * 获取学习水平选项
   */
  getLevelOptions() {
    return [
      { value: 'beginner', label: '初学者', description: '刚开始接触' },
      { value: 'intermediate', label: '进阶者', description: '有一定基础' },
      { value: 'advanced', label: '高级者', description: '已经很熟练' }
    ];
  },

  /**
   * 验证打卡内容
   */
  validateCheckinContent(content) {
    if (!content || !content.trim()) {
      return { valid: false, message: '请输入打卡内容' };
    }
    
    if (content.length < 10) {
      return { valid: false, message: '打卡内容至少需要10个字符' };
    }
    
    if (content.length > 500) {
      return { valid: false, message: '打卡内容不能超过500个字符' };
    }
    
    return { valid: true };
  },

  /**
   * 验证群组信息
   */
  validateGroupData(groupData) {
    const errors = [];
    
    if (!groupData.name || !groupData.name.trim()) {
      errors.push('群组名称不能为空');
    } else if (groupData.name.length > 50) {
      errors.push('群组名称不能超过50个字符');
    }
    
    if (groupData.description && groupData.description.length > 300) {
      errors.push('群组描述不能超过300个字符');
    }
    
    if (groupData.max_members && (groupData.max_members < 2 || groupData.max_members > 50)) {
      errors.push('群组成员数量应在2-50之间');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};
