// cloudfunctions/sendMessage/index.js - 发送消息云函数

const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 获取数据库引用
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { groupId, content, messageType = 'text', senderId, senderName, metadata = {} } = event
    
    console.log('[sendMessage] 接收参数:', { groupId, content, messageType, senderId, senderName })
    
    // 参数验证
    if (!groupId || !content || !senderId) {
      return {
        success: false,
        error: '群组ID、消息内容和发送者ID不能为空'
      }
    }

    // 构建消息对象
    const messageData = {
      groupId: parseInt(groupId),
      content: content.trim(),
      messageType,
      senderId,
      senderName: senderName || '未知用户',
      timestamp: new Date().toISOString(),
      metadata,
      createTime: db.serverDate()
    }

    // 保存消息到数据库
    const result = await db.collection('group_messages').add({
      data: messageData
    })

    if (result._id) {
      // 返回保存的消息（包含生成的ID）
      const savedMessage = {
        id: result._id,
        ...messageData
      }

      console.log('[sendMessage] 消息保存成功:', result._id)

      return {
        success: true,
        data: {
          message: savedMessage
        }
      }
    } else {
      throw new Error('消息保存失败')
    }
  } catch (error) {
    console.error('[sendMessage] 错误:', error)
    return {
      success: false,
      error: error.message || '发送消息失败'
    }
  }
}
