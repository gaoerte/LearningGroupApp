# 🚀 学习小组App开发行动计划

## 📋 当前状态评估
- ✅ 前端框架：uni-app 已配置完成
- ✅ 后端：Supabase 连接已调通
- ✅ 云函数：微信登录、数据代理已就绪
- ✅ 数据库设计：完整的表结构已设计完成
- ✅ 基础页面：首页、登录、测试页面已完成

## 🎯 推荐执行顺序

### 阶段1：基础设施部署（1-2天，立即开始）

#### 1.1 Supabase 项目初始化
```bash
# 在 Supabase Dashboard 中：
1. 创建新项目（如果还没有）
2. 获取项目 URL 和 API Key
3. 在 SQL 编辑器中执行 database/schema_optimized.sql
4. 配置 Row Level Security (RLS) 策略
```

#### 1.2 云函数部署
```bash
# 在项目根目录：
npm run copy-cloudfunctions

# 在微信开发者工具中：
右键 cloudfunctions 文件夹 → "上传并部署：云端安装依赖"
```

#### 1.3 环境配置
更新云函数环境变量：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

### 阶段2：核心功能开发（3-5天）

#### 2.1 微信登录完善 ⭐ 优先级最高
- 测试现有 `wechatLogin` 云函数
- 完善用户注册流程
- 实现自动登录和状态保持

#### 2.2 个人中心开发 ⭐ 次优先级
- 用户资料展示和编辑
- 头像上传功能
- 个人设置管理

#### 2.3 群组核心功能 ⭐ 核心业务
- 群组创建和搜索
- 加入/退出群组
- 群组列表展示

### 阶段3：互动功能开发（3-4天）

#### 3.1 打卡功能
- 日常打卡界面
- 图片上传和展示
- 打卡记录统计

#### 3.2 群聊功能
- 实时消息发送/接收
- 图片分享
- 消息历史

#### 3.3 AI 聊天
- 集成 DeepSeek API
- 聊天界面优化
- 对话历史管理

## 🔧 立即行动建议

### 今天就可以开始：

1. **部署 Supabase 数据库**
   ```sql
   -- 在 Supabase SQL 编辑器中执行
   -- 使用 /database/schema_optimized.sql
   ```

2. **测试微信登录流程**
   ```bash
   # 使用现有的测试页面验证
   首页 → "🛡️ 稳定版连接测试"
   ```

3. **创建第一个业务云函数**

### 需要立即创建的云函数：

#### `userProfile` - 用户资料管理
```javascript
// 处理用户注册、资料更新、获取用户信息
exports.main = async (event) => {
  const { action, openid, userInfo } = event;
  // action: 'register', 'update', 'get'
};
```

#### `groupManager` - 群组管理  
```javascript
// 处理群组创建、搜索、加入、退出
exports.main = async (event) => {
  const { action, groupInfo, userId } = event;
  // action: 'create', 'search', 'join', 'leave', 'list'
};
```

## 📱 前端页面优先级

### 立即开发：
1. **完善登录页面** (`pages/login/login.vue`)
2. **个人中心页面** (`pages/personalCenter/personalCenter.vue`)
3. **群组匹配页面** (`pages/groupMatch/groupMatch.vue`)

### 后续开发：
4. 打卡页面
5. 群聊页面  
6. AI聊天页面

## 🎪 本周目标

**周三前完成**：
- Supabase 数据库部署
- 微信登录流程测试
- 个人中心基础功能

**周末前完成**：
- 群组创建和搜索
- 用户资料编辑
- 基础的群组加入功能

---

## 💡 建议现在立即开始：

**第一步**：部署 Supabase 数据库
**第二步**：测试微信登录云函数
**第三步**：完善个人中心页面

这个顺序让您能快速看到成果，并为后续功能打下坚实基础！
