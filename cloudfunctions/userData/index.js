// cloudfunctions/userData/index.js
// 专门处理用户数据的云函数
const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// Supabase 配置
const SUPABASE_CONFIG = {
  url: 'https://kmnfmgrtdlvxdcgdbpiq.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbmZtZ3J0ZGx2eGRjZ2RicGlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjAzOTQ0MzYxMX0.Ep_9wvQRcQEH5oe9m6FYq1-ysxGJUNXJCJRJ6r_8yOI'
};

exports.main = async (event, context) => {
  console.log('=== 用户数据云函数开始执行 ===');
  console.log('接收到的事件:', JSON.stringify(event, null, 2));
  
  try {
    const { action, data } = event;
    
    // 获取用户ID
    const userId = event.userInfo?.openId || context.WX_OPENID;
    
    if (!userId) {
      console.log('❌ 缺少用户身份信息');
      return {
        success: false,
        error: '缺少用户身份信息',
        code: 401
      };
    }
    
    console.log('✅ 用户ID:', userId);
    console.log('📋 执行操作:', action);
    
    // 初始化 Supabase 代理
    const supabaseClient = new SupabaseProxy(SUPABASE_CONFIG, userId);
    
    // 根据操作类型分发处理
    switch (action) {
      // 用户相关操作
      case 'getUserProfile':
        return await getUserProfile(supabaseClient, userId);
      case 'updateUserProfile':
        return await updateUserProfile(supabaseClient, userId, data);
      case 'createUser':
        return await createUser(supabaseClient, userId, data);
      case 'getUserPreferences':
        return await getUserPreferences(supabaseClient, userId);
      case 'updateUserPreferences':
        return await updateUserPreferences(supabaseClient, userId, data);
        
      // 打卡相关操作
      case 'getCheckinRecords':
        return await getCheckinRecords(supabaseClient, userId, data);
      case 'createCheckinRecord':
        return await createCheckinRecord(supabaseClient, userId, data);
      case 'getPublicCheckins':
        return await getPublicCheckins(supabaseClient, data);
      case 'likeCheckin':
        return await likeCheckin(supabaseClient, userId, data);
      case 'unlikeCheckin':
        return await unlikeCheckin(supabaseClient, userId, data);
        
      // 学习群组相关操作
      case 'getStudyGroups':
        return await getStudyGroups(supabaseClient, data);
      case 'createStudyGroup':
        return await createStudyGroup(supabaseClient, userId, data);
      case 'joinStudyGroup':
        return await joinStudyGroup(supabaseClient, userId, data);
      case 'leaveStudyGroup':
        return await leaveStudyGroup(supabaseClient, userId, data);
      case 'getGroupMembers':
        return await getGroupMembers(supabaseClient, data);
        
      // AI聊天相关操作
      case 'sendChatMessage':
        return await sendChatMessage(supabaseClient, userId, data);
      case 'getChatHistory':
        return await getChatHistory(supabaseClient, userId, data);
        
      // 匹配相关操作
      case 'createMatchRequest':
        return await createMatchRequest(supabaseClient, userId, data);
      case 'getMatchRequests':
        return await getMatchRequests(supabaseClient, userId);
      case 'updateUserInterests':
        return await updateUserInterests(supabaseClient, userId, data);
        
      default:
        console.log('❌ 不支持的操作:', action);
        return {
          success: false,
          error: '不支持的操作',
          code: 400
        };
    }
    
  } catch (error) {
    console.error('💥 云函数执行异常:', error);
    
    return {
      success: false,
      error: '服务器内部错误',
      details: error.message,
      code: 500
    };
  }
};

// Supabase 代理类 - 使用云函数的 HTTP API
class SupabaseProxy {
  constructor(config, currentUserOpenId = null) {
    this.url = config.url;
    this.serviceKey = config.serviceKey;
    this.currentUserOpenId = currentUserOpenId;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.serviceKey}`,
      'apikey': this.serviceKey
    };
  }
  
  async request(method, endpoint, data = null, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    
    console.log(`🔗 发送 ${method} 请求到:`, url);
    
    const requestOptions = {
      url,
      method,
      headers: { 
        ...this.headers,
        ...options.headers 
      }
    };
    
    // 设置当前用户上下文用于 RLS
    if (this.currentUserOpenId) {
      requestOptions.headers['app.current_user_openid'] = this.currentUserOpenId;
    }
    
    if (data) {
      requestOptions.data = JSON.stringify(data);
    }
    
    const response = await cloud.httpApi.invoke(requestOptions);
    
    console.log('📡 响应状态:', response.status);
    
    if (response.status >= 400) {
      console.error('❌ API 错误:', response.data);
      throw new Error(`Supabase API 错误: ${response.status} - ${JSON.stringify(response.data)}`);
    }
    
    return response.data;
  }
  
  // 查询单条记录
  async selectOne(table, filters = {}, options = {}) {
    let endpoint = table;
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
    
    if (options.select) {
      params.append('select', options.select);
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const data = await this.request('GET', endpoint);
    return data && data.length > 0 ? data[0] : null;
  }
  
  // 查询多条记录
  async select(table, filters = {}, options = {}) {
    let endpoint = table;
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.append(key, `in.(${value.join(',')})`);
      } else {
        params.append(key, `eq.${value}`);
      }
    });
    
    if (options.select) {
      params.append('select', options.select);
    }
    
    if (options.limit) {
      params.append('limit', options.limit);
    }
    
    if (options.offset) {
      params.append('offset', options.offset);
    }
    
    if (options.order) {
      params.append('order', options.order);
    }
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.request('GET', endpoint);
  }
  
  // 插入记录
  async insert(table, data) {
    return await this.request('POST', table, data, {
      headers: {
        'Prefer': 'return=representation'
      }
    });
  }
  
  // 更新记录
  async update(table, filters, data) {
    let endpoint = table;
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.request('PATCH', endpoint, data, {
      headers: {
        'Prefer': 'return=representation'
      }
    });
  }
  
  // 删除记录
  async delete(table, filters) {
    let endpoint = table;
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.request('DELETE', endpoint);
  }
}

// =============================================
// 用户相关业务逻辑
// =============================================

// 获取用户信息
async function getUserProfile(supabase, userId) {
  console.log('📋 获取用户信息:', userId);
  
  const user = await supabase.selectOne('users', { openid: userId });
  
  return {
    success: true,
    data: user
  };
}

// 更新用户信息
async function updateUserProfile(supabase, userId, userData) {
  console.log('📋 更新用户信息:', userId, userData);
  
  const updatedUser = await supabase.update('users', { openid: userId }, {
    ...userData,
    updated_at: new Date().toISOString()
  });
  
  return {
    success: true,
    data: updatedUser
  };
}

// 创建用户
async function createUser(supabase, userId, userData) {
  console.log('📋 创建用户:', userId, userData);
  
  const newUser = {
    openid: userId,
    nickname: userData.nickname || '新用户',
    avatar_url: userData.avatar_url,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const createdUser = await supabase.insert('users', newUser);
  
  // 同时创建用户偏好设置
  const userInDb = Array.isArray(createdUser) ? createdUser[0] : createdUser;
  if (userInDb && userInDb.id) {
    try {
      await supabase.insert('user_preferences', {
        user_id: userInDb.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('创建用户偏好设置失败:', error);
    }
  }
  
  return {
    success: true,
    data: userInDb
  };
}

// 获取用户偏好设置
async function getUserPreferences(supabase, userId) {
  console.log('📋 获取用户偏好设置:', userId);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const preferences = await supabase.selectOne('user_preferences', { user_id: user.id });
  
  return {
    success: true,
    data: preferences
  };
}

// 更新用户偏好设置
async function updateUserPreferences(supabase, userId, preferencesData) {
  console.log('📋 更新用户偏好设置:', userId, preferencesData);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const updatedPreferences = await supabase.update('user_preferences', 
    { user_id: user.id }, 
    {
      ...preferencesData,
      updated_at: new Date().toISOString()
    }
  );
  
  return {
    success: true,
    data: updatedPreferences
  };
}

// =============================================
// 打卡相关业务逻辑
// =============================================

// 获取打卡记录
async function getCheckinRecords(supabase, userId, options = {}) {
  console.log('📋 获取打卡记录:', userId);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const records = await supabase.select('checkin_records', 
    { user_id: user.id }, 
    { 
      limit: options.limit || 30,
      order: 'checkin_date.desc,created_at.desc'
    }
  );
  
  return {
    success: true,
    data: records || []
  };
}

// 创建打卡记录
async function createCheckinRecord(supabase, userId, data) {
  console.log('📋 创建打卡记录:', userId, data);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const checkinDate = data.date || new Date().toISOString().split('T')[0];
  
  const checkinRecord = {
    user_id: user.id,
    content: data.content,
    mood: data.mood || 'neutral',
    study_duration: data.study_duration || 0,
    images: data.images || [],
    tags: data.tags || [],
    is_public: data.is_public !== false, // 默认公开
    checkin_date: checkinDate,
    created_at: new Date().toISOString()
  };
  
  try {
    const createdRecord = await supabase.insert('checkin_records', checkinRecord);
    
    return {
      success: true,
      data: Array.isArray(createdRecord) ? createdRecord[0] : createdRecord
    };
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return {
        success: false,
        error: '今日已打卡',
        code: 409
      };
    }
    throw error;
  }
}

// 获取公开的打卡记录
async function getPublicCheckins(supabase, options = {}) {
  console.log('📋 获取公开打卡记录');
  
  const records = await supabase.select('checkin_records', 
    { is_public: true }, 
    { 
      limit: options.limit || 20,
      order: 'created_at.desc',
      select: '*,users(nickname,avatar_url)' // 关联用户信息
    }
  );
  
  return {
    success: true,
    data: records || []
  };
}

// 点赞打卡
async function likeCheckin(supabase, userId, data) {
  console.log('📋 点赞打卡:', userId, data);
  
  const { checkin_id } = data;
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  try {
    const like = await supabase.insert('checkin_likes', {
      checkin_id,
      user_id: user.id,
      created_at: new Date().toISOString()
    });
    
    return {
      success: true,
      data: like
    };
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return {
        success: false,
        error: '已经点过赞了',
        code: 409
      };
    }
    throw error;
  }
}

// 取消点赞
async function unlikeCheckin(supabase, userId, data) {
  console.log('📋 取消点赞:', userId, data);
  
  const { checkin_id } = data;
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  await supabase.delete('checkin_likes', {
    checkin_id,
    user_id: user.id
  });
  
  return {
    success: true,
    message: '取消点赞成功'
  };
}

// =============================================
// 学习群组相关业务逻辑
// =============================================

// 获取学习群组
async function getStudyGroups(supabase, options = {}) {
  console.log('📋 获取学习群组');
  
  const filters = {};
  if (options.category) {
    filters.category = options.category;
  }
  if (options.is_public !== undefined) {
    filters.is_public = options.is_public;
  }
  
  const groups = await supabase.select('study_groups', filters, {
    limit: options.limit || 20,
    order: 'created_at.desc',
    select: '*,users(nickname,avatar_url)' // 关联创建者信息
  });
  
  return {
    success: true,
    data: groups || []
  };
}

// 创建学习群组
async function createStudyGroup(supabase, userId, data) {
  console.log('📋 创建学习群组:', userId, data);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const groupData = {
    name: data.name,
    description: data.description,
    creator_id: user.id,
    category: data.category,
    max_members: data.max_members || 10,
    is_public: data.is_public !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const createdGroup = await supabase.insert('study_groups', groupData);
    const group = Array.isArray(createdGroup) ? createdGroup[0] : createdGroup;
    
    // 自动加入创建者为群组成员
    if (group && group.id) {
      await supabase.insert('group_members', {
        group_id: group.id,
        user_id: user.id,
        role: 'creator',
        joined_at: new Date().toISOString()
      });
    }
    
    return {
      success: true,
      data: group
    };
  } catch (error) {
    throw error;
  }
}

// 加入学习群组
async function joinStudyGroup(supabase, userId, data) {
  console.log('📋 加入学习群组:', userId, data);
  
  const { group_id } = data;
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  // 检查群组是否存在
  const group = await supabase.selectOne('study_groups', { id: group_id });
  if (!group) {
    return { success: false, error: '群组不存在', code: 404 };
  }
  
  // 检查群组是否已满
  if (group.current_members >= group.max_members) {
    return { success: false, error: '群组已满', code: 409 };
  }
  
  try {
    const membership = await supabase.insert('group_members', {
      group_id,
      user_id: user.id,
      role: 'member',
      joined_at: new Date().toISOString()
    });
    
    return {
      success: true,
      data: membership
    };
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return {
        success: false,
        error: '已经是群组成员',
        code: 409
      };
    }
    throw error;
  }
}

// 离开学习群组
async function leaveStudyGroup(supabase, userId, data) {
  console.log('📋 离开学习群组:', userId, data);
  
  const { group_id } = data;
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  await supabase.update('group_members', 
    { group_id, user_id: user.id }, 
    { status: 'left' }
  );
  
  return {
    success: true,
    message: '离开群组成功'
  };
}

// 获取群组成员
async function getGroupMembers(supabase, data) {
  console.log('📋 获取群组成员:', data);
  
  const { group_id } = data;
  
  const members = await supabase.select('group_members', 
    { group_id, status: 'active' }, 
    { 
      select: '*,users(nickname,avatar_url)',
      order: 'joined_at.asc'
    }
  );
  
  return {
    success: true,
    data: members || []
  };
}

// =============================================
// AI聊天相关业务逻辑
// =============================================

// 发送聊天消息
async function sendChatMessage(supabase, userId, data) {
  console.log('📋 发送聊天消息:', userId, data);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const { message, chat_type = 'general' } = data;
  
  // 这里可以调用实际的AI服务，暂时模拟响应
  const aiResponse = generateMockAIResponse(message, chat_type);
  
  const chatMessage = await supabase.insert('chat_messages', {
    user_id: user.id,
    user_message: message,
    ai_response: aiResponse,
    chat_type,
    created_at: new Date().toISOString()
  });
  
  return {
    success: true,
    data: Array.isArray(chatMessage) ? chatMessage[0] : chatMessage
  };
}

// 获取聊天历史
async function getChatHistory(supabase, userId, options = {}) {
  console.log('📋 获取聊天历史:', userId);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const messages = await supabase.select('chat_messages', 
    { user_id: user.id }, 
    { 
      limit: options.limit || 20,
      order: 'created_at.desc'
    }
  );
  
  return {
    success: true,
    data: messages || []
  };
}

// =============================================
// 匹配相关业务逻辑
// =============================================

// 创建匹配请求
async function createMatchRequest(supabase, userId, data) {
  console.log('📋 创建匹配请求:', userId, data);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const matchRequest = await supabase.insert('match_requests', {
    user_id: user.id,
    interests: data.interests,
    study_goals: data.study_goals,
    preferred_group_size: data.preferred_group_size || 5,
    created_at: new Date().toISOString()
  });
  
  return {
    success: true,
    data: Array.isArray(matchRequest) ? matchRequest[0] : matchRequest
  };
}

// 获取匹配请求
async function getMatchRequests(supabase, userId) {
  console.log('📋 获取匹配请求:', userId);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const requests = await supabase.select('match_requests', 
    { user_id: user.id }, 
    { 
      order: 'created_at.desc'
    }
  );
  
  return {
    success: true,
    data: requests || []
  };
}

// 更新用户兴趣
async function updateUserInterests(supabase, userId, data) {
  console.log('📋 更新用户兴趣:', userId, data);
  
  const user = await supabase.selectOne('users', { openid: userId });
  if (!user) {
    return { success: false, error: '用户不存在', code: 404 };
  }
  
  const { interests } = data;
  
  // 先删除现有兴趣
  await supabase.delete('user_interests', { user_id: user.id });
  
  // 插入新兴趣
  const interestRecords = interests.map(interest => ({
    user_id: user.id,
    interest_name: interest.name,
    level: interest.level || 'beginner',
    created_at: new Date().toISOString()
  }));
  
  const createdInterests = await supabase.insert('user_interests', interestRecords);
  
  return {
    success: true,
    data: createdInterests
  };
}

// =============================================
// 工具函数
// =============================================

// 模拟AI响应（实际项目中应该调用真实的AI服务）
function generateMockAIResponse(message, chatType) {
  const responses = {
    general: [
      '我理解你的问题，让我为你提供一些建议。',
      '这是一个很好的问题，我来帮你分析一下。',
      '根据你的描述，我认为你可以尝试以下方法。'
    ],
    study_help: [
      '学习确实需要坚持和方法，我建议你制定一个具体的学习计划。',
      '遇到学习困难是正常的，重要的是找到适合自己的学习方式。',
      '你可以尝试番茄工作法，每25分钟为一个学习单元。'
    ],
    motivation: [
      '坚持下去！每一天的努力都会积累成巨大的进步。',
      '相信自己的能力，你已经走在正确的道路上了。',
      '学习的过程虽然困难，但收获的知识将是你最宝贵的财富。'
    ]
  };
  
  const typeResponses = responses[chatType] || responses.general;
  const randomIndex = Math.floor(Math.random() * typeResponses.length);
  
  return typeResponses[randomIndex];
}

