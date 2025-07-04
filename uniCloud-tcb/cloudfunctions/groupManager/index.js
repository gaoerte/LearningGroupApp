// cloudfunctions/groupManager/index.js
const { createClient } = require('@supabase/supabase-js');

exports.main = async (event, context) => {
  try {
    const { action, openid, groupInfo, groupId, searchQuery } = event;
    
    // 添加健康检查功能
    if (action === 'healthCheck') {
      return {
        success: true,
        message: 'groupManager云函数运行正常',
        timestamp: new Date().toISOString(),
        env: process.env.CLOUD_ENV || 'unknown'
      };
    }
    
    // 初始化 Supabase 客户端
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // 如果是纯健康检查，不需要验证用户
    if (action === 'healthCheckWithDB') {
      try {
        const { data, error } = await supabase
          .from('study_groups')
          .select('count(*)', { count: 'exact', head: true });
          
        if (error) {
          return {
            success: false,
            error: '数据库连接测试失败: ' + error.message,
            code: 500
          };
        }
        
        return {
          success: true,
          message: '数据库连接正常',
          timestamp: new Date().toISOString()
        };
      } catch (dbError) {
        return {
          success: false,
          error: '数据库连接异常: ' + dbError.message,
          code: 500
        };
      }
    }
    
    // 先获取用户ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('openid', openid)
      .single();
      
    if (!user && !['search', 'get'].includes(action)) {
      return { 
        success: false,
        error: '用户不存在',
        code: 404 
      };
    }
    
    const userId = user?.id;
    
    switch (action) {
      case 'create':
        return await createGroup(supabase, userId, groupInfo);
      case 'search':
        return await searchGroups(supabase, searchQuery);
      case 'join':
        return await joinGroup(supabase, userId, groupId);
      case 'leave':
        return await leaveGroup(supabase, userId, groupId);
      case 'list':
        return await getUserGroups(supabase, userId);
      case 'get':
        return await getGroupInfo(supabase, groupId);
      default:
        return { error: '未知操作', code: 400 };
    }
  } catch (error) {
    console.error('groupManager 云函数错误:', error);
    return { error: error.message, code: 500 };
  }
};

// 创建群组
async function createGroup(supabase, userId, groupInfo) {
  const newGroup = {
    name: groupInfo.name,
    description: groupInfo.description || '',
    creator_id: userId,
    category: groupInfo.category || 'study',
    max_members: groupInfo.max_members || 50,
    is_public: groupInfo.is_public !== false, // 默认公开
    created_at: new Date().toISOString()
  };
  
  const { data: group, error: groupError } = await supabase
    .from('study_groups')
    .insert([newGroup])
    .select()
    .single();
    
  if (groupError) {
    return { error: '创建群组失败: ' + groupError.message, code: 500 };
  }
  
  // 创建者自动加入群组
  const { error: memberError } = await supabase
    .from('group_members')
    .insert([{
      group_id: group.id,
      user_id: userId,
      role: 'admin',
      joined_at: new Date().toISOString()
    }]);
    
  if (memberError) {
    console.error('添加创建者到群组失败:', memberError);
  }
  
  return { success: true, group: group, code: 200 };
}

// 搜索群组
async function searchGroups(supabase, searchQuery) {
  let query = supabase
    .from('study_groups')
    .select(`
      *,
      creator:users!creator_id(nickname, avatar_url),
      member_count:group_members(count)
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false });
    
  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }
  
  const { data, error } = await query.limit(20);
  
  if (error) {
    return { error: '搜索失败: ' + error.message, code: 500 };
  }
  
  return { success: true, groups: data, code: 200 };
}

// 加入群组
async function joinGroup(supabase, userId, groupId) {
  // 检查是否已经是成员
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();
    
  if (existing) {
    return { error: '已经是群组成员', code: 409 };
  }
  
  // 检查群组是否存在和人数限制
  const { data: group } = await supabase
    .from('study_groups')
    .select('max_members, member_count')
    .eq('id', groupId)
    .single();
    
  if (!group) {
    return { error: '群组不存在', code: 404 };
  }
  
  if (group.member_count >= group.max_members) {
    return { error: '群组人数已满', code: 409 };
  }
  
  // 加入群组
  const { error } = await supabase
    .from('group_members')
    .insert([{
      group_id: groupId,
      user_id: userId,
      role: 'member',
      joined_at: new Date().toISOString()
    }]);
    
  if (error) {
    return { error: '加入群组失败: ' + error.message, code: 500 };
  }
  
  return { success: true, message: '成功加入群组', code: 200 };
}

// 退出群组
async function leaveGroup(supabase, userId, groupId) {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
    
  if (error) {
    return { error: '退出群组失败: ' + error.message, code: 500 };
  }
  
  return { success: true, message: '成功退出群组', code: 200 };
}

// 获取用户加入的群组
async function getUserGroups(supabase, userId) {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      group:study_groups(
        id,
        name,
        description,
        avatar_url,
        member_count,
        creator:users!creator_id(nickname)
      )
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });
    
  if (error) {
    return { error: '获取群组列表失败: ' + error.message, code: 500 };
  }
  
  return { success: true, groups: data, code: 200 };
}

// 获取群组详情
async function getGroupInfo(supabase, groupId) {
  const { data, error } = await supabase
    .from('study_groups')
    .select(`
      *,
      creator:users!creator_id(id, nickname, avatar_url),
      members:group_members(
        role,
        joined_at,
        user:users(id, nickname, avatar_url)
      )
    `)
    .eq('id', groupId)
    .single();
    
  if (error) {
    return { error: '获取群组信息失败: ' + error.message, code: 500 };
  }
  
  return { success: true, group: data, code: 200 };
}
