/**
 * 用户数据库测试和修复脚本
 * 用于检查和解决用户登录状态与数据库数据不一致的问题
 */

// 在浏览器控制台执行此脚本来诊断问题

console.log('=== 用户状态诊断开始 ===');

// 1. 检查本地存储的用户信息
const userToken = uni.getStorageSync('user_token');
const userInfo = uni.getStorageSync('user_info');
const isLoggedIn = uni.getStorageSync('is_logged_in');
const loginTime = uni.getStorageSync('login_time');

console.log('1. 本地存储检查:');
console.log('  - Token:', userToken ? '存在' : '不存在');
console.log('  - UserInfo:', userInfo);
console.log('  - IsLoggedIn:', isLoggedIn);
console.log('  - LoginTime:', loginTime);

if (!userInfo) {
  console.error('❌ 用户信息缺失，需要重新登录');
} else {
  console.log('✅ 本地用户信息完整');
  
  // 2. 测试云函数连接
  console.log('\n2. 测试云函数连接...');
  
  uniCloud.callFunction({
    name: 'learningGroupAPI',
    data: { action: 'ping' }
  }).then(result => {
    console.log('✅ 云函数连接正常:', result);
    
    // 3. 检查用户是否在数据库中存在
    console.log('\n3. 检查数据库中的用户信息...');
    
    return uniCloud.callFunction({
      name: 'learningGroupAPI',
      data: { 
        action: 'getUserInfo',
        openid: userInfo.openid
      }
    });
  }).then(result => {
    if (result.result && result.result.success) {
      console.log('✅ 用户在数据库中存在:', result.result.data);
    } else {
      console.log('❌ 用户在数据库中不存在，尝试创建...');
      
      // 4. 如果用户不存在，创建用户
      return uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'createUser',
          openid: userInfo.openid,
          nickname: userInfo.nickname || userInfo.name || '微信用户',
          avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || ''
        }
      });
    }
  }).then(result => {
    if (result) {
      console.log('✅ 用户创建成功:', result.result.data);
    }
    
    console.log('\n=== 诊断完成 ===');
    console.log('如果所有检查都通过，现在可以尝试创建群组了。');
    
  }).catch(error => {
    console.error('❌ 云函数调用失败:', error);
    console.log('请检查网络连接和云函数配置');
  });
}

// 提供修复建议
console.log('\n=== 修复建议 ===');
console.log('如果遇到问题，可以尝试：');
console.log('1. 重新登录: uni.reLaunch({url: "/pages/login/login"})');
console.log('2. 清除本地数据: uni.clearStorageSync()');
console.log('3. 检查网络连接');
console.log('4. 确认云函数部署状态');
