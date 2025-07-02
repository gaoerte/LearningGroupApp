# 云函数上传问题排查指南

## 问题1：云函数上传失败的排查步骤

### 步骤1：检查微信开发者工具配置
1. 打开微信开发者工具
2. 确保已登录微信开发者账号
3. 确保项目已关联到正确的小程序 AppID
4. 检查云开发环境是否已开通：
   - 点击"云开发" -> "云开发控制台"
   - 确保有可用的云环境（如 cloud1-xxx）

### 步骤2：检查manifest.json云开发配置
确保您的 `manifest.json` 文件包含云开发配置：

```json
{
  "mp-weixin": {
    "cloudfunctionRoot": "cloudfunctions/",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "enhance": true,
      "postcss": true,
      "preloadBackgroundData": false,
      "minified": true,
      "newFeature": true,
      "coverView": true,
      "nodeModules": true,
      "autoAudits": false,
      "showShadowRootInWxmlPanel": true,
      "scopeDataCheck": false,
      "uglifyFileName": false,
      "checkInvalidKey": true,
      "checkSiteMap": true,
      "uploadWithSourceMap": true,
      "compileHotReLoad": false,
      "babelSetting": {
        "ignore": [],
        "disablePlugins": [],
        "outputPath": ""
      }
    }
  }
}
```

### 步骤3：手动上传云函数
1. 在微信开发者工具中，右键点击 `cloudfunctions/supabaseProxy` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 等待上传完成，查看控制台输出

### 步骤4：常见错误及解决方法

#### 错误1：函数名重复
- 解决：在云开发控制台删除同名函数后重新上传

#### 错误2：依赖安装失败
- 解决：使用"上传并部署：云端安装依赖"而不是"创建并部署"

#### 错误3：权限问题
- 解决：确保微信开发者账号有云开发权限

#### 错误4：文件过大
- 解决：检查是否包含了不必要的文件（如node_modules）

### 步骤5：验证云函数部署
1. 在微信开发者工具的"云开发"面板中查看函数列表
2. 点击函数名进入详情页
3. 在"测试"选项卡中测试函数调用

---

## 问题2：测试页面"测试连接"按钮找不到的排查

### 可能原因1：页面未正确编译
1. 重新编译项目（微信开发者工具中 Ctrl+Shift+R）
2. 清除缓存后重新编译

### 可能原因2：页面路径错误
确保通过以下方式访问测试页面：
- 在首页点击底部的"调试"按钮
- 或直接在地址栏输入：`pages/test/supabaseTestBasic`

### 可能原因3：样式问题导致按钮不可见
检查按钮是否被其他元素遮挡或样式异常

### 可能原因4：条件渲染问题
检查按钮是否被 v-if 等条件隐藏

---

## 调试建议

### 1. 启用调试模式
在首页添加调试入口，直接跳转到测试页面

### 2. 检查控制台输出
打开微信开发者工具的控制台，查看是否有错误信息

### 3. 逐步测试
先测试基础功能，再测试复杂功能

### 4. 使用真机调试
在真机上测试，排除模拟器环境问题
