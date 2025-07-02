// cloudfunctions/userProfile/index.js
const { createClient } = require('@supabase/supabase-js');

exports.main = async (event, context) => {
  try {
    const { action, openid, userInfo } = event;
    
    // 初始化 Supabase 客户端
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    switch (action) {
      case 'register':
        return await registerUser(supabase, openid, userInfo);
      case 'update':
        return await updateUser(supabase, openid, userInfo);
      case 'get':
        return await getUser(supabase, openid);
      case 'uploadAvatar':
        return await uploadAvatar(supabase, openid, userInfo.avatarData);
      default:
        return { error: '未知操作', code: 400 };
    }
  } catch (error) {
    console.error('userProfile 云函数错误:', error);
    return { error: error.message, code: 500 };
  }
};

// 注册用户
async function registerUser(supabase, openid, userInfo) {
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('openid', openid)
    .single();
    
  if (existingUser) {
    return { error: '用户已存在', code: 409 };
  }
  
  const newUser = {
    openid,
    nickname: userInfo.nickname || '新用户',
    avatar_url: userInfo.avatar_url || '',
    gender: userInfo.gender || 'unknown',
    location: userInfo.location || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single();
    
  if (error) {
    return { error: '注册失败: ' + error.message, code: 500 };
  }
  
  // 创建用户设置
  await supabase
    .from('user_settings')
    .insert([{ user_id: data.id }]);
    
  return { success: true, user: data, code: 200 };
}

// 更新用户信息
async function updateUser(supabase, openid, userInfo) {
  const updateData = {
    ...userInfo,
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('openid', openid)
    .select()
    .single();
    
  if (error) {
    return { error: '更新失败: ' + error.message, code: 500 };
  }
  
  return { success: true, user: data, code: 200 };
}

// 获取用户信息
async function getUser(supabase, openid) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      user_settings (*)
    `)
    .eq('openid', openid)
    .single();
    
  if (error) {
    return { error: '用户不存在', code: 404 };
  }
  
  return { success: true, user: data, code: 200 };
}

// 上传头像（简化版，实际可以集成云存储）
async function uploadAvatar(supabase, openid, avatarData) {
  // 这里可以集成微信云存储或其他云存储服务
  // 暂时返回一个示例URL
  const avatarUrl = `https://example.com/avatars/${openid}_${Date.now()}.jpg`;
  
  const { data, error } = await supabase
    .from('users')
    .update({ 
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    })
    .eq('openid', openid)
    .select()
    .single();
    
  if (error) {
    return { error: '头像更新失败: ' + error.message, code: 500 };
  }
  
  return { success: true, avatar_url: avatarUrl, code: 200 };
}
