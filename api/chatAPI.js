// api/chatAPI.js - 聊天相关API封装

import { CoreAPI } from './coreAPI.js';
import { getChatClient } from '../utils/mp-compatible-chat.js';

/**
 * 聊天API类
 */
export class ChatAPI {
  static chatClient = null;

  /**
   * 获取聊天客户端实例
   */
  static getChatClient() {
    if (!this.chatClient) {
      this.chatClient = getChatClient();
    }
    return this.chatClient;
  }

  /**
   * 获取群组消息
   * @param {number} groupId - 群组ID
   * @param {number} limit - 限制数量
   * @param {number} offset - 偏移量
   * @returns {Promise<Object>} 消息列表
   */
  static async getGroupMessages(groupId, limit = 50, offset = 0) {
    try {
      console.log('[ChatAPI] 获取群组消息:', { groupId, limit, offset });
      
      const client = this.getChatClient();
      const messages = await client.getGroupMessages(groupId, limit);
      
      return {
        success: true,
        data: {
          messages: messages || [],
          total: messages?.length || 0
        }
      };
    } catch (error) {
      console.error('[ChatAPI] 获取群组消息失败:', error);
      return {
        success: false,
        error: error.message || '获取消息失败'
      };
    }
  }

  /**
   * 发送群组消息
   * @param {number} groupId - 群组ID
   * @param {string} content - 消息内容
   * @param {string} messageType - 消息类型
   * @param {Object} metadata - 附加数据
   * @returns {Promise<Object>} 发送结果
   */
  static async sendGroupMessage(groupId, content, messageType = 'text', metadata = {}) {
    try {
      console.log('[ChatAPI] 发送群组消息:', { groupId, content, messageType });
      
      // 获取当前用户信息
      const userInfo = uni.getStorageSync('userInfo') || {};
      
      const messageData = {
        content,
        messageType,
        senderId: userInfo.id,
        senderName: userInfo.nickname || userInfo.name || '未知用户',
        metadata,
        timestamp: new Date().toISOString()
      };

      const client = this.getChatClient();
      const message = await client.sendMessage(groupId, messageData);
      
      return {
        success: true,
        data: { message }
      };
    } catch (error) {
      console.error('[ChatAPI] 发送群组消息失败:', error);
      return {
        success: false,
        error: error.message || '发送消息失败'
      };
    }
  }

  /**
   * 撤回消息
   * @param {string} messageId - 消息ID
   * @param {number} groupId - 群组ID
   * @returns {Promise<Object>} 撤回结果
   */
  static async recallMessage(messageId, groupId) {
    try {
      console.log('[ChatAPI] 撤回消息:', { messageId, groupId });
      
      const result = await CoreAPI.call('recallMessage', {
        messageId,
        groupId
      });
      
      if (result.success) {
        console.log('[ChatAPI] 撤回消息成功');
        return result;
      } else {
        throw new Error(result.error || '撤回消息失败');
      }
    } catch (error) {
      console.error('[ChatAPI] 撤回消息失败:', error);
      return {
        success: false,
        error: error.message || '撤回消息失败'
      };
    }
  }

  /**
   * 获取在线成员
   * @param {number} groupId - 群组ID
   * @returns {Promise<Object>} 在线成员列表
   */
  static async getOnlineMembers(groupId) {
    try {
      console.log('[ChatAPI] 获取在线成员:', groupId);
      
      const result = await CoreAPI.call('getOnlineMembers', { groupId });
      
      if (result.success) {
        console.log('[ChatAPI] 获取在线成员成功:', result.data);
        return result;
      } else {
        // 返回模拟数据
        return {
          success: true,
          data: {
            onlineMembers: [],
            onlineCount: 0
          }
        };
      }
    } catch (error) {
      console.error('[ChatAPI] 获取在线成员失败:', error);
      return {
        success: false,
        error: error.message || '获取在线成员失败'
      };
    }
  }

  /**
   * 发送打字状态
   * @param {number} groupId - 群组ID
   * @param {boolean} isTyping - 是否正在打字
   * @returns {Promise<Object>} 发送结果
   */
  static async sendTypingStatus(groupId, isTyping) {
    try {
      const userInfo = uni.getStorageSync('userInfo') || {};
      
      const result = await CoreAPI.call('sendTypingStatus', {
        groupId,
        userId: userInfo.id,
        isTyping
      });
      
      return {
        success: true,
        data: result.data || {}
      };
    } catch (error) {
      console.warn('[ChatAPI] 发送打字状态失败:', error);
      return {
        success: false,
        error: error.message || '发送打字状态失败'
      };
    }
  }

  /**
   * 上传聊天文件
   * @param {string} filePath - 文件路径
   * @param {string} fileType - 文件类型
   * @returns {Promise<Object>} 上传结果
   */
  static async uploadChatFile(filePath, fileType) {
    try {
      console.log('[ChatAPI] 上传聊天文件:', { filePath, fileType });
      
      const result = await CoreAPI.call('uploadChatFile', {
        filePath,
        fileType
      });
      
      if (result.success) {
        console.log('[ChatAPI] 文件上传成功:', result.data);
        return result;
      } else {
        throw new Error(result.error || '文件上传失败');
      }
    } catch (error) {
      console.error('[ChatAPI] 上传聊天文件失败:', error);
      return {
        success: false,
        error: error.message || '文件上传失败'
      };
    }
  }

  /**
   * 订阅群组消息
   * @param {number} groupId - 群组ID
   * @param {Function} onMessage - 消息回调
   * @returns {Promise<Object>} 订阅结果
   */
  static async subscribeGroupMessages(groupId, onMessage) {
    try {
      const client = this.getChatClient();
      const result = await client.subscribeToGroup(groupId, onMessage);
      
      return {
        success: true,
        message: `订阅成功 (${result.type})`,
        type: result.type
      };
    } catch (error) {
      console.error('[ChatAPI] 订阅群组消息失败:', error);
      return {
        success: false,
        error: error.message || '订阅失败'
      };
    }
  }

  /**
   * 取消订阅群组消息
   * @param {number} groupId - 群组ID
   * @returns {Promise<Object>} 取消订阅结果
   */
  static async unsubscribeGroupMessages(groupId) {
    try {
      const client = this.getChatClient();
      await client.unsubscribeFromGroup(groupId);
      
      return {
        success: true,
        message: '取消订阅成功'
      };
    } catch (error) {
      console.error('[ChatAPI] 取消订阅群组消息失败:', error);
      return {
        success: false,
        error: error.message || '取消订阅失败'
      };
    }
  }
}

// 默认导出
export default ChatAPI;
