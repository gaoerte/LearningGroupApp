/**
 * 用户登录状态调试脚本
 * 帮助诊断登录状态存储和读取问题
 */

// 模拟登录流程测试
function testLoginFlow() {
  console.log('=== 开始测试登录流程 ===');
  
  // 1. 清除现有数据
  console.log('1. 清除现有登录数据...');
  uni.removeStorageSync('user_token');
  uni.removeStorageSync('user_openid');
  uni.removeStorageSync('user_info');
  uni.removeStorageSync('login_time');
  uni.removeStorageSync('is_logged_in');
  
  // 2. 模拟UserAPI返回的数据格式
  const mockLoginData = {
    userInfo: {
      openid: 'test_openid_12345',
      nickname: '测试用户',
      name: '测试用户',
      avatar_url: '/static/default-avatar.png',
      avatarUrl: '/static/default-avatar.png',
      id: 'supabase_user_id_123'
    },
    token: 'token_test_openid_12345_1234567890_abcdef',
    loginTime: new Date().toISOString()
  };
  
  console.log('2. 模拟登录数据:', mockLoginData);
  
  // 3. 测试StorageManager.saveLoginData
  try {
    console.log('3. 调用StorageManager.saveLoginData...');
    
    // 模拟StorageManager的saveLoginData方法
    const saveResult = testSaveLoginData(mockLoginData);
    console.log('保存结果:', saveResult);
    
    if (saveResult) {
      // 4. 测试读取
      console.log('4. 测试读取登录状态...');
      testReadLoginData();
    }
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
  
  console.log('=== 登录流程测试完成 ===');
}

// 模拟StorageManager.saveLoginData方法
function testSaveLoginData(loginData) {
  try {
    console.log('[测试Storage] 原始登录数据:', loginData);
    
    let userInfo, token, loginTime, openid;
    
    // 兼容 UserAPI 返回的数据结构
    if (loginData.userInfo && loginData.token) {
      userInfo = loginData.userInfo;
      token = loginData.token;
      loginTime = loginData.loginTime;
      openid = loginData.userInfo.openid;
    } 
    // 兼容旧版数据结构
    else if (loginData.user && loginData.token) {
      userInfo = loginData.user;
      token = loginData.token;
      loginTime = loginData.login_time;
      openid = loginData.openid || loginData.user.openid;
    }
    // 直接传递的数据结构
    else {
      userInfo = loginData.user || loginData.userInfo;
      token = loginData.token;
      loginTime = loginData.login_time || loginData.loginTime;
      openid = loginData.openid || (userInfo && userInfo.openid);
    }
    
    if (!userInfo || !token || !openid) {
      throw new Error('登录数据缺少必要字段: userInfo, token, openid');
    }
    
    console.log('[测试Storage] 提取的数据:', { 
      openid, 
      token: token.substring(0, 20) + '...', 
      loginTime,
      userInfo: userInfo.nickname || userInfo.name 
    });
    
    // 保存基本信息
    uni.setStorageSync('user_token', token);
    uni.setStorageSync('user_openid', openid);
    uni.setStorageSync('user_info', userInfo);
    uni.setStorageSync('login_time', loginTime);
    uni.setStorageSync('is_logged_in', true);
    
    console.log('[测试Storage] 登录信息保存成功');
    return true;
  } catch (error) {
    console.error('[测试Storage] 保存登录信息失败:', error);
    return false;
  }
}

// 测试读取登录数据
function testReadLoginData() {
  console.log('=== 测试读取登录数据 ===');
  
  try {
    // 直接读取存储
    const token = uni.getStorageSync('user_token');
    const openid = uni.getStorageSync('user_openid');
    const userInfo = uni.getStorageSync('user_info');
    const loginTime = uni.getStorageSync('login_time');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    
    console.log('直接读取结果:');
    console.log('- token:', token ? token.substring(0, 20) + '...' : null);
    console.log('- openid:', openid);
    console.log('- userInfo:', userInfo);
    console.log('- loginTime:', loginTime);
    console.log('- isLoggedIn:', isLoggedIn);
    
    // 模拟getLoginData逻辑
    if (token && openid && isLoggedIn) {
      console.log('✅ 登录数据完整');
      
      // 模拟isLoggedIn检查
      const loginData = {
        token,
        openid,
        userInfo,
        loginTime,
        isLoggedIn
      };
      
      const finalResult = loginData !== null && loginData.isLoggedIn === true;
      console.log('✅ 最终登录状态:', finalResult);
      
      return true;
    } else {
      console.log('❌ 登录数据不完整');
      console.log('缺少字段:', {
        token: !token,
        openid: !openid, 
        isLoggedIn: !isLoggedIn
      });
      return false;
    }
    
  } catch (error) {
    console.error('❌ 读取登录数据失败:', error);
    return false;
  }
}

// 检查当前登录状态
function checkCurrentLoginStatus() {
  console.log('=== 检查当前登录状态 ===');
  
  try {
    const token = uni.getStorageSync('user_token');
    const openid = uni.getStorageSync('user_openid');
    const userInfo = uni.getStorageSync('user_info');
    const loginTime = uni.getStorageSync('login_time');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    
    console.log('当前存储状态:');
    console.log('- user_token:', token ? token.substring(0, 20) + '...' : '不存在');
    console.log('- user_openid:', openid || '不存在');
    console.log('- user_info:', userInfo ? `${userInfo.nickname || userInfo.name} (${userInfo.openid})` : '不存在');
    console.log('- login_time:', loginTime || '不存在');
    console.log('- is_logged_in:', isLoggedIn);
    
    const hasAllRequiredData = !!(token && openid && isLoggedIn);
    console.log('是否有完整登录数据:', hasAllRequiredData);
    
    if (hasAllRequiredData) {
      uni.showToast({
        title: '用户已登录',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: '用户未登录或数据不完整',
        icon: 'none'
      });
    }
    
  } catch (error) {
    console.error('检查登录状态失败:', error);
    uni.showToast({
      title: '检查失败: ' + error.message,
      icon: 'none'
    });
  }
}

// 导出测试函数
module.exports = {
  testLoginFlow,
  testSaveLoginData,
  testReadLoginData,
  checkCurrentLoginStatus
};

// 如果在浏览器环境，添加到全局对象
if (typeof window !== 'undefined') {
  window.loginDebug = {
    testLoginFlow,
    testSaveLoginData, 
    testReadLoginData,
    checkCurrentLoginStatus
  };
}

console.log('📋 登录状态调试脚本已加载');
console.log('可用的调试函数:');
console.log('- testLoginFlow(): 测试完整登录流程');
console.log('- checkCurrentLoginStatus(): 检查当前登录状态');
console.log('- testReadLoginData(): 测试读取登录数据');

// 自动检查当前状态
setTimeout(() => {
  checkCurrentLoginStatus();
}, 1000);
