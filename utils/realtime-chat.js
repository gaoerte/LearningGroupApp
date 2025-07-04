/**
 * 智能实时聊天客户端
 * 根据环境自动选择最适合的实现方式
 */

import { getPlatformInfo, getStorageAdapter } from './env-adapter.js';
import { createClient } from './miniprogram-supabase.js';

/**
 * 实时聊天客户端工厂
 */
export class RealtimeChatClient {
  constructor(config = {}) {
    this.config = {
      supabaseUrl: config.supabaseUrl || 'your-supabase-url',
      supabaseKey: config.supabaseKey || 'your-supabase-key',
      pollingInterval: config.pollingInterval || 3000, // 轮询间隔（毫秒）
      maxRetries: config.maxRetries || 3,
      ...config
    };
    
    this.platformInfo = getPlatformInfo();
    this.storage = getStorageAdapter();
    this.supabase = null;
    this.subscriptions = new Map();
    this.pollingTimers = new Map();
    this.messageCache = new Map();
    
    console.log('[RealtimeChat] 初始化聊天客户端:', this.platformInfo);
    this._initializeClient();
  }

  /**
   * 初始化客户端
   */
  _initializeClient() {
    try {
      this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey);
      console.log('[RealtimeChat] Supabase 客户端初始化成功');
    } catch (error) {
      console.error('[RealtimeChat] Supabase 客户端初始化失败:', error);
    }
  }

  /**
   * 获取群组消息
   * @param {number} groupId 群组ID
   * @param {number} limit 限制数量
   * @returns {Promise<Array>} 消息列表
   */
  async getMessages(groupId, limit = 50) {
    try {
      console.log(`[RealtimeChat] 获取群组 ${groupId} 的消息`);
      
      const { data, error } = await this.supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[RealtimeChat] 获取消息失败:', error);
        return this._getMessagesFromCache(groupId);
      }

      const messages = data ? data.reverse() : [];
      this._cacheMessages(groupId, messages);
      
      console.log(`[RealtimeChat] 获取到 ${messages.length} 条消息`);
      return messages;
    } catch (error) {
      console.error('[RealtimeChat] 获取消息异常:', error);
      return this._getMessagesFromCache(groupId);
    }
  }

  /**
   * 发送消息
   * @param {number} groupId 群组ID
   * @param {string} content 消息内容
   * @param {string} senderId 发送者ID
   * @param {string} senderName 发送者姓名
   * @returns {Promise<Object>} 发送结果
   */
  async sendMessage(groupId, content, senderId, senderName) {
    try {
      console.log(`[RealtimeChat] 发送消息到群组 ${groupId}:`, content);
      
      const messageData = {
        group_id: groupId,
        sender_id: senderId,
        sender_name: senderName,
        content: content,
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('group_messages')
        .insert([messageData]);

      if (error) {
        console.error('[RealtimeChat] 发送消息失败:', error);
        return { success: false, error: error };
      }

      console.log('[RealtimeChat] 消息发送成功');
      
      // 添加到本地缓存
      this._addMessageToCache(groupId, { ...messageData, id: Date.now() });
      
      return { success: true, data: data };
    } catch (error) {
      console.error('[RealtimeChat] 发送消息异常:', error);
      return { success: false, error: error };
    }
  }

  /**
   * 订阅群组消息
   * @param {number} groupId 群组ID
   * @param {Function} onMessage 消息回调函数
   * @param {Function} onError 错误回调函数
   * @returns {string} 订阅ID
   */
  subscribeToMessages(groupId, onMessage, onError) {
    const subscriptionId = `group_${groupId}_${Date.now()}`;
    
    console.log(`[RealtimeChat] 订阅群组 ${groupId} 的消息更新`);
    
    if (this.platformInfo.canUseSupabaseRealtime) {
      // 使用 Supabase Realtime
      this._subscribeWithRealtime(subscriptionId, groupId, onMessage, onError);
    } else {
      // 使用轮询机制
      this._subscribeWithPolling(subscriptionId, groupId, onMessage, onError);
    }
    
    return subscriptionId;
  }

  /**
   * 取消订阅
   * @param {string} subscriptionId 订阅ID
   */
  unsubscribe(subscriptionId) {
    console.log(`[RealtimeChat] 取消订阅: ${subscriptionId}`);
    
    // 取消 Realtime 订阅
    if (this.subscriptions.has(subscriptionId)) {
      const subscription = this.subscriptions.get(subscriptionId);
      if (subscription && subscription.unsubscribe) {
        subscription.unsubscribe();
      }
      this.subscriptions.delete(subscriptionId);
    }
    
    // 清除轮询定时器
    if (this.pollingTimers.has(subscriptionId)) {
      clearInterval(this.pollingTimers.get(subscriptionId));
      this.pollingTimers.delete(subscriptionId);
    }
  }

  /**
   * 使用 Realtime 订阅
   */
  _subscribeWithRealtime(subscriptionId, groupId, onMessage, onError) {
    try {
      const channel = this.supabase
        .channel(`group_messages:${groupId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'group_messages',
            filter: `group_id=eq.${groupId}`
          },
          (payload) => {
            console.log('[RealtimeChat] 收到新消息:', payload);
            if (onMessage && payload.new) {
              onMessage(payload.new);
              this._addMessageToCache(groupId, payload.new);
            }
          }
        )
        .subscribe((status) => {
          console.log(`[RealtimeChat] 订阅状态: ${status}`);
          if (status === 'SUBSCRIBED') {
            console.log(`[RealtimeChat] 成功订阅群组 ${groupId}`);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[RealtimeChat] 订阅失败');
            if (onError) onError(new Error('订阅失败'));
            // 降级到轮询模式
            this._subscribeWithPolling(subscriptionId, groupId, onMessage, onError);
          }
        });

      this.subscriptions.set(subscriptionId, channel);
    } catch (error) {
      console.error('[RealtimeChat] Realtime 订阅失败:', error);
      if (onError) onError(error);
      // 降级到轮询模式
      this._subscribeWithPolling(subscriptionId, groupId, onMessage, onError);
    }
  }

  /**
   * 使用轮询订阅
   */
  _subscribeWithPolling(subscriptionId, groupId, onMessage, onError) {
    console.log(`[RealtimeChat] 使用轮询模式订阅群组 ${groupId}`);
    
    let lastMessageId = this._getLastMessageId(groupId);
    
    const pollForMessages = async () => {
      try {
        const { data, error } = await this.supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', groupId)
          .gt('id', lastMessageId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[RealtimeChat] 轮询获取消息失败:', error);
          return;
        }

        if (data && data.length > 0) {
          console.log(`[RealtimeChat] 轮询获取到 ${data.length} 条新消息`);
          
          data.forEach(message => {
            if (onMessage) {
              onMessage(message);
            }
            this._addMessageToCache(groupId, message);
            lastMessageId = Math.max(lastMessageId, message.id);
          });
        }
      } catch (error) {
        console.error('[RealtimeChat] 轮询异常:', error);
        if (onError) onError(error);
      }
    };

    // 立即执行一次
    pollForMessages();
    
    // 设置定时轮询
    const timer = setInterval(pollForMessages, this.config.pollingInterval);
    this.pollingTimers.set(subscriptionId, timer);
  }

  /**
   * 缓存消息
   */
  _cacheMessages(groupId, messages) {
    try {
      this.messageCache.set(groupId, messages);
      this.storage.setItem(`messages_${groupId}`, messages);
    } catch (error) {
      console.error('[RealtimeChat] 缓存消息失败:', error);
    }
  }

  /**
   * 从缓存获取消息
   */
  _getMessagesFromCache(groupId) {
    try {
      // 先从内存缓存获取
      if (this.messageCache.has(groupId)) {
        return this.messageCache.get(groupId);
      }
      
      // 再从持久化缓存获取
      const cached = this.storage.getItem(`messages_${groupId}`);
      if (cached && Array.isArray(cached)) {
        this.messageCache.set(groupId, cached);
        return cached;
      }
    } catch (error) {
      console.error('[RealtimeChat] 获取缓存消息失败:', error);
    }
    
    return [];
  }

  /**
   * 添加消息到缓存
   */
  _addMessageToCache(groupId, message) {
    try {
      let messages = this._getMessagesFromCache(groupId);
      messages.push(message);
      
      // 保持最新的100条消息
      if (messages.length > 100) {
        messages = messages.slice(-100);
      }
      
      this._cacheMessages(groupId, messages);
    } catch (error) {
      console.error('[RealtimeChat] 添加消息到缓存失败:', error);
    }
  }

  /**
   * 获取最后一条消息的ID
   */
  _getLastMessageId(groupId) {
    try {
      const messages = this._getMessagesFromCache(groupId);
      if (messages && messages.length > 0) {
        return Math.max(...messages.map(m => m.id || 0));
      }
    } catch (error) {
      console.error('[RealtimeChat] 获取最后消息ID失败:', error);
    }
    return 0;
  }

  /**
   * 清理资源
   */
  destroy() {
    console.log('[RealtimeChat] 清理聊天客户端资源');
    
    // 清理所有订阅
    this.subscriptions.forEach((subscription, id) => {
      this.unsubscribe(id);
    });
    
    // 清理缓存
    this.messageCache.clear();
  }
}

/**
 * 创建聊天客户端实例
 * @param {Object} config 配置对象
 * @returns {RealtimeChatClient} 聊天客户端实例
 */
export function createChatClient(config) {
  return new RealtimeChatClient(config);
}

export default {
  RealtimeChatClient,
  createChatClient
};
