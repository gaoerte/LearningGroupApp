/**
 * 数据库操作类 - 通过云函数代理访问 Supabase
 * 项目配置：https://klpseujbhwvifsfshfdx.supabase.co
 */
class DatabaseAPI {
  constructor() {
    this.cloudFunctionName = 'supabaseProxy'
    this.supabaseUrl = 'https://klpseujbhwvifsfshfdx.supabase.co'
  }

  /**
   * 调用云函数的通用方法
   */
  async callCloudFunction(action, params = {}) {
    try {
      console.log(`[DB] 调用云函数:`, { action, params })
      
      const result = await uni.cloud.callFunction({
        name: this.cloudFunctionName,
        data: {
          action,
          ...params
        }
      })
      
      if (result.result && result.result.success) {
        console.log(`[DB] ${action} 成功:`, result.result.data)
        return result.result.data
      } else {
        throw new Error(result.result?.error || '数据库操作失败')
      }
    } catch (error) {
      console.error(`[DB] ${action} 失败:`, error)
      throw error
    }
  }

  // ============== 用户操作 ==============
  
  /**
   * 创建或更新用户
   */
  async createOrUpdateUser(userData) {
    return await this.callCloudFunction('createOrUpdateUser', {
      userData
    })
  }

  /**
   * 根据 openid 获取用户信息
   */
  async getUserByOpenid(openid) {
    return await this.callCloudFunction('getUserByOpenid', {
      openid
    })
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId, updates) {
    return await this.callCloudFunction('updateUser', {
      userId,
      updates
    })
  }

  /**
   * 更新用户学习统计
   */
  async updateUserStats(userId, stats) {
    return await this.callCloudFunction('updateUserStats', {
      userId,
      stats
    })
  }

  // ============== 群组操作 ==============
  
  /**
   * 创建学习群组
   */
  async createStudyGroup(groupData) {
    return await this.callCloudFunction('createStudyGroup', {
      groupData
    })
  }

  /**
   * 获取公开群组列表
   */
  async getPublicGroups(filters = {}) {
    return await this.callCloudFunction('getPublicGroups', {
      filters
    })
  }

  /**
   * 获取用户加入的群组
   */
  async getUserGroups(userId) {
    return await this.callCloudFunction('getUserGroups', {
      userId
    })
  }

  /**
   * 加入群组
   */
  async joinGroup(groupId, userId) {
    return await this.callCloudFunction('joinGroup', {
      groupId,
      userId
    })
  }

  /**
   * 退出群组
   */
  async leaveGroup(groupId, userId) {
    return await this.callCloudFunction('leaveGroup', {
      groupId,
      userId
    })
  }

  /**
   * 获取群组详情
   */
  async getGroupDetails(groupId) {
    return await this.callCloudFunction('getGroupDetails', {
      groupId
    })
  }

  /**
   * 获取群组成员列表
   */
  async getGroupMembers(groupId) {
    return await this.callCloudFunction('getGroupMembers', {
      groupId
    })
  }

  // ============== 学习记录操作 ==============
  
  /**
   * 创建学习打卡记录
   */
  async createCheckin(checkinData) {
    return await this.callCloudFunction('createCheckin', {
      checkinData
    })
  }

  /**
   * 获取用户打卡记录
   */
  async getUserCheckins(userId, options = {}) {
    return await this.callCloudFunction('getUserCheckins', {
      userId,
      options
    })
  }

  /**
   * 获取群组打卡记录
   */
  async getGroupCheckins(groupId, options = {}) {
    return await this.callCloudFunction('getGroupCheckins', {
      groupId,
      options
    })
  }

  /**
   * 检查今日是否已打卡
   */
  async checkTodayCheckin(userId, groupId = null) {
    return await this.callCloudFunction('checkTodayCheckin', {
      userId,
      groupId
    })
  }

  /**
   * 获取学习统计数据
   */
  async getStudyStats(userId, period = 'week') {
    return await this.callCloudFunction('getStudyStats', {
      userId,
      period
    })
  }

  // ============== 通知操作 ==============
  
  /**
   * 获取用户通知
   */
  async getUserNotifications(userId, unreadOnly = false) {
    return await this.callCloudFunction('getUserNotifications', {
      userId,
      unreadOnly
    })
  }

  /**
   * 标记通知为已读
   */
  async markNotificationRead(notificationId) {
    return await this.callCloudFunction('markNotificationRead', {
      notificationId
    })
  }

  // ============== 测试操作 ==============
  
  /**
   * 测试数据库连接
   */
  async testConnection() {
    return await this.callCloudFunction('testConnection')
  }
}

// 创建单例实例
const databaseAPI = new DatabaseAPI()
export default databaseAPI
