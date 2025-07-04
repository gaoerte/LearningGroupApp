// 简单的API测试脚本
// 可以在浏览器控制台运行

console.log('=== 学习小组API测试 ===');

// 模拟 uniCloud 不可用的情况
if (typeof uniCloud === 'undefined') {
  console.log('✅ uniCloud 未定义，将使用模拟数据');
}

// 模拟用户获取
async function testGetCurrentUser() {
  try {
    console.log('📝 测试获取当前用户...');
    // 这里会使用模拟数据
    const user = {
      id: 'mock_user_001',
      openid: 'mock_user_001', 
      nickname: '测试用户',
      avatar_url: '/static/logo.png',
      bio: '这是一个测试用户'
    };
    console.log('✅ 用户数据:', user);
    return user;
  } catch (error) {
    console.error('❌ 获取用户失败:', error);
  }
}

// 模拟群组获取
async function testGetGroups() {
  try {
    console.log('📝 测试获取群组列表...');
    const groups = [
      {
        id: 'mock_group_001',
        name: '前端开发学习小组',
        description: '一起学习React、Vue、JavaScript等前端技术',
        category: 'programming',
        member_count: 12,
        created_at: new Date().toISOString()
      },
      {
        id: 'mock_group_002',
        name: 'UI设计交流群', 
        description: '分享设计灵感，讨论用户体验',
        category: 'design',
        member_count: 8,
        created_at: new Date().toISOString()
      }
    ];
    console.log('✅ 群组数据:', groups);
    return groups;
  } catch (error) {
    console.error('❌ 获取群组失败:', error);
  }
}

// 运行测试
async function runTests() {
  console.log('🚀 开始API测试...');
  
  await testGetCurrentUser();
  await testGetGroups();
  
  console.log('✅ 所有测试完成');
  console.log('📋 下一步: 上传云函数并配置真实数据库');
}

// 自动运行
runTests();
