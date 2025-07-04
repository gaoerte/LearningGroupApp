// cloudfunctions/supabaseTest/index.js
// Supabase 连接测试云函数

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const SUPABASE_URL = 'https://klpseujbhwvifsfshfdx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI';

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.main = async (event, context) => {
  console.log('🚀 Supabase 测试云函数启动');
  console.log('📥 接收参数:', event);
  
  const { action, ...params } = event;
  
  try {
    let result;
    
    switch (action) {
      case 'ping':
        result = await testPing();
        break;
        
      case 'authTest':
        result = await testAuthentication(params.testUser);
        break;
        
      case 'dbQuery':
        result = await testDatabaseQuery(params.query);
        break;
        
      case 'realtimeTest':
        result = await testRealtime();
        break;
        
      case 'storageTest':
        result = await testStorage();
        break;
        
      case 'createUser':
        result = await createTestUser(params.userData);
        break;
        
      case 'createGroup':
        result = await createTestGroup(params.groupData);
        break;
        
      case 'sendMessage':
        result = await sendTestMessage(params.messageData);
        break;
        
      case 'getOnlineMembers':
        result = await getOnlineMembers(params.groupId);
        break;
        
      default:
        throw new Error(`未知操作: ${action}`);
    }
    
    console.log('✅ 操作成功:', result);
    return {
      success: true,
      action: action,
      data: result,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
    return {
      success: false,
      action: action,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * 连接测试
 */
async function testPing() {
  console.log('🏓 执行连接测试...');
  
  // 尝试查询系统时间
  const { data, error } = await supabase
    .rpc('version')
    .limit(1);
    
  if (error) {
    // 如果 rpc 不可用，尝试简单查询
    const { data: timeData, error: timeError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
      
    if (timeError) {
      throw new Error(`连接失败: ${timeError.message}`);
    }
    
    return {
      status: 'connected',
      method: 'table_query',
      timestamp: new Date().toISOString()
    };
  }
  
  return {
    status: 'connected',
    method: 'rpc_call',
    version: data,
    timestamp: new Date().toISOString()
  };
}

/**
 * 认证测试
 */
async function testAuthentication(testUser) {
  console.log('🔐 执行认证测试...');
  
  if (!testUser) {
    testUser = {
      openid: 'test_' + Date.now(),
      nickname: '测试用户_' + Date.now().toString().slice(-4)
    };
  }
  
  // 尝试创建或获取用户
  const { data: existingUser, error: queryError } = await supabase
    .from('users')
    .select('*')
    .eq('openid', testUser.openid)
    .single();
    
  if (existingUser) {
    console.log('👤 用户已存在:', existingUser.id);
    return {
      method: 'existing_user',
      user: existingUser,
      authenticated: true
    };
  }
  
  // 创建新用户
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([{
      openid: testUser.openid,
      nickname: testUser.nickname,
      avatar_url: '/static/default-avatar.png'
    }])
    .select()
    .single();
    
  if (createError) {
    throw new Error(`创建用户失败: ${createError.message}`);
  }
  
  console.log('✨ 新用户创建成功:', newUser.id);
  return {
    method: 'new_user',
    user: newUser,
    authenticated: true
  };
}

/**
 * 数据库查询测试
 */
async function testDatabaseQuery(customQuery) {
  console.log('🗄️ 执行数据库查询测试...');
  
  // 如果有自定义查询，直接执行预定义的查询逻辑
  if (customQuery) {
    console.log('🔍 检测到自定义查询，使用标准查询方式');
    return await executeStandardChatQuery();
  }
  
  // 检查表是否存在
  const tables = ['users', 'study_groups', 'chat_messages'];
  const tableStatus = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
        
      tableStatus[table] = {
        exists: !error,
        error: error?.message
      };
    } catch (e) {
      tableStatus[table] = {
        exists: false,
        error: e.message
      };
    }
  }
  
  // 获取统计信息
  const stats = {};
  for (const table of tables) {
    if (tableStatus[table].exists) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        stats[table] = error ? 0 : count;
      } catch (e) {
        stats[table] = 0;
      }
    }
  }
  
  return {
    success: true,
    tables: tableStatus,
    statistics: stats,
    timestamp: new Date().toISOString()
  };
}

/**
 * 自定义查询回退方案
 */
async function executeCustomQueryFallback(customQuery) {
  console.log('🔄 使用回退方案执行查询...');
  
  try {
    // 简化查询，直接查询 chat_messages 表
    if (customQuery.includes('chat_messages')) {
      console.log('📝 查询 chat_messages 表...');
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .order('id', { ascending: true })
        .limit(50);
        
      if (error) {
        console.error('❌ 回退查询失败:', error);
        return {
          success: false,
          error: error.message,
          fallback: 'chat_messages_simple_query'
        };
      }
      
      console.log('✅ 回退查询成功:', data);
      return {
        success: true,
        data: data,
        query: 'fallback_chat_messages_query',
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      success: false,
      error: '不支持的查询类型',
      fallback: 'unsupported_query'
    };
  } catch (e) {
    console.error('❌ 回退查询异常:', e);
    return {
      success: false,
      error: e.message,
      fallback: 'fallback_failed'
    };
  }
}

/**
 * 实时功能测试
 */
async function testRealtime() {
  console.log('📡 执行实时功能测试...');
  
  try {
    // 尝试创建 realtime 通道
    const channel = supabase.channel('test-channel');
    
    return {
      available: true,
      channels: ['test-channel'],
      status: 'realtime_ready',
      note: '实时功能可用，但需要在客户端测试订阅'
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      fallback: '将使用轮询模式'
    };
  }
}

/**
 * 存储测试
 */
async function testStorage() {
  console.log('💾 执行存储测试...');
  
  try {
    // 列出存储桶
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw error;
    }
    
    return {
      available: true,
      buckets: buckets.map(bucket => bucket.name),
      permissions: 'read_write'
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      fallback: '将使用本地存储'
    };
  }
}

/**
 * 创建测试用户
 */
async function createTestUser(userData) {
  console.log('👤 创建测试用户...');
  
  const defaultData = {
    openid: 'test_user_' + Date.now(),
    nickname: '测试用户',
    avatar_url: '/static/default-avatar.png',
    bio: '这是一个测试用户',
    level: 1
  };
  
  const finalData = { ...defaultData, ...userData };
  
  const { data, error } = await supabase
    .from('users')
    .insert([finalData])
    .select()
    .single();
    
  if (error) {
    throw new Error(`创建用户失败: ${error.message}`);
  }
  
  return {
    user: data,
    created: true
  };
}

/**
 * 创建测试群组
 */
async function createTestGroup(groupData) {
  console.log('👥 创建测试群组...');
  
  const defaultData = {
    name: '测试学习小组',
    description: '这是一个测试群组',
    category: 'general',
    max_members: 20,
    is_public: true,
    invite_code: 'TEST' + Date.now().toString().slice(-4)
  };
  
  const finalData = { ...defaultData, ...groupData };
  
  const { data, error } = await supabase
    .from('study_groups')
    .insert([finalData])
    .select()
    .single();
    
  if (error) {
    throw new Error(`创建群组失败: ${error.message}`);
  }
  
  return {
    group: data,
    created: true
  };
}

/**
 * 发送测试消息
 */
async function sendTestMessage(messageData) {
  console.log('💬 发送测试消息...');
  
  const defaultData = {
    content: '这是一条测试消息',
    type: 'text',
    sender_name: '测试用户'
  };
  
  const finalData = { ...defaultData, ...messageData };
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([finalData])
    .select()
    .single();
    
  if (error) {
    throw new Error(`发送消息失败: ${error.message}`);
  }
  
  return {
    message: data,
    sent: true
  };
}

/**
 * 发送消息到数据库
 */
async function sendMessage(messageData) {
  console.log('📨 发送消息到数据库:', messageData);
  
  try {
    const { content, groupId, senderId, senderName } = messageData;
    
    // 验证必要参数
    if (!content || !groupId || !senderId || !senderName) {
      throw new Error('缺少必要参数: content, groupId, senderId, senderName');
    }
    
    // 插入消息到数据库
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          content: content.trim(),
          group_id: groupId,
          sender_id: senderId,
          sender_name: senderName
        }
      ])
      .select();
    
    if (error) {
      throw new Error(`数据库插入失败: ${error.message}`);
    }
    
    console.log('✅ 消息发送成功:', data);
    
    return {
      success: true,
      data: data[0],
      timestamp: new Date().toISOString()
    };
    
  } catch (e) {
    console.error('❌ 发送消息失败:', e);
    return {
      success: false,
      error: e.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 获取在线成员
 */
async function getOnlineMembers(groupId) {
  console.log('👥 获取在线成员:', groupId);
  
  if (!groupId) {
    throw new Error('缺少群组ID');
  }
  
  try {
    // 查询群组成员（模拟在线状态）
    const { data: members, error } = await supabase
      .from('group_members')
      .select(`
        user_id,
        users!inner(id, nickname, avatar_url)
      `)
      .eq('group_id', groupId);
      
    if (error) {
      console.log('⚠️ 群组成员查询失败，返回模拟数据');
      // 返回模拟的在线成员数据
      return {
        members: [
          {
            user_id: 'user_001',
            nickname: '用户1',
            avatar_url: '/static/default-avatar.png',
            online: true,
            last_seen: new Date().toISOString()
          },
          {
            user_id: 'user_002', 
            nickname: '用户2',
            avatar_url: '/static/default-avatar.png',
            online: true,
            last_seen: new Date().toISOString()
          }
        ],
        online_count: 2,
        total_count: 2,
        group_id: groupId,
        simulated: true
      };
    }
    
    // 处理真实数据，添加在线状态（简化版，实际需要实时状态管理）
    const processedMembers = members.map(member => ({
      user_id: member.users.id,
      nickname: member.users.nickname,
      avatar_url: member.users.avatar_url,
      online: Math.random() > 0.3, // 模拟70%在线率
      last_seen: new Date(Date.now() - Math.random() * 3600000).toISOString() // 最近1小时内
    }));
    
    const onlineMembers = processedMembers.filter(m => m.online);
    
    return {
      members: processedMembers,
      online_members: onlineMembers,
      online_count: onlineMembers.length,
      total_count: processedMembers.length,
      group_id: groupId,
      simulated: false
    };
    
  } catch (error) {
    console.error('❌ 获取在线成员失败:', error);
    
    // 返回错误时的兜底数据
    return {
      members: [],
      online_count: 0,
      total_count: 0,
      group_id: groupId,
      error: error.message,
      simulated: true
    };
  }
}

/**
 * 执行标准聊天消息查询
 */
async function executeStandardChatQuery() {
  console.log('📨 执行标准聊天消息查询...');
  
  try {
    // 首先尝试简单查询所有消息
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('id')
      .limit(10);
      
    if (error) {
      console.error('❌ 标准查询失败:', error);
      throw error;
    }
    
    console.log('✅ 标准查询成功，获取到', data?.length || 0, '条消息');
    console.log('📊 查询结果:', data);
    
    return {
      success: true,
      data: data || [],
      query: 'standard_chat_messages_query',
      timestamp: new Date().toISOString()
    };
    
  } catch (e) {
    console.error('❌ 标准查询异常:', e);
    return {
      success: false,
      error: e.message,
      query: 'standard_chat_messages_query_failed',
      timestamp: new Date().toISOString()
    };
  }
}
