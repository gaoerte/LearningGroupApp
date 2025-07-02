// cloudfunctions/supabaseProxy/index.js
// 优化的 Supabase 代理云函数 - 统一数据访问层

const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 获取云数据库实例
const db = cloud.database();

// Supabase 配置 - 请替换为您的实际配置
const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || 'https://your-project-id.supabase.co',
  serviceKey: process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key'
};

/**
 * 兼容小程序环境的 HTTP 请求封装
 */
function makeRequest(url, options) {
  return new Promise((resolve, reject) => {
    const requestTask = cloud.request({
      url: url,
      method: options.method || 'GET',
      header: options.headers || {},
      data: options.body ? JSON.parse(options.body) : undefined,
      timeout: 10000,
      success: (res) => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.errMsg || 'OK',
          json: () => Promise.resolve(res.data)
        });
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'));
      }
    });
  });
}

/**
 * 统一的 Supabase HTTP 请求封装
 */
class SupabaseClient {
  constructor(config) {
    this.url = config.url;
    this.serviceKey = config.serviceKey;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.serviceKey}`,
      'apikey': this.serviceKey
    };
  }

  async request(method, endpoint, data = null) {
    // 参数验证
    if (!this.url || !this.serviceKey) {
      return {
        success: false,
        error: 'Supabase 配置无效',
        code: 'CONFIG_ERROR'
      };
    }

    const requestOptions = {
      method: method.toUpperCase(),
      headers: this.headers
    };

    if (data && ['POST', 'PATCH', 'PUT'].includes(method.toUpperCase())) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await makeRequest(`${this.url}/rest/v1/${endpoint}`, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          code: 'HTTP_ERROR',
          status: response.status
        };
      }

      const result = await response.json();
      return { 
        success: true, 
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Supabase 请求失败:', error);
      return { 
        success: false, 
        error: error.message || '请求失败',
        code: 'REQUEST_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // 查询数据
  async select(table, options = {}) {
    let endpoint = table;
    const params = new URLSearchParams();

    // 添加查询条件
    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.append(key, `in.(${value.join(',')})`);
        } else {
          params.append(key, `eq.${value}`);
        }
      });
    }

    // 添加字段选择
    if (options.select) {
      params.append('select', options.select);
    }

    // 添加排序
    if (options.order) {
      params.append('order', options.order);
    }

    // 添加分页
    if (options.limit) {
      params.append('limit', options.limit);
    }
    if (options.offset) {
      params.append('offset', options.offset);
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await this.request('GET', endpoint);
  }

  // 插入数据
  async insert(table, data) {
    return await this.request('POST', table, data);
  }

  // 更新数据
  async update(table, where, data) {
    let endpoint = table;
    const params = new URLSearchParams();
    
    Object.entries(where).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await this.request('PATCH', endpoint, data);
  }

  // 删除数据
  async delete(table, where) {
    let endpoint = table;
    const params = new URLSearchParams();
    
    Object.entries(where).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return await this.request('DELETE', endpoint);
  }
}

/**
 * 业务逻辑处理类
 */
class BusinessLogic {
  constructor(supabase, context) {
    this.supabase = supabase;
    this.userOpenId = context.OPENID;
    
    // 验证必要参数
    if (!this.userOpenId) {
      console.warn('警告: 缺少用户 OpenID');
    }
  }

  // ================================
  // 用户相关操作
  // ================================

  async createUser(userData) {
    try {
      // 参数验证
      if (!userData || typeof userData !== 'object') {
        return { success: false, error: '用户数据无效', code: 'INVALID_DATA' };
      }

      if (!this.userOpenId) {
        return { success: false, error: '用户未登录', code: 'NOT_LOGGED_IN' };
      }

      // 检查用户是否已存在
      const existingUser = await this.supabase.select('users', {
        where: { openid: this.userOpenId }
      });

      if (!existingUser.success) {
        return { success: false, error: '查询用户失败: ' + existingUser.error, code: 'QUERY_FAILED' };
      }

      if (existingUser.data && existingUser.data.length > 0) {
        return { 
          success: true, 
          data: existingUser.data[0], 
          message: '用户已存在',
          code: 'USER_EXISTS'
        };
      }

      // 创建新用户
      const newUser = {
        openid: this.userOpenId,
        nickname: userData.nickname || '新用户',
        avatar_url: userData.avatar_url || '',
        bio: userData.bio || '',
        level: 1,
        experience_points: 0,
        total_study_days: 0,
        continuous_study_days: 0,
        total_study_minutes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await this.supabase.insert('users', newUser);
      
      if (result.success && result.data && result.data.length > 0) {
        // 尝试创建用户偏好设置（失败不影响用户创建）
        try {
          await this.supabase.insert('user_preferences', {
            user_id: result.data[0].id,
            notification_enabled: true,
            privacy_level: 'public',
            created_at: new Date().toISOString()
          });
        } catch (prefError) {
          console.warn('创建用户偏好失败:', prefError);
        }
      }

      return result;
    } catch (error) {
      console.error('创建用户失败:', error);
      return { 
        success: false, 
        error: error.message || '创建用户失败',
        code: 'CREATE_USER_ERROR'
      };
    }
  }

  async getUserProfile() {
    return await this.supabase.select('users', {
      where: { openid: this.userOpenId },
      select: 'id,nickname,avatar_url,bio,level,experience_points,total_study_days,continuous_study_days'
    });
  }

  async updateUserProfile(userData) {
    userData.updated_at = new Date().toISOString();
    return await this.supabase.update('users', 
      { openid: this.userOpenId }, 
      userData
    );
  }

  // ================================
  // 打卡相关操作
  // ================================

  async createCheckin(checkinData) {
    try {
      // 获取当前用户ID
      const userResult = await this.getUserProfile();
      if (!userResult.success || userResult.data.length === 0) {
        return { success: false, error: '用户不存在' };
      }

      const userId = userResult.data[0].id;
      const today = new Date().toISOString().split('T')[0];

      // 检查今日是否已打卡
      const existingCheckin = await this.supabase.select('checkin_records', {
        where: { 
          user_id: userId, 
          checkin_date: today,
          checkin_type: checkinData.checkin_type || 'daily'
        }
      });

      if (existingCheckin.success && existingCheckin.data.length > 0) {
        return { success: false, error: '今日已打卡' };
      }

      // 创建打卡记录
      const checkinRecord = {
        user_id: userId,
        title: checkinData.title,
        content: checkinData.content,
        study_minutes: checkinData.study_minutes || 0,
        checkin_type: checkinData.checkin_type || 'daily',
        mood: checkinData.mood,
        category: checkinData.category,
        tags: checkinData.tags || [],
        visibility: checkinData.visibility || 'public',
        checkin_date: today,
        created_at: new Date().toISOString()
      };

      const result = await this.supabase.insert('checkin_records', checkinRecord);

      if (result.success) {
        // 更新用户统计
        await this.updateUserStats(userId, checkinData.study_minutes || 0);
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCheckinRecords(options = {}) {
    const queryOptions = {
      select: `
        id, title, content, study_minutes, checkin_type, mood, 
        tags, like_count, comment_count, checkin_date, created_at,
        users!inner(id, nickname, avatar_url)
      `,
      order: 'created_at.desc',
      limit: options.limit || 20,
      offset: options.offset || 0
    };

    if (options.visibility) {
      queryOptions.where = { visibility: options.visibility };
    }

    return await this.supabase.select('checkin_records', queryOptions);
  }

  async likeCheckin(checkinId) {
    try {
      const userResult = await this.getUserProfile();
      if (!userResult.success) return userResult;
      
      const userId = userResult.data[0].id;

      // 检查是否已点赞
      const existingLike = await this.supabase.select('checkin_likes', {
        where: { checkin_id: checkinId, user_id: userId }
      });

      if (existingLike.success && existingLike.data.length > 0) {
        // 取消点赞
        return await this.supabase.delete('checkin_likes', {
          checkin_id: checkinId,
          user_id: userId
        });
      } else {
        // 添加点赞
        return await this.supabase.insert('checkin_likes', {
          checkin_id: checkinId,
          user_id: userId,
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ================================
  // 群组相关操作
  // ================================

  async createStudyGroup(groupData) {
    try {
      const userResult = await this.getUserProfile();
      if (!userResult.success) return userResult;
      
      const userId = userResult.data[0].id;

      // 生成邀请码
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const newGroup = {
        name: groupData.name,
        description: groupData.description,
        creator_id: userId,
        category: groupData.category,
        tags: groupData.tags || [],
        max_members: groupData.max_members || 20,
        is_public: groupData.is_public !== false,
        require_approval: groupData.require_approval || false,
        study_goal: groupData.study_goal,
        target_duration_days: groupData.target_duration_days || 30,
        difficulty_level: groupData.difficulty_level || 'beginner',
        invite_code: inviteCode,
        created_at: new Date().toISOString()
      };

      const result = await this.supabase.insert('study_groups', newGroup);

      if (result.success) {
        // 创建者自动加入群组
        await this.supabase.insert('group_members', {
          group_id: result.data[0].id,
          user_id: userId,
          role: 'creator',
          status: 'active',
          joined_at: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getStudyGroups(options = {}) {
    const queryOptions = {
      select: `
        id, name, description, category, tags, current_members, max_members,
        is_public, difficulty_level, study_goal, invite_code, created_at,
        users!creator_id(nickname, avatar_url)
      `,
      where: { status: 'active' },
      order: 'created_at.desc',
      limit: options.limit || 20,
      offset: options.offset || 0
    };

    if (options.category) {
      queryOptions.where.category = options.category;
    }

    if (options.is_public !== undefined) {
      queryOptions.where.is_public = options.is_public;
    }

    return await this.supabase.select('study_groups', queryOptions);
  }

  async joinStudyGroup(groupId, joinMessage = '') {
    try {
      const userResult = await this.getUserProfile();
      if (!userResult.success) return userResult;
      
      const userId = userResult.data[0].id;

      // 检查是否已是成员
      const existingMember = await this.supabase.select('group_members', {
        where: { group_id: groupId, user_id: userId }
      });

      if (existingMember.success && existingMember.data.length > 0) {
        return { success: false, error: '已是群组成员' };
      }

      // 检查群组是否存在和是否已满
      const groupResult = await this.supabase.select('study_groups', {
        where: { id: groupId, status: 'active' }
      });

      if (!groupResult.success || groupResult.data.length === 0) {
        return { success: false, error: '群组不存在或已关闭' };
      }

      const group = groupResult.data[0];
      if (group.current_members >= group.max_members) {
        return { success: false, error: '群组已满' };
      }

      // 加入群组
      return await this.supabase.insert('group_members', {
        group_id: groupId,
        user_id: userId,
        role: 'member',
        status: 'active',
        join_message: joinMessage,
        joined_at: new Date().toISOString()
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ================================
  // 辅助方法
  // ================================

  async updateUserStats(userId, studyMinutes) {
    try {
      // 更新学习统计
      const today = new Date().toISOString().split('T')[0];
      
      // 检查今日是否首次学习
      const todayCheckins = await this.supabase.select('checkin_records', {
        where: { user_id: userId, checkin_date: today }
      });

      const isFirstTodayCheckin = !todayCheckins.success || todayCheckins.data.length === 1;

      if (isFirstTodayCheckin) {
        // 增加学习天数
        await this.supabase.update('users', 
          { id: userId },
          { 
            total_study_days: 'total_study_days + 1',
            total_study_minutes: `total_study_minutes + ${studyMinutes}`,
            updated_at: new Date().toISOString()
          }
        );
      } else {
        // 只增加学习时长
        await this.supabase.update('users',
          { id: userId },
          {
            total_study_minutes: `total_study_minutes + ${studyMinutes}`,
            updated_at: new Date().toISOString()
          }
        );
      }
    } catch (error) {
      console.error('更新用户统计失败:', error);
    }
  }
}

/**
 * 云函数主入口
 */
exports.main = async (event, context) => {
  // 记录函数调用
  console.log('云函数被调用:', {
    action: event.action,
    openId: context.OPENID,
    timestamp: new Date().toISOString()
  });

  const { action, data = {} } = event;
  
  // 参数验证
  if (!action) {
    return {
      success: false,
      error: '缺少必要参数: action',
      code: 'MISSING_ACTION'
    };
  }

  try {
    // 配置验证
    if (!SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('your-project-id')) {
      return {
        success: false,
        error: 'Supabase 配置未设置，请检查环境变量',
        code: 'CONFIG_NOT_SET'
      };
    }

    // 初始化 Supabase 客户端
    const supabase = new SupabaseClient(SUPABASE_CONFIG);
    
    // 初始化业务逻辑处理器
    const business = new BusinessLogic(supabase, context);
    
    let result;
    
    // 路由分发
    switch (action) {
      // 健康检查（优先处理）
      case 'healthCheck':
        result = { 
          success: true, 
          message: 'Supabase 代理云函数运行正常',
          timestamp: new Date().toISOString(),
          config: {
            hasUrl: !!SUPABASE_CONFIG.url,
            hasKey: !!SUPABASE_CONFIG.serviceKey,
            openId: context.OPENID
          }
        };
        break;
      
      // 用户相关
      case 'createUser':
        result = await business.createUser(data);
        break;
      case 'getUserProfile':
        result = await business.getUserProfile();
        break;
      case 'updateUserProfile':
        result = await business.updateUserProfile(data);
        break;
      
      // 打卡相关
      case 'createCheckin':
        result = await business.createCheckin(data);
        break;
      case 'getCheckinRecords':
        result = await business.getCheckinRecords(data);
        break;
      case 'likeCheckin':
        result = await business.likeCheckin(data.checkin_id);
        break;
      
      // 群组相关
      case 'createStudyGroup':
        result = await business.createStudyGroup(data);
        break;
      case 'getStudyGroups':
        result = await business.getStudyGroups(data);
        break;
      case 'joinStudyGroup':
        result = await business.joinStudyGroup(data.group_id, data.join_message);
        break;
      
      default:
        result = { 
          success: false, 
          error: `未知的操作: ${action}`,
          code: 'UNKNOWN_ACTION',
          availableActions: [
            'createUser', 'getUserProfile', 'updateUserProfile',
            'createCheckin', 'getCheckinRecords', 'likeCheckin',
            'createStudyGroup', 'getStudyGroups', 'joinStudyGroup',
            'healthCheck'
          ]
        };
    }

    // 记录执行结果
    console.log('云函数执行结果:', {
      action,
      success: result.success,
      hasData: !!result.data,
      error: result.error
    });

    return result;
    
  } catch (error) {
    // 记录错误详情
    console.error('云函数执行失败:', {
      action,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: false,
      error: error.message || '服务器内部错误',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
  }
};
