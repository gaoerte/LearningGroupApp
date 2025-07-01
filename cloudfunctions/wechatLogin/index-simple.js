// cloudfunctions/wechatLogin/index-simple.js
// 备用版本：如果 openapi 权限有问题，可以使用这个简化版本
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  console.log('=== 简化版云函数开始执行 ===');
  console.log('event:', JSON.stringify(event));
  
  try {
    const { code } = event;
    
    if (!code) {
      return {
        success: false,
        error: '缺少微信授权码',
        code: 400
      };
    }
    
    console.log('收到微信授权码:', code);
    
    // 暂时返回模拟数据，用于测试
    // 实际项目中应该调用微信API获取真实的openid
    const mockOpenid = `mock_${code.slice(-8)}_${Date.now()}`;
    
    const userData = {
      access_token: `token_${Date.now()}_${mockOpenid.slice(-8)}`,
      user_id: mockOpenid,
      openid: mockOpenid,
      expires_in: 7200
    };
    
    console.log('返回模拟登录数据:', userData);
    
    return {
      success: true,
      data: userData
    };
    
  } catch (err) {
    console.error('云函数执行失败:', err);
    return {
      success: false,
      error: '登录处理失败',
      details: err.message,
      code: 500
    };
  }
};
