// api/supabase-v2.js
// 优化的 Supabase API 调用封装 - 统一业务接口

/**
 * 统一的云函数调用封装
 */
async function callSupabaseProxy(action, data = {}) {
  try {
    const result = await new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'supabaseProxy',
        data: { action, data },
        success: resolve,
        fail: reject
      });
    });

    if (result.result) {
      return result.result;
    } else {
      throw new Error('云函数返回数据格式错误');
    }
  } catch (error) {
    console.error(`调用云函数失败 [${action}]:`, error);
    return {
      success: false,
      error: error.message || '网络请求失败',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 用户相关 API
 */
export const userAPI = {
  /**
   * 创建用户 - 首次登录时调用
   */
  async createUser(userInfo) {
    return await callSupabaseProxy('createUser', {
      nickname: userInfo.nickName || userInfo.nickname || '新用户',
      avatar_url: userInfo.avatarUrl || userInfo.avatar_url
    });
  },

  /**
   * 获取用户资料
   */
  async getProfile() {
    return await callSupabaseProxy('getUserProfile');
  },

  /**
   * 更新用户资料
   */
  async updateProfile(userData) {
    return await callSupabaseProxy('updateUserProfile', userData);
  },

  /**
   * 用户登录初始化 - 统一入口
   */
  async initializeUser(userInfo) {
    try {
      // 先尝试获取用户信息
      const profileResult = await this.getProfile();
      
      if (profileResult.success && profileResult.data && profileResult.data.length > 0) {
        console.log('用户已存在:', profileResult.data[0]);
        return { success: true, data: profileResult.data[0], isNewUser: false };
      }
      
      // 用户不存在，创建新用户
      console.log('创建新用户:', userInfo);
      const createResult = await this.createUser(userInfo);
      
      if (createResult.success) {
        return { 
          success: true, 
          data: createResult.data[0] || createResult.data, 
          isNewUser: true 
        };
      }
      
      return createResult;
    } catch (error) {
      console.error('用户初始化失败:', error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * 打卡相关 API
 */
export const checkinAPI = {
  /**
   * 创建打卡记录
   */
  async createRecord(checkinData) {
    // 标准化数据格式
    const standardData = {
      title: checkinData.title || '',
      content: checkinData.content || checkinData.text || '',
      study_minutes: parseInt(checkinData.study_minutes || checkinData.studyTime || 0),
      checkin_type: checkinData.checkin_type || checkinData.type || 'daily',
      mood: checkinData.mood,
      category: checkinData.category,
      tags: Array.isArray(checkinData.tags) ? checkinData.tags : [],
      visibility: checkinData.visibility || 'public'
    };

    return await callSupabaseProxy('createCheckin', standardData);
  },

  /**
   * 获取打卡记录列表
   */
  async getRecords(options = {}) {
    return await callSupabaseProxy('getCheckinRecords', {
      limit: options.limit || 20,
      offset: options.offset || 0,
      visibility: options.visibility || 'public'
    });
  },

  /**
   * 点赞/取消点赞打卡
   */
  async toggleLike(checkinId) {
    return await callSupabaseProxy('likeCheckin', { checkin_id: checkinId });
  },

  /**
   * 检查今日是否已打卡
   */
  async checkTodayStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await this.getRecords({ limit: 1, offset: 0 });
      
      if (result.success && result.data && result.data.length > 0) {
        const latestCheckin = result.data[0];
        const checkinDate = latestCheckin.checkin_date;
        return { success: true, hasCheckedIn: checkinDate === today };
      }
      
      return { success: true, hasCheckedIn: false };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/**
 * 学习群组相关 API
 */
export const studyGroupAPI = {
  /**
   * 创建学习群组
   */
  async createGroup(groupData) {
    return await callSupabaseProxy('createStudyGroup', {
      name: groupData.name,
      description: groupData.description || '',
      category: groupData.category,
      tags: Array.isArray(groupData.tags) ? groupData.tags : [],
      max_members: parseInt(groupData.max_members || 20),
      is_public: groupData.is_public !== false,
      require_approval: groupData.require_approval || false,
      study_goal: groupData.study_goal || '',
      target_duration_days: parseInt(groupData.target_duration_days || 30),
      difficulty_level: groupData.difficulty_level || 'beginner'
    });
  },

  /**
   * 获取群组列表
   */
  async getGroups(options = {}) {
    return await callSupabaseProxy('getStudyGroups', {
      limit: options.limit || 20,
      offset: options.offset || 0,
      category: options.category,
      is_public: options.is_public
    });
  },

  /**
   * 加入群组
   */
  async joinGroup(groupId, joinMessage = '') {
    return await callSupabaseProxy('joinStudyGroup', {
      group_id: groupId,
      join_message: joinMessage
    });
  },

  /**
   * 根据邀请码加入群组
   */
  async joinByInviteCode(inviteCode, joinMessage = '') {
    try {
      // 先通过邀请码获取群组信息
      const groupsResult = await this.getGroups({ limit: 1 });
      
      if (!groupsResult.success) {
        return groupsResult;
      }

      const group = groupsResult.data?.find(g => g.invite_code === inviteCode.toUpperCase());
      
      if (!group) {
        return { success: false, error: '邀请码无效' };
      }

      return await this.joinGroup(group.id, joinMessage);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

/**
 * AI 聊天相关 API (预留接口)
 */
export const aiChatAPI = {
  /**
   * 发送消息给 AI (暂时返回模拟数据)
   */
  async sendMessage(message, sessionType = 'general') {
    // TODO: 实现真实的 AI 接口调用
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          '我理解你的学习困难，让我们一起制定一个学习计划吧！',
          '坚持学习很棒！记住，每一次的进步都值得庆祝。',
          '学习遇到困难很正常，可以尝试分解任务，逐步完成。',
          '建议你加入相关的学习群组，和伙伴们一起学习效果更好。'
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        resolve({
          success: true,
          data: {
            message: randomResponse,
            timestamp: new Date().toISOString(),
            session_type: sessionType
          }
        });
      }, 1000 + Math.random() * 2000); // 模拟 1-3 秒响应时间
    });
  }
};

/**
 * 通用工具函数
 */
export const supabaseUtils = {
  /**
   * 健康检查 - 测试连接状态
   */
  async healthCheck() {
    return await callSupabaseProxy('healthCheck');
  },

  /**
   * 格式化日期
   */
  formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
  },

  /**
   * 格式化相对时间
   */
  formatRelativeTime(timeStr) {
    const date = new Date(timeStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else if (diff < 2592000000) { // 30天内
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  },

  /**
   * 数据验证工具
   */
  validators: {
    checkinContent(content) {
      if (!content || !content.trim()) {
        return { valid: false, message: '打卡内容不能为空' };
      }
      if (content.length < 5) {
        return { valid: false, message: '打卡内容至少需要5个字符' };
      }
      if (content.length > 500) {
        return { valid: false, message: '打卡内容不能超过500个字符' };
      }
      return { valid: true };
    },

    groupName(name) {
      if (!name || !name.trim()) {
        return { valid: false, message: '群组名称不能为空' };
      }
      if (name.length < 2) {
        return { valid: false, message: '群组名称至少需要2个字符' };
      }
      if (name.length > 50) {
        return { valid: false, message: '群组名称不能超过50个字符' };
      }
      return { valid: true };
    }
  }
};

/**
 * 数据缓存管理 (简化版)
 */
export const cacheManager = {
  // 简单的内存缓存
  _cache: new Map(),
  _ttl: new Map(),

  set(key, value, ttlSeconds = 300) {
    this._cache.set(key, value);
    this._ttl.set(key, Date.now() + ttlSeconds * 1000);
  },

  get(key) {
    const expireTime = this._ttl.get(key);
    if (!expireTime || Date.now() > expireTime) {
      this._cache.delete(key);
      this._ttl.delete(key);
      return null;
    }
    return this._cache.get(key);
  },

  clear() {
    this._cache.clear();
    this._ttl.clear();
  }
};

// 默认导出所有 API
export default {
  userAPI,
  checkinAPI,
  studyGroupAPI,
  aiChatAPI,
  supabaseUtils,
  cacheManager
};
