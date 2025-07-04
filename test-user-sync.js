/**
 * 用户同步快速测试脚本
 * 在浏览器控制台运行此脚本来测试用户同步功能
 */

async function testUserSync() {
  console.log('🧪 === 开始用户同步测试 ===');
  
  try {
    // 1. 检查本地登录状态
    console.log('📋 1. 检查本地登录状态...');
    const token = uni.getStorageSync('user_token');
    const userInfo = uni.getStorageSync('user_info');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    
    console.log('   - Token:', token ? '✅ 存在' : '❌ 不存在');
    console.log('   - UserInfo:', userInfo ? '✅ 存在' : '❌ 不存在');
    console.log('   - IsLoggedIn:', isLoggedIn ? '✅ 是' : '❌ 否');
    
    if (!token || !userInfo || !isLoggedIn) {
      throw new Error('用户未登录，请先登录');
    }
    
    console.log('   📄 用户信息:', userInfo);
    
    // 2. 测试云函数连接
    console.log('\n🔗 2. 测试云函数连接...');
    const pingResult = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: { action: 'ping' },
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });
    console.log('   ✅ 云函数连接正常:', pingResult.result);
    
    // 3. 检查用户是否在Supabase中存在
    console.log('\n👤 3. 检查用户是否在Supabase中存在...');
    const checkResult = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'getUserInfo',
          openid: userInfo.openid
        },
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });
    
    if (checkResult.result && checkResult.result.success) {
      console.log('   ✅ 用户在Supabase中已存在:', checkResult.result.data);
      console.log('   🎉 用户同步正常，可以创建群组了！');
    } else {
      console.log('   ❌ 用户在Supabase中不存在，尝试创建...');
      
      // 4. 创建用户
      console.log('\n🆕 4. 在Supabase中创建用户...');
      const createResult = await new Promise((resolve, reject) => {
        uniCloud.callFunction({
          name: 'learningGroupAPI',
          data: {
            action: 'createUser',
            openid: userInfo.openid,
            nickname: userInfo.nickname || userInfo.name || '微信用户',
            avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || ''
          },
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      });
      
      if (createResult.result && createResult.result.success) {
        console.log('   ✅ 用户创建成功:', createResult.result.data);
        console.log('   🎉 用户同步完成，现在可以创建群组了！');
        
        // 更新本地用户信息
        const updatedUserInfo = Object.assign({}, userInfo, createResult.result.data);
        uni.setStorageSync('user_info', updatedUserInfo);
        console.log('   📝 本地用户信息已更新');
      } else {
        throw new Error('创建用户失败: ' + (createResult.result?.error || '未知错误'));
      }
    }
    
    // 5. 测试创建群组（可选）
    console.log('\n🏗️ 5. 测试创建群组功能是否正常...');
    console.log('   提示：现在可以去创建群组页面测试创建功能了');
    
    console.log('\n🎊 === 用户同步测试完成 ===');
    console.log('✅ 所有检查通过，用户已准备好使用完整功能！');
    
    uni.showToast({
      title: '用户同步测试通过',
      icon: 'success',
      duration: 2000
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.log('\n💡 解决建议:');
    console.log('   1. 确保已经登录');
    console.log('   2. 检查网络连接');
    console.log('   3. 确认云函数部署正常');
    console.log('   4. 重新登录后再试');
    
    uni.showToast({
      title: '测试失败: ' + error.message,
      icon: 'none',
      duration: 3000
    });
    
    return false;
  }
}

// 快速修复用户同步问题
async function quickFixUserSync() {
  console.log('🔧 === 快速修复用户同步问题 ===');
  
  try {
    const userInfo = uni.getStorageSync('user_info');
    if (!userInfo) {
      throw new Error('用户未登录，请先登录');
    }
    
    console.log('🔨 强制同步用户到Supabase...');
    const result = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'createUser',
          openid: userInfo.openid,
          nickname: userInfo.nickname || userInfo.name || '微信用户',
          avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || ''
        },
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });
    
    if (result.result && result.result.success) {
      console.log('✅ 用户同步修复成功:', result.result.data);
      
      // 更新本地用户信息
      const updatedUserInfo = Object.assign({}, userInfo, result.result.data);
      uni.setStorageSync('user_info', updatedUserInfo);
      
      uni.showToast({
        title: '修复成功',
        icon: 'success'
      });
      
      return true;
    } else {
      throw new Error(result.result?.error || '修复失败');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    uni.showToast({
      title: '修复失败: ' + error.message,
      icon: 'none',
      duration: 3000
    });
    return false;
  }
}

// 使用说明
console.log('📖 === 用户同步测试工具使用说明 ===');
console.log('1. 运行完整测试: testUserSync()');
console.log('2. 快速修复同步: quickFixUserSync()');
console.log('3. 在创建群组前建议先运行测试确保用户已同步');

// 自动执行测试
console.log('\n🚀 自动开始测试...');
testUserSync();
