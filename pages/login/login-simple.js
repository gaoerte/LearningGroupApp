// 临时的简化登录页面，用于测试
import config from "../../config";

export default {
  data() {
    return {
      isLoading: false,
      error: null
    };
  },
  methods: {
    async wechatLogin() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 1. 获取微信登录凭证
        const loginRes = await new Promise((resolve, reject) => {
          wx.login({
            success: resolve,
            fail: reject
          });
        });
        
        console.log('获取微信code:', loginRes.code);
        
        // 2. 简化登录流程 - 直接存储 token 并跳转
        wx.setStorageSync('token', 'temp_token_' + Date.now());
        wx.setStorageSync('user_id', 'temp_user');
        wx.setStorageSync('openid', 'temp_openid');
        
        console.log('登录成功');
        
        // 3. 跳转到首页
        wx.switchTab({ url: '/pages/index/index' });
        
      } catch (err) {
        console.error('登录失败:', err);
        this.error = err.message || '登录失败';
        wx.showToast({
          title: this.error,
          icon: 'none',
          duration: 3000
        });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
