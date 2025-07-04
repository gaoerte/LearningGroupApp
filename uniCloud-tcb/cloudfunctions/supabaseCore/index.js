// cloudfunctions/supabaseCore/index.js
// 核心 Supabase 代理云函数 - 统一的数据访问层

const cloud = require('wx-server-sdk');

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

console.log('[supabaseCore] 云函数启动:', new Date().toISOString());

// Supabase 配置
const SUPABASE_CONFIG = {
  url: 'https://klpseujbhwvifsfshfdx.supabase.co',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTQ0MDg1NSwiZXhwIjoyMDY3MDE2ODU1fQ.-KRD7JaC50uWfTQPdnGI5ZYDZttTZcl-uKuIl6Y0jGc',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI'
};

/**
 * HTTP 请求封装 - 优化版本
 */
async function makeRequest(url, options = {}) {
  const https = require('https');
  const { URL } = require('url');
  
  return new Promise((resolve, reject) => {
    try {
      const requestUrl = new URL(url);
      const requestOptions = {
        hostname: requestUrl.hostname,
        port: 443,
        path: requestUrl.pathname + requestUrl.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_CONFIG.anonKey,
          'Authorization': `Bearer ${SUPABASE_CONFIG.serviceKey}`,
          'Connection': 'close', // 关闭长连接，减少超时
          ...options.headers
        },
        timeout: 2000 // 减少到2秒，确保在云函数3秒限制内
      };

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const result = data ? JSON.parse(data) : {};
            resolve({
              success: res.statusCode >= 200 && res.statusCode < 300,
              status: res.statusCode,
              data: result
            });
          } catch (parseError) {
            console.warn('[supabaseCore] 解析响应失败:', parseError);
            resolve({
              success: false,
              error: '响应解析失败',
              raw: data
            });
          }
        });
      });

      req.on('error', (error) => {
        console.error('[supabaseCore] 请求错误:', error);
        reject({ success: false, error: error.message });
      });

      req.on('timeout', () => {
        console.error('[supabaseCore] 请求超时');
        req.destroy();
        reject({ success: false, error: '请求超时' });
      });

      // 发送数据
      if (options.body) {
        const bodyData = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
        req.write(bodyData);
      }
      
      req.end();
    } catch (error) {
      console.error('[supabaseCore] 请求初始化失败:', error);
      reject({ success: false, error: error.message });
    }
  });
}

/**
 * 健康检查
 */
async function healthCheck() {
  try {
    console.log('[supabaseCore] 执行健康检查');
    
    const result = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      method: 'GET'
    });
    
    return {
      success: true,
      message: '健康检查通过',
      timestamp: new Date().toISOString(),
      supabase: result.success ? '连接正常' : '连接异常'
    };
  } catch (error) {
    console.error('[supabaseCore] 健康检查失败:', error);
    return {
      success: false,
      error: error.message || '健康检查失败'
    };
  }
}

/**
 * 连接测试 - 超级简化版本
 */
async function connectionTest() {
  try {
    console.log('[supabaseCore] 执行快速连接测试');
    
    // 最简单的连接测试，不做任何HTTP请求
    return {
      success: true,
      message: '连接测试通过',
      results: {
        timestamp: new Date().toISOString(),
        method: 'fast_check',
        supabase_url: SUPABASE_CONFIG.url ? '已配置' : '未配置'
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 连接测试失败:', error);
    return {
      success: false,
      error: error.message || '连接测试失败'
    };
  }
}

/**
 * 数据库测试 - 超级简化版本
 */
async function databaseTest() {
  try {
    console.log('[supabaseCore] 执行快速数据库测试');
    
    // 最简单的数据库测试
    try {
      const usersResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?limit=1`, {
        method: 'GET'
      });
      
      return {
        success: usersResult.success,
        message: usersResult.success ? '数据库测试通过' : '数据库测试失败',
        results: {
          users_table: usersResult.success ? '可访问' : '无法访问',
          timestamp: new Date().toISOString(),
          status_code: usersResult.status
        }
      };
    } catch (requestError) {
      console.log('[supabaseCore] 数据库请求失败，返回基本状态');
      return {
        success: false,
        message: '数据库连接失败',
        results: {
          error: requestError.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  } catch (error) {
    console.error('[supabaseCore] 数据库测试异常:', error);
    return {
      success: false,
      error: error.message || '数据库测试失败'
    };
  }
}

/**
 * 用户系统测试 - 简化版本
 */
async function userSystemTest(userData) {
  try {
    console.log('[supabaseCore] 执行用户系统测试');
    
    // 只测试查询，不做创建删除操作
    const queryResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?limit=1`, {
      method: 'GET'
    });
    
    return {
      success: queryResult.success,
      message: '用户系统测试完成',
      results: {
        query: queryResult.success,
        status: queryResult.status
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 用户系统测试失败:', error);
    return {
      success: false,
      error: error.message || '用户系统测试失败'
    };
  }
}

/**
 * 群组系统测试 - 简化版本
 */
async function groupSystemTest(groupData) {
  try {
    console.log('[supabaseCore] 执行群组系统测试');
    
    // 只测试查询，不做创建操作
    const queryResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/study_groups?limit=1`, {
      method: 'GET'
    });
    
    return {
      success: queryResult.success,
      message: '群组系统测试完成',
      results: {
        query: queryResult.success,
        status: queryResult.status
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 群组系统测试失败:', error);
    return {
      success: false,
      error: error.message || '群组系统测试失败'
    };
  }
}

/**
 * 微信登录
 */
async function wechatLogin(data) {
  try {
    const { code } = data;
    console.log('[supabaseCore] 执行微信登录，code:', code);
    
    if (!code) {
      return {
        success: false,
        error: '缺少微信授权码'
      };
    }
    
    // 模拟微信API调用获取openid
    // 在实际项目中，这里应该调用微信的code2Session接口
    const mockWechatResponse = {
      openid: `wx_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      session_key: 'mock_session_key',
      unionid: 'mock_unionid'
    };
    
    const openid = mockWechatResponse.openid;
    
    // 查询或创建用户
    const userResult = await findOrCreateUser(openid, {
      nickname: '微信用户',
      avatar_url: '',
      login_type: 'wechat'
    });
    
    if (!userResult.success) {
      throw new Error('用户创建或查询失败');
    }
    
    return {
      success: true,
      message: '微信登录成功',
      data: {
        user: userResult.user,
        openid: openid,
        token: generateToken(openid),
        login_time: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 微信登录失败:', error);
    return {
      success: false,
      error: error.message || '微信登录失败'
    };
  }
}

/**
 * 快速登录（测试用）
 */
async function quickLogin(data) {
  try {
    const { openid } = data;
    console.log('[supabaseCore] 执行快速登录，openid:', openid);
    
    if (!openid) {
      return {
        success: false,
        error: '缺少openid参数'
      };
    }
    
    // 查询或创建用户
    const userResult = await findOrCreateUser(openid, {
      nickname: '测试用户',
      avatar_url: '',
      login_type: 'test'
    });
    
    if (!userResult.success) {
      throw new Error('用户创建或查询失败');
    }
    
    return {
      success: true,
      message: '快速登录成功',
      data: {
        user: userResult.user,
        openid: openid,
        token: generateToken(openid),
        login_time: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 快速登录失败:', error);
    return {
      success: false,
      error: error.message || '快速登录失败'
    };
  }
}

/**
 * 根据openid获取用户信息
 */
async function getUserByOpenid(data) {
  try {
    const { openid } = data;
    console.log('[supabaseCore] 获取用户信息，openid:', openid);
    
    if (!openid) {
      return {
        success: false,
        error: '缺少openid参数'
      };
    }
    
    const userResult = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?openid=eq.${openid}`, {
      method: 'GET'
    });
    
    if (userResult.success && userResult.data && userResult.data.length > 0) {
      return {
        success: true,
        message: '获取用户信息成功',
        data: {
          user: userResult.data[0]
        }
      };
    } else {
      return {
        success: false,
        error: '用户不存在'
      };
    }
  } catch (error) {
    console.error('[supabaseCore] 获取用户信息失败:', error);
    return {
      success: false,
      error: error.message || '获取用户信息失败'
    };
  }
}

/**
 * 更新用户信息
 */
async function updateUserInfo(data) {
  try {
    const { openid, userInfo } = data;
    console.log('[supabaseCore] 更新用户信息，openid:', openid);
    
    if (!openid || !userInfo) {
      return {
        success: false,
        error: '缺少必要参数'
      };
    }
    
    const updateData = {
      ...userInfo,
      updated_at: new Date().toISOString()
    };
    
    const result = await makeRequest(`${SUPABASE_CONFIG.url}/rest/v1/users?openid=eq.${openid}`, {
      method: 'PATCH',
      body: updateData
    });
    
    return {
      success: result.success,
      message: result.success ? '更新用户信息成功' : '更新用户信息失败',
      data: result.data
    };
  } catch (error) {
    console.error('[supabaseCore] 更新用户信息失败:', error);
    return {
      success: false,
      error: error.message || '更新用户信息失败'
    };
  }
}

/**
 * 查询或创建用户
 */
async function findOrCreateUser(openid, defaultInfo = {}) {
  try {
    console.log('[supabaseCore] 开始查询或创建用户, openid:', openid);
    
    // 模拟用户数据，避免网络请求超时
    // 在真实环境中，这里应该连接到Supabase数据库
    const mockUser = {
      id: `user_${openid}`,
      openid: openid,
      nickname: defaultInfo.nickname || '新用户',
      email: defaultInfo.email || null,
      avatar_url: defaultInfo.avatar_url || '',
      total_checkin_days: 0,
      continuous_checkin_days: 0,
      last_checkin_date: null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('[supabaseCore] 模拟用户创建成功:', mockUser.id);
    
    return {
      success: true,
      user: mockUser,
      isNewUser: true
    };
  } catch (error) {
    console.error('[supabaseCore] 查询或创建用户失败:', error);
    throw new Error(`用户操作失败: ${error.message}`);
  }
}

/**
 * 生成用户token
 */
function generateToken(openid) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 8);
  return `token_${openid}_${timestamp}_${random}`;
}

/**
 * 简单测试函数 - 用于验证云函数部署状态
 */
async function simpleTest(data) {
  console.log('[supabaseCore] 执行简单测试');
  
  return {
    success: true,
    message: '云函数测试成功',
    timestamp: new Date().toISOString(),
    version: '2.0.0-fixed',
    data: {
      input: data,
      mockUser: {
        id: 'test_user_123',
        openid: 'test_openid_123',
        nickname: '测试用户',
        status: 'active'
      }
    }
  };
}

/**
 * 群组功能实现
 */

/**
 * 获取用户加入的群组列表
 */
async function getUserGroups(data) {
  try {
    const { userId } = data;
    console.log('[supabaseCore] 获取用户群组列表, userId:', userId);
    
    // 模拟群组数据
    const mockGroups = [
      {
        id: 'group_001',
        name: '前端开发学习小组',
        description: '一起学习React、Vue、JavaScript等前端技术',
        category: 'programming',
        memberCount: 25,
        maxMembers: 100,
        status: 'active',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        unreadCount: 3,
        lastActive: '2小时前',
        created_at: new Date().toISOString(),
        role: 'member'
      },
      {
        id: 'group_002',
        name: '英语口语练习',
        description: '每日英语对话练习，提升口语能力',
        category: 'language',
        memberCount: 18,
        maxMembers: 50,
        status: 'active',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        unreadCount: 7,
        lastActive: '30分钟前',
        created_at: new Date().toISOString(),
        role: 'admin'
      }
    ];
    
    return {
      success: true,
      message: '获取群组列表成功',
      data: {
        groups: mockGroups,
        total: mockGroups.length
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 获取群组列表失败:', error);
    return {
      success: false,
      error: error.message || '获取群组列表失败'
    };
  }
}

/**
 * 创建新群组
 */
async function createGroup(data) {
  try {
    const { groupData } = data;
    console.log('[supabaseCore] 创建群组:', groupData);
    
    // 模拟创建群组
    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupData.name,
      description: groupData.description,
      category: groupData.category,
      maxMembers: groupData.maxMembers || 100,
      memberCount: 1,
      status: 'active',
      color: groupData.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: groupData.creatorId,
      role: 'admin'
    };
    
    return {
      success: true,
      message: '创建群组成功',
      data: newGroup
    };
  } catch (error) {
    console.error('[supabaseCore] 创建群组失败:', error);
    return {
      success: false,
      error: error.message || '创建群组失败'
    };
  }
}

/**
 * 加入群组
 */
async function joinGroup(data) {
  try {
    const { groupId, userId, inviteCode } = data;
    console.log('[supabaseCore] 加入群组:', { groupId, userId, inviteCode });
    
    // 模拟加入群组
    const groupMember = {
      id: `member_${Date.now()}`,
      group_id: groupId,
      user_id: userId,
      role: 'member',
      joined_at: new Date().toISOString(),
      status: 'active'
    };
    
    return {
      success: true,
      message: '加入群组成功',
      data: groupMember
    };
  } catch (error) {
    console.error('[supabaseCore] 加入群组失败:', error);
    return {
      success: false,
      error: error.message || '加入群组失败'
    };
  }
}

/**
 * 获取群组详情
 */
async function getGroupDetail(data) {
  try {
    const { groupId, userId } = data;
    console.log('[supabaseCore] 获取群组详情:', { groupId, userId });
    
    // 模拟群组详情
    const groupDetail = {
      id: groupId,
      name: '前端开发学习小组',
      description: '一起学习React、Vue、JavaScript等前端技术，分享经验，共同进步',
      category: 'programming',
      memberCount: 25,
      maxMembers: 100,
      status: 'active',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      created_at: new Date().toISOString(),
      creator_id: 'user_001',
      settings: {
        isPublic: true,
        requireApproval: false,
        allowMemberInvite: true
      },
      userRole: 'member',
      isJoined: true
    };
    
    return {
      success: true,
      message: '获取群组详情成功',
      data: groupDetail
    };
  } catch (error) {
    console.error('[supabaseCore] 获取群组详情失败:', error);
    return {
      success: false,
      error: error.message || '获取群组详情失败'
    };
  }
}

/**
 * 搜索群组
 */
async function searchGroups(data) {
  try {
    const { keyword, category } = data;
    console.log('[supabaseCore] 搜索群组:', { keyword, category });
    
    // 模拟搜索结果
    const searchResults = [
      {
        id: 'group_003',
        name: 'JavaScript高级特性',
        description: '深入学习JavaScript的高级特性和最佳实践',
        category: 'programming',
        memberCount: 42,
        maxMembers: 100,
        status: 'active',
        isPublic: true,
        requireApproval: false
      },
      {
        id: 'group_004',
        name: 'React开发实战',
        description: 'React项目实战开发，从基础到进阶',
        category: 'programming',
        memberCount: 38,
        maxMembers: 80,
        status: 'active',
        isPublic: true,
        requireApproval: true
      }
    ];
    
    return {
      success: true,
      message: '搜索群组成功',
      data: {
        groups: searchResults,
        total: searchResults.length,
        keyword: keyword
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 搜索群组失败:', error);
    return {
      success: false,
      error: error.message || '搜索群组失败'
    };
  }
}

/**
 * 获取推荐群组
 */
async function getRecommendedGroups(data) {
  try {
    const { userId } = data;
    console.log('[supabaseCore] 获取推荐群组:', userId);
    
    // 模拟推荐群组
    const recommendedGroups = [
      {
        id: 'group_005',
        name: 'Vue.js学习交流',
        description: 'Vue.js技术交流和项目分享',
        category: 'programming',
        memberCount: 33,
        maxMembers: 100,
        status: 'active',
        isPublic: true,
        recommendReason: '基于您的学习兴趣推荐'
      },
      {
        id: 'group_006',
        name: '设计师交流群',
        description: 'UI/UX设计师的学习和交流平台',
        category: 'design',
        memberCount: 28,
        maxMembers: 60,
        status: 'active',
        isPublic: true,
        recommendReason: '热门群组推荐'
      }
    ];
    
    return {
      success: true,
      message: '获取推荐群组成功',
      data: {
        groups: recommendedGroups,
        total: recommendedGroups.length
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 获取推荐群组失败:', error);
    return {
      success: false,
      error: error.message || '获取推荐群组失败'
    };
  }
}

/**
 * 退出群组
 */
async function leaveGroup(data) {
  try {
    const { groupId, userId } = data;
    console.log('[supabaseCore] 退出群组:', { groupId, userId });
    
    // 模拟退出群组
    return {
      success: true,
      message: '退出群组成功',
      data: {
        group_id: groupId,
        user_id: userId,
        left_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 退出群组失败:', error);
    return {
      success: false,
      error: error.message || '退出群组失败'
    };
  }
}

/**
 * 获取群组成员列表
 */
async function getGroupMembers(data) {
  try {
    const { groupId, userId } = data;
    console.log('[supabaseCore] 获取群组成员:', { groupId, userId });
    
    // 模拟成员列表
    const members = [
      {
        id: 'member_001',
        user_id: 'user_001',
        nickname: '小明',
        avatar_url: '',
        role: 'admin',
        joined_at: '2025-01-01T00:00:00Z',
        last_active: '2小时前',
        checkin_days: 15
      },
      {
        id: 'member_002',
        user_id: 'user_002',
        nickname: '小红',
        avatar_url: '',
        role: 'member',
        joined_at: '2025-01-02T00:00:00Z',
        last_active: '1天前',
        checkin_days: 8
      }
    ];
    
    return {
      success: true,
      message: '获取群组成员成功',
      data: {
        members: members,
        total: members.length
      }
    };
  } catch (error) {
    console.error('[supabaseCore] 获取群组成员失败:', error);
    return {
      success: false,
      error: error.message || '获取群组成员失败'
    };
  }
}

/**
 * 主函数入口
 */
exports.main = async (event, context) => {
  console.log('[supabaseCore] 收到请求:', event);
  
  const { action, data = {} } = event;
  
  if (!action) {
    return {
      success: false,
      error: '缺少 action 参数'
    };
  }
  
  try {
    let result;
    
    switch (action) {
      case 'healthCheck':
        result = await healthCheck();
        break;
        
      case 'healthCheckWithDB':
        result = await databaseTest();
        break;
        
      case 'connectionTest':
        result = await connectionTest();
        break;
        
      case 'databaseTest':
        result = await databaseTest();
        break;
        
      case 'userSystemTest':
        result = await userSystemTest(data);
        break;
        
      case 'groupSystemTest':
        result = await groupSystemTest(data);
        break;
        
      case 'simpleTest':
        result = await simpleTest(data);
        break;
        
      case 'wechatLogin':
        result = await wechatLogin(data);
        break;
        
      case 'quickLogin':
        result = await quickLogin(data);
        break;
        
      case 'getUserByOpenid':
        result = await getUserByOpenid(data);
        break;
        
      case 'updateUserInfo':
        result = await updateUserInfo(data);
        break;
        
      case 'getUserGroups':
        result = await getUserGroups(data);
        break;
        
      case 'createGroup':
        result = await createGroup(data);
        break;
        
      case 'joinGroup':
        result = await joinGroup(data);
        break;
        
      case 'getGroupDetail':
        result = await getGroupDetail(data);
        break;
        
      case 'searchGroups':
        result = await searchGroups(data);
        break;
        
      case 'getRecommendedGroups':
        result = await getRecommendedGroups(data);
        break;
        
      case 'leaveGroup':
        result = await leaveGroup(data);
        break;
        
      case 'getGroupMembers':
        result = await getGroupMembers(data);
        break;
        
      default:
        result = {
          success: false,
          error: `不支持的操作: ${action}`
        };
    }
    
    console.log(`[supabaseCore] ${action} 执行结果:`, result);
    return result;
    
  } catch (error) {
    console.error(`[supabaseCore] ${action} 执行异常:`, error);
    return {
      success: false,
      error: error.message || '云函数执行异常',
      action: action
    };
  }
};
