// 云函数登录测试工具
// 用于测试新的登录系统，确保所有功能正常工作

const testLoginSystem = {
  
  /**
   * 测试快速登录
   */
  async testQuickLogin() {
    console.log('🧪 测试快速登录功能...');
    
    try {
      // 导入UserAPI
      const { UserAPI } = require('../api/userAPI.js');
      
      // 生成测试openid
      const testOpenid = `test_${Date.now()}`;
      
      // 执行快速登录
      const result = await UserAPI.quickLogin(testOpenid);
      
      if (result.success) {
        console.log('✅ 快速登录测试通过');
        console.log('用户信息:', result.data.user);
        console.log('Token:', result.data.token);
        return { success: true, data: result.data };
      } else {
        console.log('❌ 快速登录测试失败:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ 快速登录测试异常:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 测试微信登录
   */
  async testWechatLogin() {
    console.log('🧪 测试微信登录功能...');
    
    try {
      // 导入UserAPI
      const { UserAPI } = require('../api/userAPI.js');
      
      // 模拟微信授权码
      const mockCode = `mock_code_${Date.now()}`;
      
      // 执行微信登录
      const result = await UserAPI.wechatLogin(mockCode);
      
      if (result.success) {
        console.log('✅ 微信登录测试通过');
        console.log('用户信息:', result.data.user);
        console.log('Token:', result.data.token);
        return { success: true, data: result.data };
      } else {
        console.log('❌ 微信登录测试失败:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ 微信登录测试异常:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 测试本地存储
   */
  async testLocalStorage() {
    console.log('🧪 测试本地存储功能...');
    
    try {
      // 导入StorageManager
      const { StorageManager } = require('../utils/storage.js');
      
      // 创建测试登录数据
      const testLoginData = {
        user: {
          id: 'test_user_123',
          openid: 'test_openid_123',
          nickname: '测试用户',
          avatar_url: ''
        },
        openid: 'test_openid_123',
        token: 'test_token_123',
        login_time: new Date().toISOString()
      };
      
      // 保存登录数据
      const saveResult = StorageManager.saveLoginData(testLoginData);
      console.log('保存结果:', saveResult);
      
      // 检查登录状态
      const isLoggedIn = StorageManager.isLoggedIn();
      console.log('登录状态:', isLoggedIn);
      
      // 获取用户信息
      const userInfo = StorageManager.getUserInfo();
      console.log('用户信息:', userInfo);
      
      // 获取Token
      const token = StorageManager.getToken();
      console.log('Token:', token);
      
      if (isLoggedIn && userInfo && token) {
        console.log('✅ 本地存储测试通过');
        return { success: true };
      } else {
        console.log('❌ 本地存储测试失败');
        return { success: false, error: '存储数据不完整' };
      }
    } catch (error) {
      console.error('❌ 本地存储测试异常:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始运行登录系统完整测试...');
    console.log('='.repeat(50));
    
    const results = {
      quickLogin: await this.testQuickLogin(),
      wechatLogin: await this.testWechatLogin(),
      localStorage: await this.testLocalStorage()
    };
    
    console.log('📊 测试结果汇总:');
    console.log('='.repeat(50));
    
    let passedTests = 0;
    let totalTests = 0;
    
    Object.entries(results).forEach(([testName, result]) => {
      totalTests++;
      if (result.success) {
        passedTests++;
        console.log(`✅ ${testName}: 通过`);
      } else {
        console.log(`❌ ${testName}: 失败 - ${result.error}`);
      }
    });
    
    console.log('='.repeat(50));
    console.log(`📈 测试通过率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！登录系统准备就绪！');
    } else {
      console.log('⚠️  部分测试失败，请检查相关功能。');
    }
    
    return {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        passRate: Math.round(passedTests/totalTests*100)
      },
      details: results
    };
  }
};

// 导出测试工具
module.exports = testLoginSystem;

// 如果直接运行此文件，自动执行测试
if (require.main === module) {
  testLoginSystem.runAllTests().catch(console.error);
}
