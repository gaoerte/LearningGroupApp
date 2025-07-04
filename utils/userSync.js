/**
 * 用户同步工具 - 确保本地用户与Supabase数据库同步
 */

/**
 * 检查当前用户是否在Supabase中存在
 * @returns {Promise<boolean>} 是否存在
 */
export async function checkUserInSupabase() {
  try {
    const userInfo = uni.getStorageSync('user_info');
    if (!userInfo || !userInfo.openid) {
      console.log('[用户同步] 本地无用户信息');
      return false;
    }
    
    console.log('[用户同步] 检查用户是否存在:', userInfo.openid);
    
    const result = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'getUserInfo',
          openid: userInfo.openid
        },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        fail: (error) => {
          console.error('[用户同步] 检查用户失败:', error);
          resolve(false);
        }
      });
    });
    
    console.log('[用户同步] 用户存在检查结果:', result);
    return result;
    
  } catch (error) {
    console.error('[用户同步] 检查用户异常:', error);
    return false;
  }
}

/**
 * 同步当前用户到Supabase
 * @returns {Promise<Object>} 同步结果
 */
export async function syncUserToSupabase() {
  try {
    const userInfo = uni.getStorageSync('user_info');
    if (!userInfo || !userInfo.openid) {
      throw new Error('本地无用户信息');
    }
    
    console.log('[用户同步] 开始同步用户到Supabase:', userInfo);
    
    const result = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'createUser',
          openid: userInfo.openid,
          nickname: userInfo.nickname || userInfo.name || '微信用户',
          avatarUrl: userInfo.avatar_url || userInfo.avatarUrl || '',
          bio: userInfo.bio || ''
        },
        success: (res) => {
          if (res.result && res.result.success) {
            console.log('[用户同步] 用户同步成功:', res.result.data);
            resolve(res.result.data);
          } else {
            reject(new Error(res.result?.error || '同步用户失败'));
          }
        },
        fail: (error) => {
          console.error('[用户同步] 同步用户失败:', error);
          reject(error);
        }
      });
    });
    
    return result;
    
  } catch (error) {
    console.error('[用户同步] 同步用户异常:', error);
    throw error;
  }
}

/**
 * 确保用户已同步（检查+同步）
 * @returns {Promise<Object>} 用户信息
 */
export async function ensureUserSynced() {
  try {
    console.log('[用户同步] 开始确保用户已同步');
    
    // 1. 检查用户是否存在
    const exists = await checkUserInSupabase();
    
    if (exists) {
      console.log('[用户同步] 用户已存在，无需同步');
      return uni.getStorageSync('user_info');
    }
    
    // 2. 用户不存在，进行同步
    console.log('[用户同步] 用户不存在，开始同步...');
    const syncResult = await syncUserToSupabase();
    
    // 3. 更新本地用户信息
    const currentUserInfo = uni.getStorageSync('user_info');
    const updatedUserInfo = Object.assign({}, currentUserInfo, syncResult);
    uni.setStorageSync('user_info', updatedUserInfo);
    
    console.log('[用户同步] 用户同步完成:', updatedUserInfo);
    return updatedUserInfo;
    
  } catch (error) {
    console.error('[用户同步] 确保用户同步失败:', error);
    throw error;
  }
}

/**
 * 在页面加载时自动检查和同步用户
 * 建议在主要页面的onLoad中调用
 */
export async function autoSyncUser() {
  try {
    console.log('[用户同步] 自动检查用户同步状态');
    
    const token = uni.getStorageSync('user_token');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    
    if (!token || !isLoggedIn) {
      console.log('[用户同步] 用户未登录，跳过同步');
      return null;
    }
    
    const result = await ensureUserSynced();
    console.log('[用户同步] 自动同步完成');
    return result;
    
  } catch (error) {
    console.warn('[用户同步] 自动同步失败，但不影响页面功能:', error.message);
    return null;
  }
}

/**
 * 一键修复用户同步问题
 * 可在开发调试时使用
 */
export async function fixUserSync() {
  try {
    console.log('=== 开始修复用户同步问题 ===');
    
    // 1. 检查本地登录状态
    const token = uni.getStorageSync('user_token');
    const userInfo = uni.getStorageSync('user_info');
    const isLoggedIn = uni.getStorageSync('is_logged_in');
    
    console.log('本地状态检查:');
    console.log('- Token:', token ? '存在' : '不存在');
    console.log('- UserInfo:', userInfo);
    console.log('- IsLoggedIn:', isLoggedIn);
    
    if (!token || !userInfo || !isLoggedIn) {
      throw new Error('用户未登录，请先登录');
    }
    
    // 2. 检查Supabase中的用户
    const exists = await checkUserInSupabase();
    console.log('Supabase用户存在:', exists);
    
    if (!exists) {
      // 3. 同步用户
      console.log('开始同步用户到Supabase...');
      const syncResult = await syncUserToSupabase();
      console.log('✅ 用户同步成功:', syncResult);
      
      // 4. 更新本地信息
      const updatedUserInfo = Object.assign({}, userInfo, syncResult);
      uni.setStorageSync('user_info', updatedUserInfo);
      console.log('✅ 本地用户信息已更新');
    } else {
      console.log('✅ 用户已存在，无需同步');
    }
    
    console.log('=== 用户同步问题修复完成 ===');
    
    uni.showToast({
      title: '用户同步修复完成',
      icon: 'success'
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ 修复用户同步失败:', error);
    
    uni.showToast({
      title: '修复失败: ' + error.message,
      icon: 'none',
      duration: 3000
    });
    
    return false;
  }
}
