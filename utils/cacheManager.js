// utils/cacheManager.js
// 数据缓存管理器

/**
 * 缓存管理器
 */
class CacheManager {
  constructor() {
    this.cache = new Map()
    this.cacheConfig = {
      // 默认过期时间（毫秒）
      defaultTTL: 5 * 60 * 1000, // 5分钟
      // 最大缓存条目数
      maxSize: 100,
      // 缓存清理间隔
      cleanupInterval: 60 * 1000, // 1分钟
      // 是否启用持久化
      enablePersistence: true,
      // 持久化存储的key前缀
      storagePrefix: 'cache_'
    }
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      expires: 0
    }
    
    this.init()
  }
  
  /**
   * 初始化缓存管理器
   */
  init() {
    // 从本地存储恢复缓存
    this.loadFromStorage()
    
    // 启动清理定时器
    this.startCleanupTimer()
    
    // 监听应用状态变化
    this.setupAppStateListeners()
  }
  
  /**
   * 设置缓存
   */
  set(key, value, options = {}) {
    const now = Date.now()
    const ttl = options.ttl || this.cacheConfig.defaultTTL
    const persistent = options.persistent !== false
    
    const cacheItem = {
      key,
      value,
      createdAt: now,
      expiresAt: ttl > 0 ? now + ttl : null,
      accessCount: 0,
      lastAccessed: now,
      persistent,
      tags: options.tags || [],
      metadata: options.metadata || {}
    }
    
    // 检查缓存大小限制
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.evictLeastUsed()
    }
    
    this.cache.set(key, cacheItem)
    this.stats.sets++
    
    // 持久化到本地存储
    if (persistent && this.cacheConfig.enablePersistence) {
      this.saveToStorage(key, cacheItem)
    }
    
    return true
  }
  
  /**
   * 获取缓存
   */
  get(key, defaultValue = null) {
    const cacheItem = this.cache.get(key)
    
    if (!cacheItem) {
      this.stats.misses++
      return defaultValue
    }
    
    // 检查是否过期
    if (this.isExpired(cacheItem)) {
      this.delete(key)
      this.stats.misses++
      this.stats.expires++
      return defaultValue
    }
    
    // 更新访问信息
    cacheItem.accessCount++
    cacheItem.lastAccessed = Date.now()
    
    this.stats.hits++
    return cacheItem.value
  }
  
  /**
   * 检查缓存是否存在且未过期
   */
  has(key) {
    const cacheItem = this.cache.get(key)
    
    if (!cacheItem) {
      return false
    }
    
    if (this.isExpired(cacheItem)) {
      this.delete(key)
      this.stats.expires++
      return false
    }
    
    return true
  }
  
  /**
   * 删除缓存
   */
  delete(key) {
    const existed = this.cache.delete(key)
    
    if (existed) {
      this.stats.deletes++
      
      // 从本地存储删除
      if (this.cacheConfig.enablePersistence) {
        this.removeFromStorage(key)
      }
    }
    
    return existed
  }
  
  /**
   * 清空所有缓存
   */
  clear() {
    const size = this.cache.size
    this.cache.clear()
    
    // 清空本地存储
    if (this.cacheConfig.enablePersistence) {
      this.clearStorage()
    }
    
    return size
  }
  
  /**
   * 根据标签删除缓存
   */
  deleteByTags(tags) {
    let count = 0
    const tagsArray = Array.isArray(tags) ? tags : [tags]
    
    for (const [key, item] of this.cache) {
      if (item.tags.some(tag => tagsArray.includes(tag))) {
        this.delete(key)
        count++
      }
    }
    
    return count
  }
  
  /**
   * 根据模式删除缓存
   */
  deleteByPattern(pattern) {
    let count = 0
    const regex = new RegExp(pattern)
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key)
        count++
      }
    }
    
    return count
  }
  
  /**
   * 检查缓存项是否过期
   */
  isExpired(cacheItem) {
    if (!cacheItem.expiresAt) {
      return false
    }
    
    return Date.now() > cacheItem.expiresAt
  }
  
  /**
   * 清理过期缓存
   */
  cleanup() {
    let expiredCount = 0
    const now = Date.now()
    
    for (const [key, item] of this.cache) {
      if (this.isExpired(item)) {
        this.delete(key)
        expiredCount++
      }
    }
    
    return expiredCount
  }
  
  /**
   * 淘汰最少使用的缓存项
   */
  evictLeastUsed() {
    let leastUsedKey = null
    let leastUsedItem = null
    
    for (const [key, item] of this.cache) {
      if (!leastUsedItem || 
          item.accessCount < leastUsedItem.accessCount || 
          (item.accessCount === leastUsedItem.accessCount && item.lastAccessed < leastUsedItem.lastAccessed)) {
        leastUsedKey = key
        leastUsedItem = item
      }
    }
    
    if (leastUsedKey) {
      this.delete(leastUsedKey)
    }
  }
  
  /**
   * 获取缓存信息
   */
  getInfo(key) {
    const cacheItem = this.cache.get(key)
    
    if (!cacheItem) {
      return null
    }
    
    return {
      key: cacheItem.key,
      size: this.getItemSize(cacheItem.value),
      createdAt: cacheItem.createdAt,
      expiresAt: cacheItem.expiresAt,
      accessCount: cacheItem.accessCount,
      lastAccessed: cacheItem.lastAccessed,
      isExpired: this.isExpired(cacheItem),
      tags: cacheItem.tags,
      metadata: cacheItem.metadata
    }
  }
  
  /**
   * 获取所有缓存键
   */
  keys() {
    return Array.from(this.cache.keys())
  }
  
  /**
   * 获取缓存值列表
   */
  values() {
    const values = []
    
    for (const item of this.cache.values()) {
      if (!this.isExpired(item)) {
        values.push(item.value)
      }
    }
    
    return values
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats() {
    const totalSize = this.cache.size
    let expiredCount = 0
    let totalMemorySize = 0
    
    for (const item of this.cache.values()) {
      if (this.isExpired(item)) {
        expiredCount++
      }
      totalMemorySize += this.getItemSize(item)
    }
    
    return {
      ...this.stats,
      totalSize,
      activeSize: totalSize - expiredCount,
      expiredCount,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%',
      memorySize: totalMemorySize,
      config: this.cacheConfig
    }
  }
  
  /**
   * 获取项目内存大小估算
   */
  getItemSize(item) {
    try {
      return JSON.stringify(item).length * 2 // 粗略估算（UTF-16）
    } catch (error) {
      return 0
    }
  }
  
  /**
   * 启动清理定时器
   */
  startCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }
    
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.cacheConfig.cleanupInterval)
  }
  
  /**
   * 停止清理定时器
   */
  stopCleanupTimer() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
  
  /**
   * 从本地存储加载缓存
   */
  loadFromStorage() {
    if (!this.cacheConfig.enablePersistence) return
    
    try {
      const storageInfo = uni.getStorageInfoSync()
      const cacheKeys = storageInfo.keys.filter(key => 
        key.startsWith(this.cacheConfig.storagePrefix)
      )
      
      for (const storageKey of cacheKeys) {
        try {
          const cacheData = uni.getStorageSync(storageKey)
          const cacheKey = storageKey.replace(this.cacheConfig.storagePrefix, '')
          
          if (cacheData && !this.isExpired(cacheData)) {
            this.cache.set(cacheKey, cacheData)
          } else {
            // 清理过期的存储数据
            uni.removeStorageSync(storageKey)
          }
        } catch (error) {
          console.warn('加载缓存项失败:', storageKey, error)
          uni.removeStorageSync(storageKey)
        }
      }
    } catch (error) {
      console.warn('从本地存储加载缓存失败:', error)
    }
  }
  
  /**
   * 保存到本地存储
   */
  saveToStorage(key, cacheItem) {
    if (!this.cacheConfig.enablePersistence || !cacheItem.persistent) return
    
    try {
      const storageKey = this.cacheConfig.storagePrefix + key
      uni.setStorageSync(storageKey, cacheItem)
    } catch (error) {
      console.warn('保存缓存到本地存储失败:', key, error)
    }
  }
  
  /**
   * 从本地存储删除
   */
  removeFromStorage(key) {
    if (!this.cacheConfig.enablePersistence) return
    
    try {
      const storageKey = this.cacheConfig.storagePrefix + key
      uni.removeStorageSync(storageKey)
    } catch (error) {
      console.warn('从本地存储删除缓存失败:', key, error)
    }
  }
  
  /**
   * 清空本地存储中的缓存
   */
  clearStorage() {
    if (!this.cacheConfig.enablePersistence) return
    
    try {
      const storageInfo = uni.getStorageInfoSync()
      const cacheKeys = storageInfo.keys.filter(key => 
        key.startsWith(this.cacheConfig.storagePrefix)
      )
      
      for (const storageKey of cacheKeys) {
        uni.removeStorageSync(storageKey)
      }
    } catch (error) {
      console.warn('清空本地存储缓存失败:', error)
    }
  }
  
  /**
   * 监听应用状态变化
   */
  setupAppStateListeners() {
    // 应用进入后台时保存缓存
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener('pause', () => {
      this.syncToStorage()
    })
    // #endif
    
    // 页面隐藏时保存缓存
    // #ifdef H5
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.syncToStorage()
      }
    })
    // #endif
  }
  
  /**
   * 同步内存缓存到本地存储
   */
  syncToStorage() {
    if (!this.cacheConfig.enablePersistence) return
    
    for (const [key, item] of this.cache) {
      if (item.persistent && !this.isExpired(item)) {
        this.saveToStorage(key, item)
      }
    }
  }
  
  /**
   * 配置缓存管理器
   */
  configure(options) {
    this.cacheConfig = {
      ...this.cacheConfig,
      ...options
    }
    
    // 重新启动清理定时器
    this.startCleanupTimer()
  }
  
  /**
   * 销毁缓存管理器
   */
  destroy() {
    this.stopCleanupTimer()
    this.syncToStorage()
    this.clear()
  }
}

// 创建全局缓存实例
const globalCache = new CacheManager()

/**
 * 便捷的缓存操作方法
 */
export const cache = {
  // 设置缓存
  set: (key, value, options) => globalCache.set(key, value, options),
  
  // 获取缓存
  get: (key, defaultValue) => globalCache.get(key, defaultValue),
  
  // 检查缓存是否存在
  has: (key) => globalCache.has(key),
  
  // 删除缓存
  delete: (key) => globalCache.delete(key),
  
  // 清空缓存
  clear: () => globalCache.clear(),
  
  // 根据标签删除
  deleteByTags: (tags) => globalCache.deleteByTags(tags),
  
  // 根据模式删除
  deleteByPattern: (pattern) => globalCache.deleteByPattern(pattern),
  
  // 获取统计信息
  getStats: () => globalCache.getStats(),
  
  // 清理过期缓存
  cleanup: () => globalCache.cleanup()
}

/**
 * 装饰器：自动缓存函数结果
 */
export function cached(options = {}) {
  const {
    ttl = 5 * 60 * 1000, // 5分钟
    keyGenerator = null,
    tags = [],
    persistent = true
  } = options
  
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args) {
      // 生成缓存键
      const cacheKey = keyGenerator 
        ? keyGenerator.apply(this, args)
        : `${target.constructor.name}_${propertyKey}_${JSON.stringify(args)}`
      
      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey)
      if (cachedResult !== null) {
        return cachedResult
      }
      
      // 执行原方法
      const result = await originalMethod.apply(this, args)
      
      // 缓存结果
      cache.set(cacheKey, result, { ttl, tags, persistent })
      
      return result
    }
    
    return descriptor
  }
}

// 导出缓存管理器和便捷方法
export { globalCache as cacheManager }
export default {
  manager: globalCache,
  cache,
  cached,
  
  // 创建新的缓存实例
  create: (config = {}) => {
    const instance = new CacheManager()
    if (Object.keys(config).length > 0) {
      instance.configure(config)
    }
    return instance
  }
}
