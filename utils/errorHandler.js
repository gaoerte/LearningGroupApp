// utils/errorHandler.js
// 全局错误处理和用户体验优化

import { notify } from './notification.js'
import { cache } from './cacheManager.js'
import { ENV_UTILS } from '../config/env.js'

/**
 * 错误处理管理器
 */
class ErrorHandler {
  constructor() {
    this.errors = []
    this.maxErrors = 100
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffFactor: 2
    }
    
    this.init()
  }
  
  /**
   * 初始化错误处理器
   */
  init() {
    this.setupGlobalErrorHandlers()
    this.setupNetworkErrorHandlers()
  }
  
  /**
   * 设置全局错误处理器
   */
  setupGlobalErrorHandlers() {
    // Vue 错误处理
    if (typeof Vue !== 'undefined') {
      Vue.config.errorHandler = (err, vm, info) => {
        this.handleVueError(err, vm, info)
      }
    }
    
    // Promise 未捕获错误
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.handleUnhandledRejection(event)
      })
      
      // JavaScript 运行时错误
      window.addEventListener('error', (event) => {
        this.handleJavaScriptError(event)
      })
    }
    
    // 小程序错误处理
    // #ifdef MP-WEIXIN
    wx.onError((error) => {
      this.handleWeChatError(error)
    })
    
    wx.onUnhandledRejection((event) => {
      this.handleUnhandledRejection(event)
    })
    // #endif
    
    // App 错误处理
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener('error', (event) => {
      this.handleAppError(event)
    })
    // #endif
  }
  
  /**
   * 设置网络错误处理器
   */
  setupNetworkErrorHandlers() {
    // 拦截 uni.request
    const originalRequest = uni.request
    
    uni.request = (options) => {
      return this.wrapNetworkRequest(originalRequest, options)
    }
  }
  
  /**
   * 包装网络请求
   */
  wrapNetworkRequest(originalRequest, options) {
    const requestId = this.generateRequestId()
    
    return new Promise((resolve, reject) => {
      const enhancedOptions = {
        ...options,
        success: (res) => {
          this.handleNetworkSuccess(requestId, options, res)
          if (options.success) options.success(res)
          resolve(res)
        },
        fail: (err) => {
          this.handleNetworkError(requestId, options, err)
          if (options.fail) options.fail(err)
          reject(err)
        },
        complete: (res) => {
          if (options.complete) options.complete(res)
        }
      }
      
      originalRequest.call(uni, enhancedOptions)
    })
  }
  
  /**
   * 处理 Vue 错误
   */
  handleVueError(err, vm, info) {
    const error = {
      type: 'vue-error',
      message: err.message,
      stack: err.stack,
      component: vm?.$options.name || 'Unknown',
      info,
      timestamp: new Date().toISOString(),
      url: window?.location?.href || 'Unknown'
    }
    
    this.logError(error)
    this.showUserFriendlyError('页面渲染错误', '页面遇到了一些问题，请稍后重试')
  }
  
  /**
   * 处理未捕获的 Promise 错误
   */
  handleUnhandledRejection(event) {
    const error = {
      type: 'unhandled-rejection',
      message: event.reason?.message || String(event.reason),
      stack: event.reason?.stack || '',
      timestamp: new Date().toISOString(),
      url: window?.location?.href || 'Unknown'
    }
    
    this.logError(error)
    
    // 阻止默认的错误处理
    event.preventDefault?.()
  }
  
  /**
   * 处理 JavaScript 运行时错误
   */
  handleJavaScriptError(event) {
    const error = {
      type: 'javascript-error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack || '',
      timestamp: new Date().toISOString(),
      url: window?.location?.href || 'Unknown'
    }
    
    this.logError(error)
    this.showUserFriendlyError('程序错误', '应用遇到了一些问题，请刷新页面重试')
  }
  
  /**
   * 处理微信小程序错误
   */
  handleWeChatError(error) {
    const errorInfo = {
      type: 'wechat-error',
      message: error,
      timestamp: new Date().toISOString(),
      platform: 'mp-weixin'
    }
    
    this.logError(errorInfo)
    this.showUserFriendlyError('小程序错误', '小程序遇到了一些问题，请重新打开')
  }
  
  /**
   * 处理 App 错误
   */
  handleAppError(event) {
    const error = {
      type: 'app-error',
      message: event.message || String(event),
      timestamp: new Date().toISOString(),
      platform: 'app-plus'
    }
    
    this.logError(error)
    this.showUserFriendlyError('应用错误', '应用遇到了一些问题，请重启应用')
  }
  
  /**
   * 处理网络成功响应
   */
  handleNetworkSuccess(requestId, options, response) {
    // 缓存成功的响应（如果配置了缓存）
    if (options.cache) {
      const cacheKey = this.generateCacheKey(options)
      cache.set(cacheKey, response, {
        ttl: options.cache.ttl || 5 * 60 * 1000,
        tags: ['network-response']
      })
    }
  }
  
  /**
   * 处理网络错误
   */
  handleNetworkError(requestId, options, error) {
    const networkError = {
      type: 'network-error',
      requestId,
      url: options.url,
      method: options.method || 'GET',
      message: error.errMsg || error.message || '网络请求失败',
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    }
    
    this.logError(networkError)
    
    // 自动重试逻辑
    if (this.shouldRetry(options, error)) {
      this.retryRequest(options, error)
    } else {
      this.showNetworkError(networkError)
    }
  }
  
  /**
   * 判断是否应该重试
   */
  shouldRetry(options, error) {
    // 不重试的情况
    if (options.noRetry) return false
    if (error.statusCode >= 400 && error.statusCode < 500) return false // 客户端错误
    
    // 检查重试次数
    const retryCount = options._retryCount || 0
    return retryCount < this.retryConfig.maxRetries
  }
  
  /**
   * 重试请求
   */
  async retryRequest(options, error) {
    const retryCount = (options._retryCount || 0) + 1
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, retryCount - 1),
      this.retryConfig.maxDelay
    )
    
    ENV_UTILS.log.info(`网络请求重试 ${retryCount}/${this.retryConfig.maxRetries}，${delay}ms 后重试`)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    const retryOptions = {
      ...options,
      _retryCount: retryCount
    }
    
    try {
      return await uni.request(retryOptions)
    } catch (retryError) {
      if (retryCount >= this.retryConfig.maxRetries) {
        this.showNetworkError({
          type: 'network-error',
          url: options.url,
          message: '网络请求重试失败',
          retryCount,
          timestamp: new Date().toISOString()
        })
      }
      throw retryError
    }
  }
  
  /**
   * 显示网络错误
   */
  showNetworkError(error) {
    let title = '网络错误'
    let content = '网络连接异常，请检查网络设置'
    
    if (error.statusCode === 404) {
      content = '请求的资源不存在'
    } else if (error.statusCode === 500) {
      content = '服务器内部错误'
    } else if (error.statusCode === 403) {
      content = '访问被拒绝，请检查权限'
    } else if (error.message?.includes('timeout')) {
      content = '网络请求超时，请稍后重试'
    }
    
    this.showUserFriendlyError(title, content)
  }
  
  /**
   * 显示用户友好的错误信息
   */
  showUserFriendlyError(title, content, actions = []) {
    // 发送通知
    notify.error(title, content, {
      persistent: true,
      actions: [
        {
          text: '重试',
          action: () => {
            // 可以在这里实现重试逻辑
            uni.showToast({
              title: '正在重试...',
              icon: 'loading'
            })
          }
        },
        ...actions
      ]
    })
    
    // 开发环境显示详细错误
    if (ENV_UTILS.getConfig().isDev) {
      console.group('🐛 错误详情')
      console.log('标题:', title)
      console.log('内容:', content)
      console.log('最近错误:', this.getRecentErrors(5))
      console.groupEnd()
    }
  }
  
  /**
   * 记录错误
   */
  logError(error) {
    // 添加到错误列表
    this.errors.unshift({
      ...error,
      id: this.generateErrorId()
    })
    
    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }
    
    // 控制台输出
    ENV_UTILS.log.error('错误记录:', error)
    
    // 缓存错误信息
    cache.set(`error_${error.timestamp}`, error, {
      ttl: 24 * 60 * 60 * 1000, // 24小时
      tags: ['error-log']
    })
  }
  
  /**
   * 获取最近的错误
   */
  getRecentErrors(count = 10) {
    return this.errors.slice(0, count)
  }
  
  /**
   * 获取错误统计
   */
  getErrorStats() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour
    
    const recentErrors = this.errors.filter(error => 
      now - new Date(error.timestamp).getTime() < oneHour
    )
    
    const todayErrors = this.errors.filter(error => 
      now - new Date(error.timestamp).getTime() < oneDay
    )
    
    const errorTypes = {}
    this.errors.forEach(error => {
      errorTypes[error.type] = (errorTypes[error.type] || 0) + 1
    })
    
    return {
      total: this.errors.length,
      recentCount: recentErrors.length,
      todayCount: todayErrors.length,
      types: errorTypes,
      mostCommon: Object.entries(errorTypes).sort((a, b) => b[1] - a[1])[0]
    }
  }
  
  /**
   * 清除错误记录
   */
  clearErrors() {
    const count = this.errors.length
    this.errors = []
    
    // 清除缓存的错误
    cache.deleteByTags(['error-log'])
    
    return count
  }
  
  /**
   * 导出错误报告
   */
  exportErrorReport() {
    const report = {
      timestamp: new Date().toISOString(),
      stats: this.getErrorStats(),
      errors: this.errors,
      systemInfo: this.getSystemInfo(),
      config: ENV_UTILS.getConfig()
    }
    
    try {
      // #ifdef H5
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `error-report-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      // #endif
      
      // #ifdef MP-WEIXIN
      uni.setStorageSync('error_report', report)
      uni.showModal({
        title: '错误报告',
        content: '错误报告已保存到本地存储，可在开发者工具中查看'
      })
      // #endif
      
      return report
    } catch (error) {
      ENV_UTILS.log.error('导出错误报告失败:', error)
      throw error
    }
  }
  
  /**
   * 获取系统信息（使用新API替代弃用的getSystemInfoSync）
   */
  getSystemInfo() {
    try {
      // 使用新的API替代弃用的getSystemInfoSync
      return {
        platform: uni.getDeviceInfo().platform,
        system: uni.getDeviceInfo().system,
        version: uni.getAppBaseInfo().version,
        brand: uni.getDeviceInfo().brand,
        model: uni.getDeviceInfo().model,
        windowHeight: uni.getWindowInfo().windowHeight,
        windowWidth: uni.getWindowInfo().windowWidth,
        language: uni.getAppBaseInfo().language,
        SDKVersion: uni.getAppBaseInfo().SDKVersion
      };
    } catch (error) {
      console.warn('[ErrorHandler] 获取系统信息失败，使用fallback:', error);
      // 如果新API不可用，返回基本信息
      return {
        platform: 'unknown',
        system: 'unknown',
        version: 'unknown'
      };
    }
  }
  
  /**
   * 生成请求ID
   */
  generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
  
  /**
   * 生成错误ID
   */
  generateErrorId() {
    return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
  
  /**
   * 生成缓存键
   */
  generateCacheKey(options) {
    return `request_${options.method || 'GET'}_${encodeURIComponent(options.url)}_${JSON.stringify(options.data || {})}`
  }
}

// 创建全局错误处理器实例
const globalErrorHandler = new ErrorHandler()

/**
 * 便捷的错误处理方法
 */
export const errorHandler = {
  // 手动记录错误
  log: (error, context = {}) => {
    globalErrorHandler.logError({
      type: 'manual',
      message: error.message || String(error),
      stack: error.stack || '',
      context,
      timestamp: new Date().toISOString()
    })
  },
  
  // 显示用户友好错误
  show: (title, content, actions) => {
    globalErrorHandler.showUserFriendlyError(title, content, actions)
  },
  
  // 获取错误统计
  getStats: () => globalErrorHandler.getErrorStats(),
  
  // 获取最近错误
  getRecent: (count) => globalErrorHandler.getRecentErrors(count),
  
  // 清除错误
  clear: () => globalErrorHandler.clearErrors(),
  
  // 导出报告
  export: () => globalErrorHandler.exportErrorReport()
}

/**
 * 异步函数错误包装器
 */
export function withErrorHandling(fn, context = {}) {
  return async function(...args) {
    try {
      return await fn.apply(this, args)
    } catch (error) {
      errorHandler.log(error, {
        function: fn.name,
        args: args.length,
        context
      })
      
      // 重新抛出错误，让调用者决定如何处理
      throw error
    }
  }
}

/**
 * 装饰器：自动错误处理
 */
export function handleErrors(options = {}) {
  const {
    showUserError = true,
    logError = true,
    rethrow = true
  } = options
  
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function(...args) {
      try {
        return await originalMethod.apply(this, args)
      } catch (error) {
        if (logError) {
          errorHandler.log(error, {
            class: target.constructor.name,
            method: propertyKey,
            args: args.length
          })
        }
        
        if (showUserError) {
          errorHandler.show(
            '操作失败',
            '操作遇到了一些问题，请稍后重试'
          )
        }
        
        if (rethrow) {
          throw error
        }
      }
    }
    
    return descriptor
  }
}

// 导出错误处理器和便捷方法
export { globalErrorHandler }
export default {
  handler: globalErrorHandler,
  errorHandler,
  withErrorHandling,
  handleErrors
}
