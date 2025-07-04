// 测试 API 导入
console.log('开始测试 API 导入...')

try {
  // 模拟 uni-app 环境
  global.uniCloud = {
    callFunction: function(params) {
      console.log('模拟 uniCloud.callFunction 调用:', params)
      return Promise.resolve({
        result: {
          success: true,
          data: { message: '测试成功' }
        }
      })
    }
  }
  
  // 导入 API
  const learningGroupAPI = require('./api/learning-group-api.js')
  
  console.log('API 导入成功:', typeof learningGroupAPI)
  console.log('API 方法检查:')
  console.log('- getCurrentUser:', typeof learningGroupAPI.getCurrentUser)
  console.log('- getGroups:', typeof learningGroupAPI.getGroups)
  console.log('- createGroup:', typeof learningGroupAPI.createGroup)
  console.log('- isLoggedIn:', typeof learningGroupAPI.isLoggedIn)
  
  // 测试基本调用
  learningGroupAPI.initCurrentUser().then(() => {
    console.log('API 测试成功')
  }).catch(err => {
    console.error('API 测试失败:', err)
  })
  
} catch (error) {
  console.error('API 导入失败:', error)
}
