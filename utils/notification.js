// utils/notification.js
// 实时通知系统

/**
 * 通知管理器
 */
class NotificationManager {
  constructor() {
    this.notifications = []
    this.listeners = []
    this.maxNotifications = 50
    this.autoRemoveDelay = 5000 // 5秒后自动移除
    
    this.init()
  }
  
  /**
   * 初始化通知系统
   */
  init() {
    // 仅监听应用状态变化，不自动请求权限
    this.setupAppStateListeners()
  }
  
  /**
   * 请求通知权限（需要用户主动触发）
   */
  async requestPermission() {
    try {
      // #ifdef H5
      if ('Notification' in window && Notification.permission === 'default') {
        return await Notification.requestPermission()
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      // 小程序订阅消息 - 只在用户主动调用时执行
      // 注意：此方法必须在用户点击事件中调用
      return new Promise((resolve, reject) => {
        const tmplIds = ['template_id_1', 'template_id_2'] // 替换为实际的模板ID
        uni.requestSubscribeMessage({
          tmplIds,
          success: (res) => {
            console.log('订阅消息权限:', res)
            resolve(res)
          },
          fail: (err) => {
            console.warn('订阅消息失败:', err)
            reject(err)
          }
        })
      })
      // #endif
      
      // #ifdef APP-PLUS
      // App 推送权限
      const permission = await new Promise((resolve) => {
        plus.push.getPermissionStatus(resolve)
      })
      
      if (permission.state === 'prompt') {
        await new Promise((resolve) => {
          plus.push.requestPermission(resolve)
        })
      }
      // #endif
    } catch (error) {
      console.warn('请求通知权限失败:', error)
    }
  }
  
  /**
   * 监听应用状态
   */
  setupAppStateListeners() {
    // #ifdef APP-PLUS
    plus.globalEvent.addEventListener('newintent', () => {
      this.handleAppActivate()
    })
    
    plus.globalEvent.addEventListener('resume', () => {
      this.handleAppActivate()
    })
    // #endif
    
    // #ifdef H5
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.handleAppActivate()
      }
    })
    // #endif
  }
  
  /**
   * 应用激活处理
   */
  handleAppActivate() {
    // 清除已过期的通知
    this.clearExpiredNotifications()
    
    // 触发激活事件
    this.emit('app-activate', {
      timestamp: new Date().toISOString(),
      pendingCount: this.getPendingCount()
    })
  }
  
  /**
   * 发送通知
   */
  async send(options) {
    const notification = {
      id: this.generateId(),
      title: options.title || '新消息',
      content: options.content || '',
      type: options.type || 'info', // info, success, warning, error
      data: options.data || {},
      timestamp: new Date().toISOString(),
      read: false,
      persistent: options.persistent || false, // 是否持久化
      actions: options.actions || [], // 操作按钮
      icon: options.icon || this.getDefaultIcon(options.type),
      sound: options.sound !== false, // 是否播放声音
      vibrate: options.vibrate !== false // 是否震动
    }
    
    // 添加到通知列表
    this.addNotification(notification)
    
    // 显示系统通知
    await this.showSystemNotification(notification)
    
    // 播放提示音/震动
    this.playNotificationEffects(notification)
    
    // 自动移除（如果不是持久化通知）
    if (!notification.persistent) {
      setTimeout(() => {
        this.remove(notification.id)
      }, this.autoRemoveDelay)
    }
    
    return notification.id
  }
  
  /**
   * 显示系统通知
   */
  async showSystemNotification(notification) {
    try {
      // #ifdef H5
      if ('Notification' in window && Notification.permission === 'granted') {
        const systemNotification = new Notification(notification.title, {
          body: notification.content,
          icon: notification.icon,
          tag: notification.id
        })
        
        systemNotification.onclick = () => {
          this.handleNotificationClick(notification)
          systemNotification.close()
        }
      }
      // #endif
      
      // #ifdef MP-WEIXIN
      // 小程序内部提示
      if (notification.type === 'success') {
        wx.showToast({
          title: notification.title,
          icon: 'success'
        })
      } else if (notification.type === 'error') {
        wx.showToast({
          title: notification.title,
          icon: 'error'
        })
      } else {
        wx.showToast({
          title: notification.title,
          icon: 'none'
        })
      }
      // #endif
      
      // #ifdef APP-PLUS
      // App 推送通知
      plus.push.createMessage(notification.content, notification.id, {
        title: notification.title,
        icon: notification.icon,
        sound: notification.sound ? 'system' : 'none',
        vibrate: notification.vibrate
      })
      // #endif
    } catch (error) {
      console.warn('显示系统通知失败:', error)
    }
  }
  
  /**
   * 播放通知效果
   */
  playNotificationEffects(notification) {
    try {
      // 播放声音
      if (notification.sound) {
        // #ifdef APP-PLUS
        plus.device.beep(1)
        // #endif
        
        // #ifdef H5
        // 可以播放自定义音频
        // const audio = new Audio('/static/notification.mp3')
        // audio.play().catch(() => {})
        // #endif
      }
      
      // 震动
      if (notification.vibrate) {
        // #ifdef APP-PLUS
        plus.device.vibrate(200)
        // #endif
        
        // #ifdef H5
        if ('vibrate' in navigator) {
          navigator.vibrate(200)
        }
        // #endif
        
        // #ifdef MP-WEIXIN
        wx.vibrateShort()
        // #endif
      }
    } catch (error) {
      console.warn('播放通知效果失败:', error)
    }
  }
  
  /**
   * 处理通知点击
   */
  handleNotificationClick(notification) {
    // 标记为已读
    this.markAsRead(notification.id)
    
    // 触发点击事件
    this.emit('notification-click', notification)
    
    // 执行自定义操作
    if (notification.data.action) {
      this.executeAction(notification.data.action, notification.data)
    }
  }
  
  /**
   * 执行通知操作
   */
  executeAction(action, data) {
    switch (action) {
      case 'navigate':
        if (data.url) {
          uni.navigateTo({ url: data.url })
        }
        break
      case 'switch-tab':
        if (data.url) {
          uni.switchTab({ url: data.url })
        }
        break
      case 'show-modal':
        if (data.modal) {
          uni.showModal(data.modal)
        }
        break
      case 'custom':
        if (typeof data.handler === 'function') {
          data.handler(data)
        }
        break
      default:
        console.warn('未知的通知操作:', action)
    }
  }
  
  /**
   * 添加通知到列表
   */
  addNotification(notification) {
    this.notifications.unshift(notification)
    
    // 限制通知数量
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }
    
    // 触发事件
    this.emit('notification-added', notification)
  }
  
  /**
   * 移除通知
   */
  remove(id) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      const removed = this.notifications.splice(index, 1)[0]
      this.emit('notification-removed', removed)
      return removed
    }
    return null
  }
  
  /**
   * 标记为已读
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      this.emit('notification-read', notification)
    }
  }
  
  /**
   * 标记全部为已读
   */
  markAllAsRead() {
    let count = 0
    this.notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true
        count++
      }
    })
    
    if (count > 0) {
      this.emit('notifications-read-all', { count })
    }
    
    return count
  }
  
  /**
   * 清除所有通知
   */
  clear() {
    const count = this.notifications.length
    this.notifications = []
    this.emit('notifications-cleared', { count })
    return count
  }
  
  /**
   * 清除已过期的通知
   */
  clearExpiredNotifications() {
    const now = Date.now()
    const expireTime = 24 * 60 * 60 * 1000 // 24小时
    
    const expired = this.notifications.filter(n => {
      const age = now - new Date(n.timestamp).getTime()
      return !n.persistent && age > expireTime
    })
    
    if (expired.length > 0) {
      this.notifications = this.notifications.filter(n => !expired.includes(n))
      this.emit('notifications-expired', { count: expired.length })
    }
    
    return expired.length
  }
  
  /**
   * 获取通知列表
   */
  getAll() {
    return [...this.notifications]
  }
  
  /**
   * 获取未读通知
   */
  getUnread() {
    return this.notifications.filter(n => !n.read)
  }
  
  /**
   * 获取未读数量
   */
  getUnreadCount() {
    return this.getUnread().length
  }
  
  /**
   * 获取待处理数量
   */
  getPendingCount() {
    return this.notifications.filter(n => !n.read && n.persistent).length
  }
  
  /**
   * 生成通知ID
   */
  generateId() {
    return 'notification_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
  
  /**
   * 获取默认图标
   */
  getDefaultIcon(type) {
    const icons = {
      info: '💬',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }
    return icons[type] || icons.info
  }
  
  /**
   * 事件监听
   */
  on(event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(listener)
  }
  
  /**
   * 移除事件监听
   */
  off(event, listener) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(listener)
      if (index !== -1) {
        this.listeners[event].splice(index, 1)
      }
    }
  }
  
  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.warn('通知事件处理失败:', error)
        }
      })
    }
  }
}

// 创建全局实例
const notificationManager = new NotificationManager()

/**
 * 便捷的通知方法
 */
export const notify = {
  // 信息通知
  info: (title, content, options = {}) => {
    return notificationManager.send({
      type: 'info',
      title,
      content,
      ...options
    })
  },
  
  // 成功通知
  success: (title, content, options = {}) => {
    return notificationManager.send({
      type: 'success',
      title,
      content,
      ...options
    })
  },
  
  // 警告通知
  warning: (title, content, options = {}) => {
    return notificationManager.send({
      type: 'warning',
      title,
      content,
      persistent: true, // 警告默认持久化
      ...options
    })
  },
  
  // 错误通知
  error: (title, content, options = {}) => {
    return notificationManager.send({
      type: 'error',
      title,
      content,
      persistent: true, // 错误默认持久化
      ...options
    })
  },
  
  // 自定义通知
  custom: (options) => {
    return notificationManager.send(options)
  }
}

// 导出管理器和便捷方法
export { notificationManager }
export default {
  manager: notificationManager,
  notify,
  
  // 便捷访问方法
  send: (options) => notificationManager.send(options),
  getAll: () => notificationManager.getAll(),
  getUnread: () => notificationManager.getUnread(),
  getUnreadCount: () => notificationManager.getUnreadCount(),
  markAsRead: (id) => notificationManager.markAsRead(id),
  markAllAsRead: () => notificationManager.markAllAsRead(),
  clear: () => notificationManager.clear(),
  on: (event, listener) => notificationManager.on(event, listener),
  off: (event, listener) => notificationManager.off(event, listener)
}
