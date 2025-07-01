// cloudfunctions/wechatLogin/index.js
require('dotenv').config();

globalThis.fetch = require('node-fetch').default;
globalThis.Headers = require('node-fetch').Headers;
globalThis.Request = require('node-fetch').Request;
globalThis.Response = require('node-fetch').Response;

const { createClient } = require('@supabase/supabase-js');
const cloud = require('wx-server-sdk');
cloud.init({ env: process.env.VITE_WECHAT_CLOUD_ID });

exports.main = async (event) => {
  try {
    const { code } = event;
    if (!code) return { error: '缺少微信授权码', code: 400 };
    
    // 1. 获取微信 openid
    const wxResult = await cloud.openapi.auth.code2Session({
      jsCode: code
    });
    
    const openid = wxResult.openid;
    if (!openid) return { error: '获取openid失败', code: 500 };
    
    // 2. 初始化 Supabase 客户端
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ROLE,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    // 3. 检查/创建用户
    let { data: user, error } = await supabase
      .from('users')
      .select('id')
      .eq('openid', openid)
      .single();
    
    if (error || !user) {
      const newUser = {
        id: require('crypto').randomUUID(),
        openid: openid
      };
      
      const { error: createError } = await supabase
        .from('users')
        .insert(newUser);
      
      if (createError) throw createError;
      user = newUser;
    }
    
    // 4. 生成访问令牌
    const token = await supabase.auth.signInWithPassword({
      email: `${openid}@wechat.user`, // 虚拟邮箱
      password: openid // 使用openid作为密码
    });
    
    return {
      success: true,
      data: {
        access_token: token.data.session.access_token,
        user_id: user.id,
        openid: openid,
        expires_in: token.data.session.expires_in
      }
    };
    
  } catch (err) {
    console.error('云函数错误:', err);
    return {
      error: '服务器内部错误',
      details: err.message,
      code: 500
    };
  }
};