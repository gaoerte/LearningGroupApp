// api/userAPI.js - 用户相关API封装

/**
 * 用户API类
 */
class UserAPI {
  
  /**
   * 微信登录
   */
  static async wxLogin() {
    return new Promise((resolve, reject) => {
      uni.login({
        success: (res) => {
          if (res.code) {
            // 调用云函数进行登录
            uni.cloud.callFunction({
              name: 'wechatLogin',
              data: { code: res.code },
              success: (cloudRes) => {
                console.log('微信登录成功:', cloudRes.result);
                resolve(cloudRes.result);
              },
              fail: (error) => {
                console.error('微信登录失败:', error);
                reject(error);
              }
            });
          } else {
            reject(new Error('获取微信授权码失败'));
          }
        },
        fail: (error) => {
          reject(error);
        }
      });
    });
  }

  /**
   * 注册用户
   */
  static async register(openid, userInfo) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'register',
          openid: openid,
          userInfo: userInfo
        },
        success: (res) => {
          console.log('用户注册成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('用户注册失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(openid, userInfo) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'update',
          openid: openid,
          userInfo: userInfo
        },
        success: (res) => {
          console.log('用户信息更新成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('用户信息更新失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 获取用户信息
   */
  static async getProfile(openid) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'get',
          openid: openid
        },
        success: (res) => {
          console.log('获取用户信息成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('获取用户信息失败:', error);
          reject(error);
        }
      });
    });
  }

  /**
   * 上传头像
   */
  static async uploadAvatar(openid, avatarData) {
    return new Promise((resolve, reject) => {
      uni.cloud.callFunction({
        name: 'userProfile',
        data: {
          action: 'uploadAvatar',
          openid: openid,
          userInfo: { avatarData: avatarData }
        },
        success: (res) => {
          console.log('头像上传成功:', res.result);
          resolve(res.result);
        },
        fail: (error) => {
          console.error('头像上传失败:', error);
          reject(error);
        }
      });
    });
  }
}

export { UserAPI };
