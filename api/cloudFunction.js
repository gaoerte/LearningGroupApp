/**
 * 云函数调用 API
 */

/**
 * 调用微信登录云函数（带重试机制）
 * @param {string} code 微信登录凭证
 * @returns {Promise} 登录结果
 */
export async function callWechatLogin(code) {
  const maxRetries = 2;
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🚀 尝试调用登录云函数 (第${i + 1}次)`);
      console.log('传入参数 code:', code);
      
      const result = await wx.cloud.callFunction({
        name: 'wechatLogin',
        data: { code }
      });
      
      console.log('📱 云函数原始响应:', JSON.stringify(result, null, 2));
      
      // 检查响应结构
      if (!result.result) {
        console.error('❌ 云函数响应格式错误: 缺少 result 字段');
        throw new Error('云函数响应格式错误');
      }
      
      const { success, data, error, details } = result.result;
      
      console.log('📊 解析后的响应:');
      console.log('  - success:', success);
      console.log('  - error:', error);
      console.log('  - details:', details);
      console.log('  - data:', data);
      
      if (success && data) {
        console.log('✅ 登录成功！');
        return data;
      } else {
        console.error('❌ 登录失败:', error || '未知错误');
        console.error('❌ 详细信息:', details);
        throw new Error(error || details || '登录失败');
      }
    } catch (error) {
      console.error(`💥 第${i + 1}次调用失败:`, error);
      console.error('错误类型:', typeof error);
      console.error('错误消息:', error.message);
      
      lastError = error;
      
      // 如果是超时错误且还有重试次数，等待后重试
      if (i < maxRetries - 1 && error.message.includes('timeout')) {
        console.log('⏱️ 检测到超时错误，等待2秒后重试...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      // 其他错误直接抛出
      if (!error.message.includes('timeout')) {
        break;
      }
    }
  }
  
  // 所有重试都失败了
  console.error('💥 云函数调用最终失败:', lastError);
  throw new Error('登录服务暂时不可用，请稍后重试');
}

/**
 * 调用用户数据云函数
 * @param {object} params 参数对象
 * @returns {Promise} 操作结果
 */
export async function callUserDataFunction(params) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'userData',
      data: params
    });
    
    if (result.result && result.result.success) {
      return result.result.data;
    } else {
      throw new Error(result.result?.error || '操作失败');
    }
  } catch (error) {
    console.error('用户数据云函数调用失败:', error);
    throw new Error('数据操作失败');
  }
}

/**
 * 调用AI聊天云函数
 * @param {string} message 用户消息
 * @returns {Promise} AI回复
 */
export async function callAIChatFunction(message) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'aiChat',
      data: { message }
    });
    
    if (result.result && result.result.success) {
      return result.result.data;
    } else {
      throw new Error(result.result?.error || 'AI聊天失败');
    }
  } catch (error) {
    console.error('AI聊天云函数调用失败:', error);
    throw new Error('AI聊天服务暂时不可用');
  }
}
