/**
 * 学习小组 Supabase 云函数 - 完整版
 * 支持用户、群组、成员和消息的完整操作
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置 - 使用正确的项目配置
const supabaseUrl = 'https://klpseujbhwvifsfshfdx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscHNldWpiaHd2aWZzZnNoZmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDA4NTUsImV4cCI6MjA2NzAxNjg1NX0.LLLc49P59cGWsCQDAXWZ58_MJgQ8q1Pmm-Bv7hUOVpI';

let supabase = null;

// 初始化 Supabase 客户端
function initSupabase() {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase 客户端初始化成功');
  }
  return supabase;
}

/**
 * 云函数主入口
 */
exports.main = async (event, context) => {
  console.log('云函数调用开始:', JSON.stringify(event, null, 2));
  
  try {
    initSupabase();
    
    const { action, ...params } = event;
    let result;
    
    switch (action) {
      // 用户相关操作
      case 'createUser':
        result = await createUser(params);
        break;
      case 'getUserInfo':
        result = await getUserInfo(params);
        break;
      case 'updateUser':
        result = await updateUser(params);
        break;
        
      // 群组相关操作
      case 'getGroups':
        result = await getGroups(params);
        break;
      case 'getGroupDetail':
        result = await getGroupDetail(params);
        break;
      case 'createGroup':
        result = await createGroup(params);
        break;
      case 'joinGroup':
        result = await joinGroup(params);
        break;
      case 'leaveGroup':
        result = await leaveGroup(params);
        break;
        
      // 消息相关操作
      case 'getMessages':
        result = await getMessages(params);
        break;
      case 'sendMessage':
        result = await sendMessage(params);
        break;
      case 'deleteMessage':
        result = await deleteMessage(params);
        break;
        
      // 成员相关操作
      case 'getGroupMembers':
        result = await getGroupMembers(params);
        break;
      case 'updateMemberRole':
        result = await updateMemberRole(params);
        break;
        
      // 连接测试
      case 'ping':
        result = await testConnection();
        break;
        
      default:
        throw new Error(`未知操作: ${action}`);
    }
    
    console.log('操作成功:', result);
    return {
      success: true,
      action: action,
      data: result,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('操作失败:', error);
    return {
      success: false,
      action: event.action,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// ================================
// 用户操作
// ================================

/**
 * 创建或更新用户
 */
async function createUser({ openid, nickname, avatarUrl, bio }) {
  console.log('创建/更新用户:', { openid, nickname });
  
  if (!openid || !nickname) {
    throw new Error('缺少必要参数: openid, nickname');
  }
  
  const userData = {
    openid,
    nickname,
    ...(avatarUrl && { avatar_url: avatarUrl }),
    ...(bio && { bio }),
    last_active: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('users')
    .upsert(userData, { onConflict: 'openid' })
    .select()
    .single();
    
  if (error) {
    throw new Error(`创建用户失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 获取用户信息
 */
async function getUserInfo({ openid, userId }) {
  console.log('获取用户信息:', { openid, userId });
  
  let query = supabase.from('users').select('*');
  
  if (openid) {
    query = query.eq('openid', openid);
  } else if (userId) {
    query = query.eq('id', userId);
  } else {
    throw new Error('需要提供 openid 或 userId');
  }
  
  const { data, error } = await query.single();
  
  if (error) {
    throw new Error(`获取用户信息失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 更新用户信息
 */
async function updateUser({ openid, updates }) {
  console.log('更新用户信息:', { openid, updates });
  
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('openid', openid)
    .select()
    .single();
    
  if (error) {
    throw new Error(`更新用户失败: ${error.message}`);
  }
  
  return data;
}

// ================================
// 群组操作
// ================================

/**
 * 获取群组列表
 */
async function getGroups({ category, limit = 20, offset = 0 }) {
  console.log('获取群组列表:', { category, limit, offset });
  
  let query = supabase
    .from('study_groups')
    .select(`
      *,
      creator:users!creator_id(id, nickname, avatar_url),
      member_count:group_members(count)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`获取群组列表失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 获取群组详情
 */
async function getGroupDetail({ groupId }) {
  console.log('获取群组详情:', groupId);
  
  if (!groupId) {
    throw new Error('缺少参数: groupId');
  }
  
  const { data, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      creator:users!creator_id(id, nickname, avatar_url),
      members:group_members(
        id, role, joined_at,
        user:users(id, nickname, avatar_url)
      )
    `)
    .eq('id', groupId)
    .single();
    
  if (error) {
    throw new Error(`获取群组详情失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 创建群组
 */
async function createGroup({ name, description, category, creatorOpenid }) {
  console.log('创建群组:', { name, description, category, creatorOpenid });
  
  if (!name || !creatorOpenid) {
    throw new Error('缺少必要参数: name, creatorOpenid');
  }
  
  // 首先检查用户是否存在，如果不存在则创建
  let creator;
  
  // 查询现有用户
  const { data: existingUsers, error: queryError } = await supabase
    .from('users')
    .select('id, openid')
    .eq('openid', creatorOpenid);
    
  if (queryError) {
    throw new Error(`查询用户失败: ${queryError.message}`);
  }
  
  console.log('查询到的用户:', existingUsers);
  
  if (!existingUsers || existingUsers.length === 0) {
    // 用户不存在，创建用户
    console.log('用户不存在，创建新用户...');
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert([{
        openid: creatorOpenid,
        nickname: '用户' + Date.now().toString().slice(-6),
        avatar_url: ''
      }])
      .select()
      .single();
      
    if (createUserError) {
      throw new Error(`创建用户失败: ${createUserError.message}`);
    }
    
    creator = newUser;
    console.log('新用户创建成功:', creator);
  } else if (existingUsers.length === 1) {
    // 找到唯一用户
    creator = existingUsers[0];
    console.log('找到现有用户:', creator);
  } else {
    // 找到多个用户，这是数据不一致的问题
    console.warn('发现重复用户:', existingUsers);
    creator = existingUsers[0]; // 使用第一个
  }
  
  // 创建群组
  const { data: group, error: groupError } = await supabase
    .from('study_groups')
    .insert([{
      name,
      description: description || '',
      category: category || 'general',
      creator_id: creator.id
    }])
    .select()
    .single();
    
  if (groupError) {
    throw new Error(`创建群组失败: ${groupError.message}`);
  }
  
  // 将创建者添加为群组成员
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{
      group_id: group.id,
      user_id: creator.id,
      role: 'creator'
    }]);
    
  if (memberError) {
    console.warn('添加创建者为成员失败:', memberError.message);
  }
  
  return group;
}

/**
 * 加入群组
 */
async function joinGroup({ groupId, userOpenid }) {
  console.log('加入群组:', { groupId, userOpenid });
  
  if (!groupId || !userOpenid) {
    throw new Error('缺少必要参数: groupId, userOpenid');
  }
  
  // 获取用户ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('openid', userOpenid)
    .single();
    
  if (userError) {
    throw new Error(`获取用户信息失败: ${userError.message}`);
  }
  
  // 检查是否已经是成员
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();
    
  if (existing) {
    throw new Error('用户已经是群组成员');
  }
  
  // 添加成员
  const { data, error } = await supabase
    .from('group_members')
    .insert([{
      group_id: groupId,
      user_id: user.id,
      role: 'member'
    }])
    .select()
    .single();
    
  if (error) {
    throw new Error(`加入群组失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 离开群组
 */
async function leaveGroup({ groupId, userOpenid }) {
  console.log('离开群组:', { groupId, userOpenid });
  
  if (!groupId || !userOpenid) {
    throw new Error('缺少必要参数: groupId, userOpenid');
  }
  
  // 获取用户ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('openid', userOpenid)
    .single();
    
  if (userError) {
    throw new Error(`获取用户信息失败: ${userError.message}`);
  }
  
  // 删除成员关系
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', user.id);
    
  if (error) {
    throw new Error(`离开群组失败: ${error.message}`);
  }
  
  return { success: true };
}

// ================================
// 消息操作
// ================================

/**
 * 获取群组消息
 */
async function getMessages({ groupId, limit = 50, offset = 0, before }) {
  console.log('获取群组消息:', { groupId, limit, offset, before });
  
  if (!groupId) {
    throw new Error('缺少参数: groupId');
  }
  
  let query = supabase
    .from('chat_messages')
    .select(`
      id, content, message_type, created_at, sender_name,
      sender:users!sender_id(id, nickname, avatar_url),
      reply_to_message:chat_messages!reply_to(id, content, sender_name)
    `)
    .eq('group_id', groupId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
    
  if (before) {
    query = query.lt('created_at', before);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`获取消息失败: ${error.message}`);
  }
  
  // 按时间正序返回
  return data.reverse();
}

/**
 * 发送消息
 */
async function sendMessage({ groupId, userOpenid, content, messageType = 'text', replyTo }) {
  console.log('发送消息:', { groupId, userOpenid, content, messageType, replyTo });
  
  if (!groupId || !userOpenid || !content) {
    throw new Error('缺少必要参数: groupId, userOpenid, content');
  }
  
  // 获取用户信息
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, nickname')
    .eq('openid', userOpenid)
    .single();
    
  if (userError) {
    throw new Error(`获取用户信息失败: ${userError.message}`);
  }
  
  // 检查用户是否为群组成员
  const { data: membership } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();
    
  if (!membership) {
    throw new Error('用户不是群组成员，无法发送消息');
  }
  
  // 插入消息
  const messageData = {
    group_id: groupId,
    sender_id: user.id,
    sender_name: user.nickname,
    content: content.trim(),
    message_type: messageType
  };
  
  if (replyTo) {
    messageData.reply_to = replyTo;
  }
  
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([messageData])
    .select(`
      id, content, message_type, created_at, sender_name,
      sender:users!sender_id(id, nickname, avatar_url)
    `)
    .single();
    
  if (error) {
    throw new Error(`发送消息失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 删除消息
 */
async function deleteMessage({ messageId, userOpenid }) {
  console.log('删除消息:', { messageId, userOpenid });
  
  if (!messageId || !userOpenid) {
    throw new Error('缺少必要参数: messageId, userOpenid');
  }
  
  // 获取用户ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('openid', userOpenid)
    .single();
    
  if (userError) {
    throw new Error(`获取用户信息失败: ${userError.message}`);
  }
  
  // 标记消息为已删除（只能删除自己的消息）
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_deleted: true })
    .eq('id', messageId)
    .eq('sender_id', user.id);
    
  if (error) {
    throw new Error(`删除消息失败: ${error.message}`);
  }
  
  return { success: true };
}

// ================================
// 成员操作
// ================================

/**
 * 获取群组成员
 */
async function getGroupMembers({ groupId }) {
  console.log('获取群组成员:', groupId);
  
  if (!groupId) {
    throw new Error('缺少参数: groupId');
  }
  
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id, role, joined_at, is_muted,
      user:users(id, nickname, avatar_url, last_active)
    `)
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });
    
  if (error) {
    throw new Error(`获取群组成员失败: ${error.message}`);
  }
  
  return data;
}

/**
 * 更新成员角色
 */
async function updateMemberRole({ groupId, userOpenid, newRole, operatorOpenid }) {
  console.log('更新成员角色:', { groupId, userOpenid, newRole, operatorOpenid });
  
  if (!groupId || !userOpenid || !newRole || !operatorOpenid) {
    throw new Error('缺少必要参数: groupId, userOpenid, newRole, operatorOpenid');
  }
  
  // 验证操作者权限（这里简化处理）
  // 实际应用中需要检查操作者是否为管理员或创建者
  
  // 获取目标用户ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('openid', userOpenid)
    .single();
    
  if (userError) {
    throw new Error(`获取用户信息失败: ${userError.message}`);
  }
  
  // 更新角色
  const { data, error } = await supabase
    .from('group_members')
    .update({ role: newRole })
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) {
    throw new Error(`更新成员角色失败: ${error.message}`);
  }
  
  return data;
}

// ================================
// 工具函数
// ================================

/**
 * 连接测试
 */
async function testConnection() {
  console.log('执行连接测试...');
  
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);
    
  if (error) {
    throw new Error(`连接测试失败: ${error.message}`);
  }
  
  return {
    status: 'connected',
    timestamp: new Date().toISOString(),
    message: 'Supabase 连接正常'
  };
}
