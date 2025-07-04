# 🚀 uniCloud 云函数部署指南

## 第一步：初始化uniCloud项目

### 1. 在HBuilderX中配置uniCloud

1. **右键点击项目根目录**
2. **选择 "创建uniCloud云开发环境"**
3. **选择服务商**：
   - 阿里云（推荐，免费额度更多）
   - 腾讯云
4. **选择 "创建免费版"**
5. **等待创建完成**

### 2. 关联云服务空间

1. **右键 `uniCloud` 目录**
2. **选择 "关联云服务空间或项目"**  
3. **选择刚创建的服务空间**
4. **确认关联成功**

## 第二步：创建和上传云函数

### 1. 创建supabaseTest云函数

```bash
# 目录结构应该是这样的：
uniCloud/
  cloudfunctions/
    supabaseTest/
      index.js      # 云函数代码
      package.json  # 依赖配置
```

### 2. 上传云函数到uniCloud

在HBuilderX中：

1. **右键 `cloudfunctions/supabaseTest` 目录**
2. **选择 "上传并部署"**
3. **等待上传完成**

### 3. 安装云函数依赖

有两种方式安装依赖：

#### 方式一：通过HBuilderX（推荐）
1. **右键 `supabaseTest` 目录**
2. **选择 "管理公共模块或扩展库依赖"**
3. **添加依赖 `@supabase/supabase-js`**
4. **选择版本（建议 ^2.39.0）**
5. **点击 "确定" 安装**

#### 方式二：通过uniCloud Web控制台
1. **登录 [uniCloud控制台](https://unicloud.dcloud.net.cn/)**
2. **进入你的服务空间**
3. **点击 "云函数"**
4. **找到 `supabaseTest` 函数**
5. **点击 "依赖管理"**
6. **添加依赖：`@supabase/supabase-js: ^2.39.0`**
7. **保存并等待安装完成**

## 第三步：测试云函数

### 1. 简单测试

在HBuilderX控制台运行：

```javascript
// 测试云函数基础连接
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { action: 'ping' },
  success: (res) => {
    console.log('✅ 云函数测试成功:', res.result);
  },
  fail: (error) => {
    console.error('❌ 云函数测试失败:', error);
  }
});
```

### 2. 在页面中测试

将以下代码添加到任意页面的方法中：

```javascript
async testCloudFunction() {
  try {
    const result = await uni.cloud.callFunction({
      name: 'supabaseTest',
      data: { action: 'ping' }
    });
    
    console.log('云函数响应:', result.result);
    
    if (result.result.success) {
      uni.showToast({
        title: '云函数连接成功！',
        icon: 'success'
      });
    } else {
      uni.showToast({
        title: '连接失败: ' + result.result.error,
        icon: 'error'
      });
    }
  } catch (error) {
    console.error('调用失败:', error);
    uni.showToast({
      title: '调用失败: ' + error.message,
      icon: 'error'
    });
  }
}
```

## 第四步：配置Supabase连接

### 1. 更新云函数中的Supabase配置

确保 `cloudfunctions/supabaseTest/index.js` 中的配置正确：

```javascript
// 在index.js顶部
const SUPABASE_URL = 'https://klpseujbhwvifsfshfdx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // 你的完整密钥
```

### 2. 重新上传云函数

每次修改代码后都需要重新上传：

1. **右键 `supabaseTest` 目录**
2. **选择 "上传并部署"**
3. **等待部署完成**

## 第五步：常见问题解决

### 问题1：云函数上传失败

**解决方案：**
```bash
# 检查网络连接
# 确保HBuilderX版本最新
# 重试上传，有时网络问题导致
```

### 问题2：依赖安装失败

**解决方案：**
```bash
# 方法1：删除云函数重新创建
# 方法2：手动在控制台安装依赖
# 方法3：使用较低版本的依赖包
```

### 问题3：云函数调用超时

**解决方案：**
```javascript
// 在uni.cloud.callFunction中增加超时时间
uni.cloud.callFunction({
  name: 'supabaseTest',
  data: { action: 'ping' },
  timeout: 30000, // 30秒超时
  success: (res) => {
    // 处理结果
  }
});
```

### 问题4：权限错误

**解决方案：**
1. **检查服务空间状态**
2. **确认账号权限**
3. **重新关联服务空间**

## 第六步：部署完成验证

### 验证清单：
- [ ] ✅ uniCloud服务空间创建成功
- [ ] ✅ 云函数上传成功
- [ ] ✅ 依赖安装成功 (`@supabase/supabase-js`)
- [ ] ✅ 基础ping测试通过
- [ ] ✅ Supabase连接测试通过
- [ ] ✅ 数据库查询测试通过

### 最终测试命令：

```javascript
// 在聊天页面点击🔗按钮，或在控制台运行：
const { SupabaseSetupHelper } = require('../../utils/supabase-setup-helper.js');
const helper = new SupabaseSetupHelper();
const results = await helper.runFullConnectionTest();
console.log('完整测试结果:', results);
```

## 🎉 部署成功标志

当你看到以下日志时，说明部署成功：

```
✅ 云函数连接成功
✅ 认证测试成功  
✅ 数据库查询成功
📊 测试完成: 通过 3/5 项测试
🎉 连接配置成功！可以开始使用真实数据了
```

## 📞 需要帮助？

如果遇到问题，请提供：
1. **错误截图**
2. **控制台完整错误信息** 
3. **HBuilderX版本号**
4. **操作系统信息**

我会立即协助你解决！🚀
