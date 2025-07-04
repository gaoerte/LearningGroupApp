// cloudfunctions/getGroupMessages/index.js - 获取群组消息云函数

const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取数据库引用
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { groupId, limit = 50, lastMessageId } = event
    
    console.log('[getGroupMessages] 接收参数:', { groupId, limit, lastMessageId })
    
    if (!groupId) {
      return {
        success: false,
        error: '群组ID不能为空'
      }
    }

    // 构建查询条件
    let query = db.collection('group_messages')
      .where({
        groupId: parseInt(groupId)
      })
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))

    // 如果提供了最后一条消息ID，则查询更新的消息
    if (lastMessageId) {
      query = query.where({
        _id: db.command.gt(lastMessageId)
      })
    }

    const result = await query.get()
    
    // 按时间正序排列（最新的在最后）
    const messages = result.data.reverse().map(msg => ({
      id: msg._id,
      content: msg.content,
      messageType: msg.messageType || 'text',
      senderId: msg.senderId,
      senderName: msg.senderName,
      timestamp: msg.timestamp,
      metadata: msg.metadata || {}
    }))

    console.log(`[getGroupMessages] 返回 ${messages.length} 条消息`)

    return {
      success: true,
      data: {
        messages,
        total: messages.length
      }
    }
  } catch (error) {
    console.error('[getGroupMessages] 错误:', error)
    return {
      success: false,
      error: error.message || '获取消息失败'
    }
  }
}
