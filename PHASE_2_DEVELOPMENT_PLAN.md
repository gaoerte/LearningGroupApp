# 🚀 第二阶段开发计划：群组功能和打卡系统

## 📅 开发时间：2025年7月3日 - 下一个里程碑

## 🎯 第二阶段目标

基于已完成的用户登录系统，开发核心业务功能：
1. **学习群组管理系统**
2. **学习打卡功能**
3. **用户匹配机制**

---

## 🔥 优先级1：学习群组系统

### 📋 功能需求
- **群组创建**：用户可以创建学习群组
- **群组加入**：通过邀请码或搜索加入群组
- **群组管理**：群主管理成员、设置群组信息
- **群组聊天**：群组内成员交流
- **群组统计**：成员学习数据统计

### 🛠️ 技术实现
- **数据库表**：`study_groups`, `group_members`, `group_messages`
- **API设计**：群组CRUD、成员管理、消息发送
- **页面开发**：群组列表、群组详情、群组聊天

### 📁 涉及文件
```
pages/studyGroups/
├── studyGroups.vue       # 群组列表页
├── groupInfo.vue         # 群组详情页
└── groupChat.vue         # 群组聊天页

pages/groupMatch/
└── groupMatch.vue        # 群组匹配页

api/
├── groupAPI.js           # 群组相关API
└── messageAPI.js         # 消息相关API

cloudfunctions/
└── supabaseCore/         # 扩展群组功能
```

---

## 🔥 优先级2：学习打卡系统

### 📋 功能需求
- **每日打卡**：记录每日学习状态
- **打卡历史**：查看历史打卡记录
- **连续统计**：连续打卡天数统计
- **打卡提醒**：定时提醒用户打卡
- **成就系统**：打卡成就和徽章

### 🛠️ 技术实现
- **数据库表**：`checkin_records`, `user_achievements`
- **API设计**：打卡记录、统计查询、成就管理
- **页面开发**：打卡页面、历史记录、成就展示

### 📁 涉及文件
```
pages/checkin/
├── checkin.vue           # 打卡主页
├── history.vue           # 打卡历史
└── achievements.vue      # 成就页面

api/
├── checkinAPI.js         # 打卡相关API
└── achievementAPI.js     # 成就相关API
```

---

## 🔥 优先级3：用户匹配系统

### 📋 功能需求
- **兴趣匹配**：根据学习兴趣匹配用户
- **水平匹配**：根据学习水平匹配同伴
- **地域匹配**：地理位置相近的用户
- **时间匹配**：学习时间相似的用户

### 🛠️ 技术实现
- **算法设计**：用户匹配算法
- **数据分析**：用户行为数据分析
- **推荐系统**：智能推荐学习伙伴

---

## 📊 数据库设计扩展

### 新增表结构

```sql
-- 学习群组表
CREATE TABLE study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id VARCHAR(100) NOT NULL,
  invite_code VARCHAR(20) UNIQUE,
  max_members INTEGER DEFAULT 50,
  current_members INTEGER DEFAULT 1,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 群组成员表
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id),
  user_openid VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'member', -- admin, member
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- 打卡记录表
CREATE TABLE checkin_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_openid VARCHAR(100) NOT NULL,
  checkin_date DATE NOT NULL,
  study_duration INTEGER, -- 分钟
  study_content TEXT,
  mood VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_openid, checkin_date)
);

-- 群组消息表
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES study_groups(id),
  sender_openid VARCHAR(100) NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🛣️ 开发路线图

### Week 1: 群组系统基础
- [ ] 设计并创建数据库表
- [ ] 开发群组 CRUD API
- [ ] 实现群组列表页面
- [ ] 实现群组创建和加入功能

### Week 2: 群组功能完善
- [ ] 开发群组聊天功能
- [ ] 实现群组管理功能
- [ ] 添加群组统计功能
- [ ] 优化用户体验

### Week 3: 打卡系统
- [ ] 开发打卡 API
- [ ] 实现打卡页面
- [ ] 添加打卡历史查看
- [ ] 实现连续打卡统计

### Week 4: 匹配系统
- [ ] 设计匹配算法
- [ ] 开发匹配 API
- [ ] 实现匹配页面
- [ ] 测试和优化

---

## 🎯 成功标准

### 技术指标
- [ ] 所有API响应时间 < 500ms
- [ ] 群组聊天实时性 < 1s
- [ ] 打卡数据准确性 100%
- [ ] 用户匹配准确率 > 80%

### 用户体验
- [ ] 操作流程简单直观
- [ ] 页面加载速度快
- [ ] 错误处理友好
- [ ] 功能完整可用

### 业务目标
- [ ] 用户能成功创建和管理群组
- [ ] 用户能正常打卡并查看统计
- [ ] 用户能找到合适的学习伙伴
- [ ] 整体用户满意度高

---

## 🔧 技术栈沿用

- **前端**：uni-app + Vue.js
- **后端**：微信云函数 + Supabase
- **数据库**：PostgreSQL (Supabase)
- **状态管理**：StorageManager (已完成)
- **API管理**：统一的 CoreAPI (已完成)

---

## 📝 下一步行动

1. **立即开始**：群组数据库表设计
2. **优先开发**：群组列表和创建功能
3. **并行进行**：打卡页面UI设计
4. **持续测试**：每个功能完成后立即测试

---

**🎉 第一阶段的成功为第二阶段奠定了坚实基础！**
**现在我们有了完整的用户系统，可以专注于核心业务功能的开发。**
