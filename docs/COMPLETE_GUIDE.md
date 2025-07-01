# 学习小组App - 完整部署和使用指南

## 🎯 数据结构设计理念

### 渐进式设计原则

我们采用了渐进式的数据结构设计，分为5个阶段：

1. **阶段一**：核心用户和认证功能
2. **阶段二**：打卡功能  
3. **阶段三**：学习群组功能
4. **阶段四**：AI聊天功能
5. **阶段五**：匹配和推荐系统

### 数据结构特点

✅ **简化但完整**：包含核心业务所需的所有字段
✅ **性能优化**：添加了必要的索引和触发器
✅ **安全可靠**：完整的RLS安全策略
✅ **易于扩展**：预留了扩展字段和功能
✅ **用户友好**：支持社交功能（点赞、评论）

## 🚀 快速部署指南

### 1. 配置 Supabase

```bash
# 1. 访问 https://supabase.com/ 创建项目
# 2. 在 SQL Editor 中执行以下脚本
```

选择使用的数据库脚本：
- `database/schema_simplified.sql` - **推荐使用**，渐进式设计
- `database/schema_optimized.sql` - 完整版，功能更丰富

### 2. 更新云函数配置

在 `cloudfunctions/userData/index.js` 中更新 Supabase 配置：

```javascript
const SUPABASE_CONFIG = {
  url: 'https://your-project-id.supabase.co',
  serviceKey: 'your-service-role-key' // 注意：使用 service_role key
};
```

### 3. 部署云函数

在微信开发者工具中：
1. 右键 `cloudfunctions` 目录
2. 选择"上传并部署（云端安装依赖）"
3. 等待部署完成

### 4. 测试功能

运行测试文件验证功能：

```javascript
// 在某个页面中测试
import { runAllTests } from '@/test/supabase-test.js';

async function testBackend() {
  const result = await runAllTests();
  console.log('测试结果:', result);
}
```

## 📚 API 使用示例

### 用户管理

```javascript
import { userAPI, supabaseHelper } from '@/api/supabase.js';

// 登录后初始化用户
async function handleLogin(userInfo) {
  try {
    const result = await supabaseHelper.initializeUser(userInfo);
    console.log('用户初始化成功:', result);
  } catch (error) {
    console.error('初始化失败:', error);
  }
}

// 更新用户信息
async function updateProfile(userData) {
  const result = await userAPI.updateProfile({
    nickname: '新昵称',
    bio: '个人简介'
  });
}

// 更新用户偏好
async function updateSettings() {
  await userAPI.updatePreferences({
    notification_enabled: true,
    reminder_time: '20:00:00',
    privacy_level: 'public'
  });
}
```

### 打卡功能

```javascript
import { checkinAPI, supabaseHelper } from '@/api/supabase.js';

// 创建打卡记录
async function createCheckin() {
  // 验证打卡内容
  const validation = supabaseHelper.validateCheckinContent(content);
  if (!validation.valid) {
    uni.showToast({ title: validation.message, icon: 'none' });
    return;
  }
  
  // 检查今日是否已打卡
  const hasCheckedIn = await supabaseHelper.checkTodayCheckin();
  if (hasCheckedIn) {
    uni.showToast({ title: '今日已打卡', icon: 'none' });
    return;
  }
  
  // 创建打卡记录
  const result = await checkinAPI.createRecord('今日学习心得', {
    mood: 'motivated',
    study_duration: 120, // 2小时
    tags: ['编程', 'Vue'],
    images: ['image_url_1', 'image_url_2']
  });
  
  if (result.success) {
    uni.showToast({ title: '打卡成功' });
  }
}

// 获取公开打卡记录
async function loadPublicCheckins() {
  const result = await checkinAPI.getPublicRecords({ limit: 20 });
  return result.success ? result.data : [];
}

// 点赞打卡
async function likeCheckin(checkinId) {
  const result = await checkinAPI.likeRecord(checkinId);
  if (result.success) {
    uni.showToast({ title: '点赞成功' });
  }
}
```

### 学习群组

```javascript
import { studyGroupAPI, supabaseHelper } from '@/api/supabase.js';

// 创建学习群组
async function createGroup() {
  const groupData = {
    name: '前端学习小组',
    description: '一起学习前端技术',
    category: '编程开发',
    max_members: 15,
    is_public: true
  };
  
  // 验证群组数据
  const validation = supabaseHelper.validateGroupData(groupData);
  if (!validation.valid) {
    uni.showToast({ 
      title: validation.errors.join(', '), 
      icon: 'none' 
    });
    return;
  }
  
  const result = await studyGroupAPI.createGroup(groupData);
  if (result.success) {
    uni.showToast({ title: '创建成功' });
  }
}

// 获取推荐群组
async function loadRecommendedGroups() {
  const groups = await supabaseHelper.getRecommendedGroups(10);
  return groups;
}

// 加入群组
async function joinGroup(groupId) {
  const result = await studyGroupAPI.joinGroup(groupId);
  if (result.success) {
    uni.showToast({ title: '加入成功' });
  } else {
    uni.showToast({ 
      title: result.error || '加入失败', 
      icon: 'none' 
    });
  }
}
```

### AI聊天

```javascript
import { chatAPI } from '@/api/supabase.js';

// 发送消息
async function sendMessage(message, type = 'general') {
  const result = await chatAPI.sendMessage(message, type);
  
  if (result.success) {
    return {
      userMessage: result.data.user_message,
      aiResponse: result.data.ai_response,
      timestamp: result.data.created_at
    };
  }
  
  throw new Error(result.error);
}

// 获取聊天历史
async function loadChatHistory() {
  const result = await chatAPI.getHistory({ limit: 50 });
  return result.success ? result.data : [];
}
```

### 匹配系统

```javascript
import { matchAPI, userAPI } from '@/api/supabase.js';

// 更新用户兴趣
async function updateInterests() {
  const interests = [
    { name: 'JavaScript', level: 'intermediate' },
    { name: 'Vue.js', level: 'beginner' },
    { name: '前端开发', level: 'intermediate' }
  ];
  
  await userAPI.updateInterests(interests);
}

// 创建匹配请求
async function createMatchRequest() {
  const result = await matchAPI.createRequest({
    interests: ['编程', '前端', 'Vue'],
    study_goals: '希望能够深入学习前端技术，找到志同道合的学习伙伴',
    preferred_group_size: 8
  });
  
  if (result.success) {
    uni.showToast({ title: '匹配请求已提交' });
  }
}
```

## 🎨 前端页面集成示例

### 完整的打卡页面

```vue
<template>
  <view class="checkin-page">
    <!-- 今日状态 -->
    <view class="status-card">
      <view v-if="todayCheckin" class="checked-status">
        <text class="status-icon">✅</text>
        <text class="status-text">今日已打卡</text>
        <text class="checkin-content">{{ todayCheckin.content }}</text>
      </view>
      
      <view v-else class="unchecked-status">
        <text class="status-icon">📝</text>
        <text class="status-text">今日还未打卡</text>
      </view>
    </view>
    
    <!-- 打卡表单 -->
    <view v-if="!todayCheckin" class="checkin-form">
      <textarea 
        v-model="checkinData.content"
        placeholder="分享今日学习心得..."
        class="content-input"
        :maxlength="500"
      />
      
      <!-- 心情选择 -->
      <view class="mood-selector">
        <text class="label">今日心情：</text>
        <view class="mood-options">
          <view 
            v-for="mood in moodOptions" 
            :key="mood.value"
            :class="['mood-item', { active: checkinData.mood === mood.value }]"
            @click="checkinData.mood = mood.value"
          >
            <text class="mood-icon">{{ mood.icon }}</text>
            <text class="mood-label">{{ mood.label }}</text>
          </view>
        </view>
      </view>
      
      <!-- 学习时长 -->
      <view class="duration-input">
        <text class="label">学习时长（分钟）：</text>
        <input 
          v-model.number="checkinData.study_duration"
          type="number"
          placeholder="输入学习时长"
          class="duration-field"
        />
      </view>
      
      <button 
        @click="submitCheckin"
        :disabled="!canSubmit"
        class="submit-btn"
      >
        {{ isSubmitting ? '提交中...' : '确认打卡' }}
      </button>
    </view>
    
    <!-- 统计信息 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-number">{{ userStats.totalCheckinDays }}</text>
        <text class="stat-label">累计打卡</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ userStats.continuousCheckinDays }}</text>
        <text class="stat-label">连续打卡</text>
      </view>
    </view>
  </view>
</template>

<script>
import { checkinAPI, supabaseHelper } from '@/api/supabase.js';

export default {
  data() {
    return {
      todayCheckin: null,
      userStats: {
        totalCheckinDays: 0,
        continuousCheckinDays: 0
      },
      checkinData: {
        content: '',
        mood: 'neutral',
        study_duration: 0
      },
      isSubmitting: false,
      moodOptions: []
    };
  },
  
  computed: {
    canSubmit() {
      const validation = supabaseHelper.validateCheckinContent(this.checkinData.content);
      return validation.valid && !this.isSubmitting;
    }
  },
  
  onLoad() {
    this.moodOptions = supabaseHelper.getMoodOptions();
    this.loadData();
  },
  
  methods: {
    async loadData() {
      try {
        // 加载用户统计
        const stats = await supabaseHelper.getUserStats();
        if (stats) {
          this.userStats = stats;
        }
        
        // 检查今日打卡状态
        const hasCheckedIn = await supabaseHelper.checkTodayCheckin();
        if (hasCheckedIn) {
          // 获取今日打卡记录
          const records = await checkinAPI.getRecords({ limit: 1 });
          if (records.success && records.data.length > 0) {
            const today = supabaseHelper.formatDate();
            this.todayCheckin = records.data.find(r => r.checkin_date === today);
          }
        }
      } catch (error) {
        console.error('加载数据失败:', error);
      }
    },
    
    async submitCheckin() {
      if (!this.canSubmit) return;
      
      try {
        this.isSubmitting = true;
        
        const result = await checkinAPI.createRecord(
          this.checkinData.content, 
          {
            mood: this.checkinData.mood,
            study_duration: this.checkinData.study_duration
          }
        );
        
        if (result.success) {
          uni.showToast({ title: '打卡成功' });
          await this.loadData(); // 重新加载数据
        } else {
          throw new Error(result.error);
        }
        
      } catch (error) {
        uni.showToast({
          title: error.message || '打卡失败',
          icon: 'none'
        });
      } finally {
        this.isSubmitting = false;
      }
    }
  }
};
</script>
```

## 🔍 调试和监控

### 云函数日志查看

1. 在微信开发者工具中打开云开发控制台
2. 进入云函数 → 日志查看
3. 查看详细的执行日志

### 常见问题排查

1. **Supabase 连接失败**
   - 检查 URL 和 Service Role Key 是否正确
   - 确认云函数网络权限

2. **RLS 策略问题**
   - 检查数据库中的 RLS 策略是否正确创建
   - 确认 `current_setting('app.current_user_openid')` 能正确获取用户ID

3. **数据插入失败**
   - 检查字段类型和约束
   - 查看详细错误信息

### 性能优化建议

1. **数据分页**：大数据量时使用分页查询
2. **缓存策略**：前端缓存常用数据
3. **索引优化**：为常用查询添加数据库索引
4. **图片优化**：使用 CDN 存储图片

## 📈 后续扩展方向

1. **实时功能**：集成 Supabase Realtime
2. **文件上传**：使用 Supabase Storage
3. **推送通知**：结合微信小程序订阅消息
4. **数据分析**：添加用户行为分析
5. **AI 增强**：集成真实的 AI 服务

这个设计为您的学习小组应用提供了一个坚实、可扩展的基础。您可以根据实际需求逐步实现各个功能模块。
