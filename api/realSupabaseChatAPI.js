// api/realSupabaseChatAPI.js - 真实的Supabase聊天API

/**
 * 真实的Supabase聊天API类
 * 今晚连接成功后使用这个文件替换模拟API
 */
export class RealSupabaseChatAPI {
  
  /**
   * 获取群组消息
   */
  static async getGroupMessages(groupId, userId, page = 1, pageSize = 20) {
    try {
      console.log('[RealSupabaseChatAPI] 获取群组消息:', { groupId, userId, page, pageSize });
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseChat',
        data: {
          action: 'getMessages',
          groupId: groupId,
          page: page,
          pageSize: pageSize
        }
      });
      
      if (result.result.success) {
        const messages = result.result.data.messages.map(msg => ({
          id: msg.id,
          groupId: msg.group_id,
          senderId: msg.sender_id,
          senderName: msg.sender_name || '未知用户',
          senderAvatar: msg.sender_avatar || '/static/default-avatar.png',
          content: msg.content,
          type: msg.type || 'text',
          timestamp: new Date(msg.created_at).getTime(),
          isOwn: msg.sender_id === userId,
          status: 'read',
          isRecalled: msg.is_recalled || false
        }));
        
        return {
          success: true,
          data: {
            messages: messages,
            hasMore: result.result.data.hasMore || false,
            total: result.result.data.total || messages.length
          }
        };
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 获取消息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 发送群组消息
   */
  static async sendGroupMessage(groupId, userId, messageData) {
    try {
      console.log('[RealSupabaseChatAPI] 发送消息:', { groupId, userId, messageData });
      
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {};
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseChat',
        data: {
          action: 'sendMessage',
          messageData: {
            group_id: groupId,
            sender_id: userId,
            sender_name: userInfo.nickName || userInfo.nickname || '用户',
            sender_avatar: userInfo.avatarUrl || '/static/default-avatar.png',
            content: messageData.content,
            type: messageData.type || 'text'
          }
        }
      });
      
      if (result.result.success) {
        const message = result.result.data.message;
        return {
          success: true,
          data: {
            message: {
              id: message.id,
              groupId: message.group_id,
              senderId: message.sender_id,
              senderName: message.sender_name,
              senderAvatar: message.sender_avatar,
              content: message.content,
              type: message.type,
              timestamp: new Date(message.created_at).getTime(),
              isOwn: true,
              status: 'sent',
              isRecalled: false
            }
          }
        };
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 发送消息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取在线成员
   */
  static async getOnlineMembers(groupId) {
    try {
      console.log('[RealSupabaseChatAPI] 获取在线成员:', groupId);
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseChat',
        data: {
          action: 'getOnlineMembers',
          groupId: groupId
        }
      });
      
      if (result.result.success) {
        return {
          success: true,
          data: {
            allMembers: result.result.data.members || [],
            totalOnline: result.result.data.onlineCount || 0
          }
        };
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 获取在线成员失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 发送输入状态
   */
  static async sendTypingStatus(groupId, isTyping) {
    try {
      // 获取用户信息
      const userInfo = uni.getStorageSync('userInfo') || {};
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseChat',
        data: {
          action: 'sendTypingStatus',
          groupId: groupId,
          userId: userInfo.id || userInfo.userId,
          isTyping: isTyping
        }
      });
      
      if (result.result.success) {
        return {
          success: true,
          data: result.result.data || {}
        };
      } else {
        // 输入状态不是必需功能，失败也不报错
        console.log('[RealSupabaseChatAPI] 输入状态发送失败:', result.result.error);
        return {
          success: false,
          error: result.result.error
        };
      }
      
    } catch (error) {
      console.log('[RealSupabaseChatAPI] 输入状态发送异常:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 撤回消息
   */
  static async recallMessage(messageId, userId) {
    try {
      console.log('[RealSupabaseChatAPI] 撤回消息:', { messageId, userId });
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseChat',
        data: {
          action: 'recallMessage',
          messageId: messageId,
          userId: userId
        }
      });
      
      if (result.result.success) {
        return {
          success: true,
          data: result.result.data || {}
        };
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 撤回消息失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 上传聊天文件
   */
  static async uploadChatFile(filePath, fileType) {
    try {
      console.log('[RealSupabaseChatAPI] 上传文件:', { filePath, fileType });
      
      const result = await uni.cloud.callFunction({
        name: 'supabaseChat',
        data: {
          action: 'uploadFile',
          filePath: filePath,
          fileType: fileType
        }
      });
      
      if (result.result.success) {
        return {
          success: true,
          data: {
            fileUrl: result.result.data.fileUrl,
            fileName: result.result.data.fileName,
            fileSize: result.result.data.fileSize
          }
        };
      } else {
        throw new Error(result.result.error);
      }
      
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 文件上传失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 订阅实时消息（使用Supabase Realtime）
   */
  static subscribeToMessages(groupId, onMessage, onError) {
    try {
      console.log('[RealSupabaseChatAPI] 订阅实时消息:', groupId);
      
      // 这里应该实现真正的Supabase Realtime订阅
      // 现在先返回一个模拟的订阅ID
      const subscriptionId = 'subscription_' + Date.now();
      
      // 模拟定时接收消息（实际应该用Supabase Realtime）
      const interval = setInterval(async () => {
        try {
          // 查询最新消息
          const result = await this.getGroupMessages(groupId, null, 1, 5);
          if (result.success && result.data.messages.length > 0) {
            // 通知新消息（这里需要实现重复检测逻辑）
            result.data.messages.forEach(message => {
              if (onMessage) onMessage(message);
            });
          }
        } catch (error) {
          if (onError) onError(error);
        }
      }, 10000); // 10秒轮询一次
      
      // 存储定时器，用于清理
      this._subscriptions = this._subscriptions || {};
      this._subscriptions[subscriptionId] = interval;
      
      return subscriptionId;
      
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 订阅失败:', error);
      if (onError) onError(error);
      return null;
    }
  }

  /**
   * 取消订阅
   */
  static unsubscribe(subscriptionId) {
    try {
      console.log('[RealSupabaseChatAPI] 取消订阅:', subscriptionId);
      
      if (this._subscriptions && this._subscriptions[subscriptionId]) {
        clearInterval(this._subscriptions[subscriptionId]);
        delete this._subscriptions[subscriptionId];
      }
      
      return true;
    } catch (error) {
      console.error('[RealSupabaseChatAPI] 取消订阅失败:', error);
      return false;
    }
  }
}

// 导出默认实例
export const realSupabaseChatAPI = RealSupabaseChatAPI;
