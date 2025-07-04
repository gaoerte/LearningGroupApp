// utils/mp-compatible-chat.js - 微信小程序兼容的聊天客户端

import { cloudConfig } from '../config/cloud.js'

/**
 * 微信小程序兼容的聊天客户端
 * 使用云函数实现聊天功能，避免第三方库兼容性问题
 */
export class MPCompatibleChatClient {
  constructor(config = {}) {
    this.config = {
      // 轮询配置
      pollingInterval: 3000,
      maxRetries: 3,
      debug: true,
      ...config
    }
    
    // 使用普通对象而非 Map 以确保小程序兼容性
    this.subscriptions = {}
    this.pollingTimers = {}
    this.messageCache = {}
    this.lastMessageTime = {}
    
    this._ensureCloudInit()
  }

  /**
   * 确保云开发初始化
   */
  _ensureCloudInit() {
    try {
      if (typeof wx !== 'undefined' && wx.cloud) {
        // 检查是否已初始化
        const isInited = wx.getStorageSync('cloud_inited')
        if (!isInited) {
          wx.cloud.init({
            env: cloudConfig.ENV_ID,
            traceUser: true
          })
          wx.setStorageSync('cloud_inited', true)
          console.log('[MPChat] 云开发初始化完成')
        }
      }
    } catch (error) {
      console.error('[MPChat] 云开发初始化失败:', error)
    }
  }

  /**
   * 获取群组消息
   * @param {number} groupId - 群组ID
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 消息列表
   */
  async getGroupMessages(groupId, limit = 50) {
    try {
      console.log('[MPChat] 获取群组消息:', { groupId, limit })
      
      const result = await this._callCloudFunction('getGroupMessages', {
        groupId: parseInt(groupId),
        limit,
        timestamp: new Date().toISOString()
      })

      if (result && result.success && result.data) {
        const messages = result.data.messages || []
        
        // 更新缓存
        this.messageCache[groupId] = messages
        if (messages.length > 0) {
          this.lastMessageTime[groupId] = messages[0].timestamp
        }
        
        return messages
      }
      
      return []
    } catch (error) {
      console.error('[MPChat] 获取群组消息失败:', error)
      // 返回缓存数据
      return this.messageCache[groupId] || []
    }
  }

  /**
   * 发送消息
   * @param {number} groupId - 群组ID
   * @param {Object} messageData - 消息数据
   * @returns {Promise<Object>} 发送结果
   */
  async sendMessage(groupId, messageData) {
    try {
      console.log('[MPChat] 发送消息:', { groupId, messageData })
      
      const result = await this._callCloudFunction('sendMessage', {
        groupId: parseInt(groupId),
        ...messageData
      })

      if (result && result.success && result.data) {
        // 立即更新本地缓存
        const message = result.data.message
        if (message) {
          if (!this.messageCache[groupId]) {
            this.messageCache[groupId] = []
          }
          this.messageCache[groupId].unshift(message)
          this.lastMessageTime[groupId] = message.timestamp
          
          // 触发消息回调
          this._triggerMessageCallback(groupId, message)
        }
        
        return message
      }
      
      throw new Error(result?.error || '发送消息失败')
    } catch (error) {
      console.error('[MPChat] 发送消息失败:', error)
      throw error
    }
  }

  /**
   * 订阅群组消息
   * @param {number} groupId - 群组ID
   * @param {Function} callback - 消息回调
   * @returns {Function} 取消订阅函数
   */
  subscribeToGroup(groupId, callback) {
    console.log('[MPChat] 订阅群组消息:', groupId)
    
    // 存储回调
    if (!this.subscriptions[groupId]) {
      this.subscriptions[groupId] = []
    }
    this.subscriptions[groupId].push(callback)
    
    // 开始轮询
    this._startPolling(groupId)
    
    // 返回取消订阅函数
    return () => {
      this._unsubscribeFromGroup(groupId, callback)
    }
  }

  /**
   * 取消订阅
   * @param {number} groupId - 群组ID
   * @param {Function} callback - 要移除的回调
   */
  _unsubscribeFromGroup(groupId, callback) {
    if (this.subscriptions[groupId]) {
      const index = this.subscriptions[groupId].indexOf(callback)
      if (index > -1) {
        this.subscriptions[groupId].splice(index, 1)
      }
      
      // 如果没有订阅者了，停止轮询
      if (this.subscriptions[groupId].length === 0) {
        this._stopPolling(groupId)
        delete this.subscriptions[groupId]
      }
    }
  }

  /**
   * 开始轮询
   * @param {number} groupId - 群组ID
   */
  _startPolling(groupId) {
    if (this.pollingTimers[groupId]) {
      return // 已经在轮询了
    }
    
    console.log('[MPChat] 开始轮询群组:', groupId)
    
    const poll = async () => {
      try {
        const messages = await this.getGroupMessages(groupId, 20)
        
        // 检查是否有新消息
        if (messages && messages.length > 0) {
          const lastTime = this.lastMessageTime[groupId]
          const newMessages = lastTime 
            ? messages.filter(msg => new Date(msg.timestamp) > new Date(lastTime))
            : messages.slice(0, 5) // 首次订阅只显示最近5条
          
          if (newMessages.length > 0) {
            newMessages.forEach(msg => {
              this._triggerMessageCallback(groupId, msg)
            })
          }
        }
      } catch (error) {
        console.error('[MPChat] 轮询消息失败:', error)
      }
      
      // 继续轮询
      if (this.subscriptions[groupId] && this.subscriptions[groupId].length > 0) {
        this.pollingTimers[groupId] = setTimeout(poll, this.config.pollingInterval)
      }
    }
    
    // 立即执行一次
    poll()
  }

  /**
   * 停止轮询
   * @param {number} groupId - 群组ID
   */
  _stopPolling(groupId) {
    if (this.pollingTimers[groupId]) {
      clearTimeout(this.pollingTimers[groupId])
      delete this.pollingTimers[groupId]
      console.log('[MPChat] 停止轮询群组:', groupId)
    }
  }

  /**
   * 触发消息回调
   * @param {number} groupId - 群组ID
   * @param {Object} message - 消息对象
   */
  _triggerMessageCallback(groupId, message) {
    if (this.subscriptions[groupId]) {
      this.subscriptions[groupId].forEach(callback => {
        try {
          callback(message)
        } catch (error) {
          console.error('[MPChat] 消息回调执行失败:', error)
        }
      })
    }
  }

  /**
   * 调用云函数
   * @param {string} name - 云函数名称
   * @param {Object} data - 请求数据
   * @returns {Promise<Object>} 响应结果
   */
  async _callCloudFunction(name, data) {
    return new Promise((resolve, reject) => {
      if (typeof wx === 'undefined' || !wx.cloud) {
        reject(new Error('云开发环境不可用'))
        return
      }

      wx.cloud.callFunction({
        name,
        data,
        timeout: cloudConfig.TIMEOUT,
        success: (res) => {
          if (this.config.debug) {
            console.log(`[MPChat] 云函数 ${name} 调用成功:`, res)
          }
          resolve(res.result)
        },
        fail: (error) => {
          console.error(`[MPChat] 云函数 ${name} 调用失败:`, error)
          reject(error)
        }
      })
    })
  }

  /**
   * 清理资源
   */
  destroy() {
    console.log('[MPChat] 清理聊天客户端资源')
    
    // 停止所有轮询
    Object.keys(this.pollingTimers).forEach(groupId => {
      this._stopPolling(groupId)
    })
    
    // 清理数据
    this.subscriptions = {}
    this.pollingTimers = {}
    this.messageCache = {}
    this.lastMessageTime = {}
  }
}

// 单例模式
let chatClientInstance = null

/**
 * 获取聊天客户端实例
 * @param {Object} config - 配置对象
 * @returns {MPCompatibleChatClient} 聊天客户端实例
 */
export function getChatClient(config = {}) {
  if (!chatClientInstance) {
    chatClientInstance = new MPCompatibleChatClient(config)
  }
  return chatClientInstance
}

/**
 * 重置聊天客户端（用于测试或重新配置）
 */
export function resetChatClient() {
  if (chatClientInstance) {
    chatClientInstance.destroy()
    chatClientInstance = null
  }
}
