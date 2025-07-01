// api/enhanced-supabase.js
// 增强的 Supabase API 封装，包含缓存和错误处理

import { CheckinCache, UserCache } from '../utils/cache.js';
import { supabaseApi } from './supabase.js';

/**
 * 增强的打卡API
 */
export class EnhancedCheckinAPI {
  /**
   * 获取打卡记录（带缓存）
   */
  static async getCheckins(forceRefresh = false) {
    try {
      // 如果不强制刷新，先尝试从缓存获取
      if (!forceRefresh) {
        const cached = CheckinCache.getCheckins();
        if (cached) {
          return { success: true, data: cached, fromCache: true };
        }
      }
      
      // 从服务器获取
      const response = await supabaseApi.getCheckins();
      
      if (response.success) {
        // 数据处理和缓存
        const processedData = response.data.map(item => ({
          id: item.id,
          name: item.user_profile?.nickname || '用户',
          content: item.content,
          time: item.created_at,
          likes: item.likes || 0,
          user_id: item.user_id,
          formatted_time: this.formatTime(item.created_at)
        }));
        
        // 缓存数据
        CheckinCache.setCheckins(processedData);
        
        return { success: true, data: processedData, fromCache: false };
      }
      
      return response;
    } catch (error) {
      console.error('获取打卡记录失败:', error);
      
      // 出错时尝试返回缓存数据
      const cached = CheckinCache.getCheckins();
      if (cached) {
        return { 
          success: true, 
          data: cached, 
          fromCache: true, 
          warning: '网络异常，显示缓存数据' 
        };
      }
      
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 获取用户统计数据（带缓存）
   */
  static async getUserStats(userId, forceRefresh = false) {
    try {
      if (!userId) {
        return { success: false, error: '用户ID不能为空' };
      }
      
      const cacheKey = `user_stats_${userId}`;
      
      // 检查缓存
      if (!forceRefresh) {
        const cached = CheckinCache.getUserStats();
        if (cached && cached.userId === userId) {
          return { success: true, data: cached.stats, fromCache: true };
        }
      }
      
      // 从服务器获取
      const response = await supabaseApi.getUserCheckinStats(userId);
      
      if (response.success) {
        const statsData = {
          userId,
          stats: {
            total: response.data.total || 0,
            continuous: response.data.continuous || 0,
            thisWeek: response.data.thisWeek || 0,
            lastUpdated: new Date().toISOString()
          }
        };
        
        // 缓存数据
        CheckinCache.setUserStats(statsData);
        
        return { success: true, data: statsData.stats, fromCache: false };
      }
      
      return response;
    } catch (error) {
      console.error('获取用户统计失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 创建打卡记录
   */
  static async createCheckin(checkinData) {
    try {
      // 验证数据
      const validation = this.validateCheckinData(checkinData);
      if (!validation.valid) {
        return { success: false, error: validation.message };
      }
      
      // 调用API
      const response = await supabaseApi.createCheckin(checkinData);
      
      if (response.success) {
        // 清除相关缓存，强制下次刷新
        CheckinCache.clear();
        
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('创建打卡失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * 验证打卡数据
   */
  static validateCheckinData(data) {
    if (!data.content || !data.content.trim()) {
      return { valid: false, message: '打卡内容不能为空' };
    }
    
    if (data.content.length < 5) {
      return { valid: false, message: '打卡内容至少需要5个字符' };
    }
    
    if (data.content.length > 500) {
      return { valid: false, message: '打卡内容不能超过500个字符' };
    }
    
    return { valid: true };
  }
  
  /**
   * 格式化时间
   */
  static formatTime(timeStr) {
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
  }
}

/**
 * 增强的用户API
 */
export class EnhancedUserAPI {
  /**
   * 获取用户信息（带缓存）
   */
  static async getCurrentUser(forceRefresh = false) {
    try {
      // 检查缓存
      if (!forceRefresh) {
        const cached = UserCache.getProfile();
        if (cached) {
          return cached;
        }
      }
      
      // 从服务器获取
      const user = await supabaseApi.getCurrentUser();
      
      if (user) {
        // 缓存用户信息
        UserCache.setProfile(user);
      }
      
      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }
  
  /**
   * 更新用户信息
   */
  static async updateProfile(userData) {
    try {
      const response = await supabaseApi.updateProfile(userData);
      
      if (response.success) {
        // 清除缓存，下次获取最新数据
        UserCache.clear();
      }
      
      return response;
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return { success: false, error: error.message };
    }
  }
}

/**
 * 网络状态管理
 */
export class NetworkManager {
  static isOnline = true;
  static listeners = [];
  
  static init() {
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      this.isOnline = res.isConnected;
      this.notifyListeners(res);
    });
    
    // 获取初始网络状态
    uni.getNetworkType({
      success: (res) => {
        this.isOnline = res.networkType !== 'none';
      }
    });
  }
  
  static addListener(callback) {
    this.listeners.push(callback);
  }
  
  static removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }
  
  static notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('网络状态监听器错误:', error);
      }
    });
  }
}

// 初始化网络管理器
NetworkManager.init();
