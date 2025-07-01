// test/supabase-test.js
// Supabase 后端功能测试文件

/**
 * 这是一个测试文件，展示如何使用 Supabase 后端 API
 * 可以在小程序中的某个页面调用这些测试函数来验证功能
 */

import { userAPI, checkinAPI, studyGroupAPI, supabaseHelper } from '@/api/supabase.js';

// 测试用户 API
export async function testUserAPI() {
  console.log('=== 测试用户 API ===');
  
  try {
    // 1. 创建用户
    console.log('1. 创建用户...');
    const createResult = await userAPI.createUser({
      nickname: '测试用户',
      avatar_url: 'https://example.com/avatar.jpg'
    });
    console.log('创建用户结果:', createResult);
    
    // 2. 获取用户信息
    console.log('2. 获取用户信息...');
    const getResult = await userAPI.getProfile();
    console.log('获取用户结果:', getResult);
    
    // 3. 更新用户信息
    console.log('3. 更新用户信息...');
    const updateResult = await userAPI.updateProfile({
      nickname: '更新后的昵称'
    });
    console.log('更新用户结果:', updateResult);
    
    return { success: true, message: '用户 API 测试通过' };
    
  } catch (error) {
    console.error('用户 API 测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试打卡 API
export async function testCheckinAPI() {
  console.log('=== 测试打卡 API ===');
  
  try {
    // 1. 检查今日是否已打卡
    console.log('1. 检查今日打卡状态...');
    const hasCheckedIn = await supabaseHelper.checkTodayCheckin();
    console.log('今日是否已打卡:', hasCheckedIn);
    
    // 2. 创建打卡记录（如果今日未打卡）
    if (!hasCheckedIn) {
      console.log('2. 创建打卡记录...');
      const createResult = await checkinAPI.createRecord(
        `测试打卡内容 - ${new Date().toLocaleTimeString()}`
      );
      console.log('创建打卡结果:', createResult);
    } else {
      console.log('2. 今日已打卡，跳过创建');
    }
    
    // 3. 获取打卡记录
    console.log('3. 获取打卡记录...');
    const getResult = await checkinAPI.getRecords({ limit: 5 });
    console.log('获取打卡记录:', getResult);
    
    return { success: true, message: '打卡 API 测试通过' };
    
  } catch (error) {
    console.error('打卡 API 测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试学习群组 API
export async function testStudyGroupAPI() {
  console.log('=== 测试学习群组 API ===');
  
  try {
    // 1. 获取群组列表
    console.log('1. 获取群组列表...');
    const getResult = await studyGroupAPI.getGroups({ limit: 10 });
    console.log('获取群组结果:', getResult);
    
    // 2. 如果有群组，尝试加入第一个
    if (getResult.success && getResult.data && getResult.data.length > 0) {
      console.log('2. 尝试加入群组...');
      const firstGroup = getResult.data[0];
      
      const joinResult = await studyGroupAPI.joinGroup(firstGroup.id);
      console.log('加入群组结果:', joinResult);
    } else {
      console.log('2. 暂无群组可加入');
    }
    
    return { success: true, message: '群组 API 测试通过' };
    
  } catch (error) {
    console.error('群组 API 测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 综合测试函数
export async function runAllTests() {
  console.log('=== 开始 Supabase 后端功能测试 ===');
  
  const results = [];
  
  // 测试用户 API
  const userResult = await testUserAPI();
  results.push({ name: '用户 API', ...userResult });
  
  // 等待 1 秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试打卡 API
  const checkinResult = await testCheckinAPI();
  results.push({ name: '打卡 API', ...checkinResult });
  
  // 等待 1 秒
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试群组 API
  const groupResult = await testStudyGroupAPI();
  results.push({ name: '群组 API', ...groupResult });
  
  console.log('=== 测试结果汇总 ===');
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.name}: ${result.success ? '✅ 通过' : '❌ 失败'}`);
    if (!result.success) {
      console.log(`   错误信息: ${result.error}`);
    }
  });
  
  const passedCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n测试完成: ${passedCount}/${totalCount} 通过`);
  
  return {
    success: passedCount === totalCount,
    results,
    summary: `${passedCount}/${totalCount} 测试通过`
  };
}

// 在页面中使用测试的示例代码
/*
// 在某个页面的 methods 中添加：
async onTestSupabase() {
  try {
    uni.showLoading({ title: '测试中...' });
    
    const testResult = await runAllTests();
    
    uni.hideLoading();
    
    uni.showModal({
      title: '测试结果',
      content: testResult.summary,
      showCancel: false
    });
    
  } catch (error) {
    uni.hideLoading();
    console.error('测试失败:', error);
    
    uni.showModal({
      title: '测试失败',
      content: error.message,
      showCancel: false
    });
  }
}
*/
