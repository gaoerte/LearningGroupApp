/**
 * 快速测试用户同步功能
 * 运行此脚本验证 openid + Supabase 认证是否正常工作
 */

// 模拟用户信息
const testUsers = [
  {
    openid: 'test_user_001',
    nickname: '测试用户001',
    avatar_url: '/static/avatar1.png'
  },
  {
    openid: 'test_user_002', 
    nickname: '测试用户002',
    avatar_url: '/static/avatar2.png'
  }
]

/**
 * 测试用户同步到Supabase
 */
async function testUserSync() {
  console.log('=== 开始测试用户同步功能 ===')
  
  for (const testUser of testUsers) {
    try {
      console.log(`\n测试用户: ${testUser.nickname} (${testUser.openid})`)
      
      // 1. 先检查用户是否存在
      console.log('1. 检查用户是否存在...')
      const checkResult = await new Promise((resolve, reject) => {
        uniCloud.callFunction({
          name: 'learningGroupAPI',
          data: {
            action: 'getUserInfo',
            openid: testUser.openid
          },
          success: (res) => {
            if (res.result && res.result.success) {
              console.log('✅ 用户已存在:', res.result.data)
              resolve(true)
            } else {
              console.log('ℹ️  用户不存在，需要创建')
              resolve(false)
            }
          },
          fail: (error) => {
            console.error('❌ 检查用户失败:', error)
            resolve(false)
          }
        })
      })
      
      // 2. 如果用户不存在，创建用户
      if (!checkResult) {
        console.log('2. 创建用户...')
        const createResult = await new Promise((resolve, reject) => {
          uniCloud.callFunction({
            name: 'learningGroupAPI',
            data: {
              action: 'createUser',
              openid: testUser.openid,
              nickname: testUser.nickname,
              avatarUrl: testUser.avatar_url,
              bio: `这是${testUser.nickname}的测试账号`
            },
            success: (res) => {
              if (res.result && res.result.success) {
                console.log('✅ 用户创建成功:', res.result.data)
                resolve(res.result.data)
              } else {
                console.error('❌ 用户创建失败:', res.result?.error)
                reject(new Error(res.result?.error || '创建失败'))
              }
            },
            fail: (error) => {
              console.error('❌ 创建用户失败:', error)
              reject(error)
            }
          })
        })
        
        console.log(`✅ ${testUser.nickname} 同步完成`)
      } else {
        console.log(`✅ ${testUser.nickname} 已存在，无需同步`)
      }
      
    } catch (error) {
      console.error(`❌ ${testUser.nickname} 同步失败:`, error.message)
    }
  }
  
  console.log('\n=== 用户同步测试完成 ===')
}

/**
 * 测试创建群组（验证用户存在后的功能）
 */
async function testCreateGroup() {
  console.log('\n=== 开始测试创建群组功能 ===')
  
  const testGroup = {
    name: '测试学习小组',
    description: '这是一个用于测试的学习小组',
    category: 'programming',
    isPublic: true,
    maxMembers: 50,
    creatorOpenid: testUsers[0].openid
  }
  
  try {
    console.log('创建测试群组:', testGroup)
    
    const result = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: Object.assign({ action: 'createGroup' }, testGroup),
        success: (res) => {
          if (res.result && res.result.success) {
            console.log('✅ 群组创建成功:', res.result.data)
            resolve(res.result.data)
          } else {
            console.error('❌ 群组创建失败:', res.result?.error)
            reject(new Error(res.result?.error || '创建失败'))
          }
        },
        fail: (error) => {
          console.error('❌ 群组创建失败:', error)
          reject(error)
        }
      })
    })
    
    console.log('✅ 群组创建测试完成')
    return result
    
  } catch (error) {
    console.error('❌ 群组创建测试失败:', error.message)
    throw error
  }
}

/**
 * 完整测试流程
 */
async function runFullTest() {
  try {
    // 1. 测试用户同步
    await testUserSync()
    
    // 2. 测试创建群组
    await testCreateGroup()
    
    console.log('\n🎉 所有测试完成！openid + Supabase 认证功能正常')
    
    uni.showModal({
      title: '测试完成',
      content: '用户同步和群组创建功能测试通过！',
      showCancel: false
    })
    
  } catch (error) {
    console.error('🚫 测试失败:', error.message)
    
    uni.showModal({
      title: '测试失败',
      content: `测试过程中出现错误: ${error.message}`,
      showCancel: false
    })
  }
}

/**
 * 检查当前登录用户的同步状态
 */
async function checkCurrentUserSync() {
  try {
    console.log('=== 检查当前用户同步状态 ===')
    
    // 获取本地用户信息
    const token = uni.getStorageSync('user_token')
    const userInfo = uni.getStorageSync('user_info')
    const isLoggedIn = uni.getStorageSync('is_logged_in')
    
    console.log('本地登录状态:')
    console.log('- Token:', token ? '存在' : '不存在')
    console.log('- UserInfo:', userInfo)
    console.log('- IsLoggedIn:', isLoggedIn)
    
    if (!token || !userInfo || !isLoggedIn) {
      throw new Error('用户未登录，请先登录')
    }
    
    if (!userInfo.openid) {
      throw new Error('用户信息缺少openid')
    }
    
    // 检查Supabase中的用户
    console.log('\n检查Supabase中的用户...')
    const exists = await new Promise((resolve, reject) => {
      uniCloud.callFunction({
        name: 'learningGroupAPI',
        data: {
          action: 'getUserInfo',
          openid: userInfo.openid
        },
        success: (res) => {
          if (res.result && res.result.success) {
            console.log('✅ 用户存在于Supabase:', res.result.data)
            resolve(true)
          } else {
            console.log('ℹ️  用户不存在于Supabase')
            resolve(false)
          }
        },
        fail: (error) => {
          console.error('❌ 检查用户失败:', error)
          resolve(false)
        }
      })
    })
    
    if (!exists) {
      console.log('\n用户不存在，开始同步...')
      await new Promise((resolve, reject) => {
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
              console.log('✅ 当前用户同步成功:', res.result.data)
              resolve(res.result.data)
            } else {
              reject(new Error(res.result?.error || '同步失败'))
            }
          },
          fail: (error) => {
            console.error('❌ 同步用户失败:', error)
            reject(error)
          }
        })
      })
    }
    
    console.log('✅ 当前用户同步状态正常')
    
    uni.showToast({
      title: '用户同步状态正常',
      icon: 'success'
    })
    
  } catch (error) {
    console.error('❌ 检查当前用户同步状态失败:', error)
    
    uni.showToast({
      title: '同步状态检查失败: ' + error.message,
      icon: 'none',
      duration: 3000
    })
  }
}

// 导出测试函数
module.exports = {
  testUserSync,
  testCreateGroup,
  runFullTest,
  checkCurrentUserSync
}

// 如果在浏览器环境，添加到全局对象
if (typeof window !== 'undefined') {
  window.userSyncTest = {
    testUserSync,
    testCreateGroup,
    runFullTest,
    checkCurrentUserSync
  }
}

console.log('📋 用户同步测试脚本已加载')
console.log('可用的测试函数:')
console.log('- testUserSync(): 测试用户同步')
console.log('- testCreateGroup(): 测试创建群组')
console.log('- runFullTest(): 运行完整测试')
console.log('- checkCurrentUserSync(): 检查当前用户同步状态')
