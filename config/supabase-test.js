// config/supabase-test.js
// Supabase 专用测试配置

/**
 * Supabase 测试配置
 */
const SUPABASE_TEST_CONFIG = {
  // 测试环境配置 - 请替换为您的实际 Supabase 项目信息
  url: 'https://your-project-id.supabase.co',
  anonKey: 'your-anonymous-key',
  serviceKey: 'your-service-role-key', // 仅用于服务端测试
  
  // 测试数据库表名
  tables: {
    users: 'users',
    study_groups: 'study_groups',
    group_members: 'group_members',
    checkin_records: 'checkin_records',
    chat_messages: 'chat_messages',
    match_requests: 'match_requests'
  },
  
  // 测试用例配置
  testCases: {
    // 用户测试数据
    testUser: {
      openid: 'test_openid_' + Date.now(),
      nickname: '测试用户',
      avatar_url: 'https://via.placeholder.com/100',
      bio: '这是一个测试用户',
      level: 1
    },
    
    // 学习群组测试数据
    testGroup: {
      name: '测试学习群组',
      description: '这是一个用于测试的学习群组',
      category: 'programming',
      tags: ['JavaScript', 'Vue', 'uni-app'],
      max_members: 10,
      is_public: true,
      study_goal: '学习前端开发技术',
      target_duration_days: 30,
      difficulty_level: 'beginner'
    },
    
    // 打卡记录测试数据
    testCheckin: {
      content: '今天学习了 Vue.js 的基础知识，完成了组件开发练习。',
      checkin_date: new Date().toISOString().split('T')[0]
    },
    
    // AI 聊天测试数据
    testChat: {
      message: '你好，请介绍一下 Vue.js 的特点。',
      ai_response: 'Vue.js 是一个渐进式的 JavaScript 框架...'
    }
  },
  
  // 测试超时配置
  timeout: {
    connection: 5000,
    query: 10000,
    mutation: 15000
  }
};

/**
 * 获取 Supabase 测试配置
 */
function getSupabaseTestConfig() {
  return SUPABASE_TEST_CONFIG;
}

/**
 * 生成测试用的唯一标识符
 */
function generateTestId(prefix = 'test') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建测试用户数据
 */
function createTestUserData(overrides = {}) {
  return {
    ...SUPABASE_TEST_CONFIG.testCases.testUser,
    openid: generateTestId('user'),
    ...overrides
  };
}

/**
 * 创建测试群组数据
 */
function createTestGroupData(creatorId, overrides = {}) {
  return {
    ...SUPABASE_TEST_CONFIG.testCases.testGroup,
    creator_id: creatorId,
    name: `测试群组_${Date.now()}`,
    invite_code: generateTestId('invite').substr(0, 8).toUpperCase(),
    ...overrides
  };
}

/**
 * 创建测试打卡数据
 */
function createTestCheckinData(userId, overrides = {}) {
  return {
    ...SUPABASE_TEST_CONFIG.testCases.testCheckin,
    user_id: userId,
    ...overrides
  };
}

/**
 * 创建测试聊天数据
 */
function createTestChatData(userId, overrides = {}) {
  return {
    ...SUPABASE_TEST_CONFIG.testCases.testChat,
    user_id: userId,
    ...overrides
  };
}

/**
 * 清理测试数据的 SQL 语句
 */
const CLEANUP_SQL = {
  // 删除测试用户（会级联删除相关数据）
  deleteTestUsers: `
    DELETE FROM users 
    WHERE openid LIKE 'test_%' OR openid LIKE 'user_%'
  `,
  
  // 删除测试群组
  deleteTestGroups: `
    DELETE FROM study_groups 
    WHERE name LIKE '测试%' OR invite_code LIKE 'TEST%' OR invite_code LIKE 'INVITE%'
  `,
  
  // 删除测试打卡记录
  deleteTestCheckins: `
    DELETE FROM checkin_records 
    WHERE user_id IN (
      SELECT id FROM users WHERE openid LIKE 'test_%'
    )
  `,
  
  // 删除测试聊天记录
  deleteTestChats: `
    DELETE FROM chat_messages 
    WHERE user_id IN (
      SELECT id FROM users WHERE openid LIKE 'test_%'
    )
  `,
  
  // 删除测试匹配请求
  deleteTestMatches: `
    DELETE FROM match_requests 
    WHERE user_id IN (
      SELECT id FROM users WHERE openid LIKE 'test_%'
    )
  `
};

/**
 * 获取清理 SQL
 */
function getCleanupSQL() {
  return CLEANUP_SQL;
}

// 导出测试工具
export {
  getSupabaseTestConfig,
  generateTestId,
  createTestUserData,
  createTestGroupData,
  createTestCheckinData,
  createTestChatData,
  getCleanupSQL,
  SUPABASE_TEST_CONFIG
};

// 兼容 CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getSupabaseTestConfig,
    generateTestId,
    createTestUserData,
    createTestGroupData,
    createTestCheckinData,
    createTestChatData,
    getCleanupSQL,
    SUPABASE_TEST_CONFIG
  };
}
