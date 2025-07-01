import config from "../../config";
import { initSupabaseClient } from '../../common/supabase'; // 新增工具函数

Page({
  data: {
    isLoggedIn: false,
    isLoading: false,
    error: null
  },

  onLoad() {
    this.checkLoginStatus();
  },

  // 检查用户是否已经登录
  checkLoginStatus() {
    const token = wx.getStorageSync('supabase_token');
    if (token) {
      this.setData({ isLoggedIn: true });
      wx.redirectTo({ url: '/pages/index/index' }); // 已登录，跳转到首页
    }
  },

  // 微信登录，获取 code
  wechatLogin() {
    this.setData({ isLoading: true, error: null });
    
    wx.login({
      success: (res) => {
        if (res.code) {
          this.getSupabaseToken(res.code);
        } else {
          console.log('微信登录失败！' + res.errMsg);
          this.setData({
            error: '微信登录失败',
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('微信登录失败', err);
        this.setData({
          error: '微信登录失败',
          isLoading: false
        });
      }
    });
  },

  // 获取 Supabase Token
  getSupabaseToken(code) {
    wx.cloud.callFunction({
      name: 'wechatLogin', // 修改为正确的云函数名称
      data: { code: code },
      success: (response) => {
        const result = response.result;
        console.log('云函数响应:', result);
        
        if (result && result.access_token) {
          const { access_token, user_id, openid } = result;
          
          // 存储认证信息
          wx.setStorageSync('supabase_token', access_token);
          wx.setStorageSync('user_id', user_id);
          wx.setStorageSync('openid', openid);
          
          console.log('登录成功:', { user_id, openid });
          
          // 初始化 Supabase 客户端
          const supabase = initSupabaseClient(access_token);
          
          // 验证用户会话
          this.verifySupabaseSession(supabase);
        } else {
          const errorMsg = result?.error || '登录失败';
          console.error('登录失败', errorMsg);
          this.setData({
            error: errorMsg,
            isLoading: false
          });
        }
      },
      fail: (err) => {
        console.error('云函数调用失败', err);
        this.setData({
          error: '登录失败，请重试',
          isLoading: false
        });
      }
    });
  },
  
  // 验证 Supabase 会话
  verifySupabaseSession(supabase) {
    supabase.auth.getUser()
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase 认证错误:', error);
          this.setData({
            error: 'Supabase 认证失败',
            isLoading: false
          });
        } else if (data.user) {
          console.log('用户会话验证成功:', data.user);
          this.setData({ isLoading: false });
          wx.redirectTo({ url: '/pages/index/index' });
        } else {
          console.error('用户会话验证失败');
          this.setData({
            error: '用户验证失败',
            isLoading: false
          });
        }
      })
      .catch(err => {
        console.error('会话验证失败:', err);
        this.setData({
          error: '认证失败，请重试',
          isLoading: false
        });
      });
  }
});