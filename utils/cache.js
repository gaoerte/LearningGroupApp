// utils/cache.js
// 数据缓存管理工具

const CACHE_KEYS = {
  CHECKINS: 'checkins_cache',
  USER_STATS: 'user_stats_cache',
  USER_PROFILE: 'user_profile_cache'
};

const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000,  // 5分钟
  MEDIUM: 30 * 60 * 1000, // 30分钟
  LONG: 24 * 60 * 60 * 1000 // 24小时
};

class CacheManager {
  /**
   * 设置缓存
   * @param {string} key 缓存键
   * @param {any} data 缓存数据
   * @param {number} duration 缓存时长（毫秒）
   */
  static set(key, data, duration = CACHE_DURATION.MEDIUM) {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    };
    
    try {
      uni.setStorageSync(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('缓存设置失败:', error);
    }
  }
  
  /**
   * 获取缓存
   * @param {string} key 缓存键
   * @returns {any|null} 缓存数据或null
   */
  static get(key) {
    try {
      const cached = uni.getStorageSync(key);
      if (!cached) return null;
      
      const cacheItem = JSON.parse(cached);
      
      // 检查是否过期
      if (Date.now() > cacheItem.expiry) {
        this.remove(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.warn('缓存获取失败:', error);
      return null;
    }
  }
  
  /**
   * 删除缓存
   * @param {string} key 缓存键
   */
  static remove(key) {
    try {
      uni.removeStorageSync(key);
    } catch (error) {
      console.warn('缓存删除失败:', error);
    }
  }
  
  /**
   * 清除所有缓存
   */
  static clear() {
    Object.values(CACHE_KEYS).forEach(key => {
      this.remove(key);
    });
  }
  
  /**
   * 检查缓存是否有效
   * @param {string} key 缓存键
   * @returns {boolean} 是否有效
   */
  static isValid(key) {
    try {
      const cached = uni.getStorageSync(key);
      if (!cached) return false;
      
      const cacheItem = JSON.parse(cached);
      return Date.now() <= cacheItem.expiry;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 获取缓存信息
   * @param {string} key 缓存键
   * @returns {object|null} 缓存信息
   */
  static getInfo(key) {
    try {
      const cached = uni.getStorageSync(key);
      if (!cached) return null;
      
      const cacheItem = JSON.parse(cached);
      const now = Date.now();
      
      return {
        size: JSON.stringify(cacheItem.data).length,
        age: now - cacheItem.timestamp,
        ttl: cacheItem.expiry - now,
        expired: now > cacheItem.expiry
      };
    } catch (error) {
      return null;
    }
  }
}

// 打卡数据缓存管理器
export class CheckinCache {
  static setCheckins(checkins) {
    CacheManager.set(CACHE_KEYS.CHECKINS, checkins, CACHE_DURATION.SHORT);
  }
  
  static getCheckins() {
    return CacheManager.get(CACHE_KEYS.CHECKINS);
  }
  
  static setUserStats(stats) {
    CacheManager.set(CACHE_KEYS.USER_STATS, stats, CACHE_DURATION.MEDIUM);
  }
  
  static getUserStats() {
    return CacheManager.get(CACHE_KEYS.USER_STATS);
  }
  
  static clear() {
    CacheManager.remove(CACHE_KEYS.CHECKINS);
    CacheManager.remove(CACHE_KEYS.USER_STATS);
  }
}

// 用户数据缓存管理器
export class UserCache {
  static setProfile(profile) {
    CacheManager.set(CACHE_KEYS.USER_PROFILE, profile, CACHE_DURATION.LONG);
  }
  
  static getProfile() {
    return CacheManager.get(CACHE_KEYS.USER_PROFILE);
  }
  
  static clear() {
    CacheManager.remove(CACHE_KEYS.USER_PROFILE);
  }
}

export { CacheManager, CACHE_KEYS, CACHE_DURATION };
