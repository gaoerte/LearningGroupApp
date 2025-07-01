# 软件工程实验日志

## 明确实验功能

1.打卡，最好可以附加一张图片，广播给所有人
2.小组匹配，可以根据搜索功能找到群组，在这里可以加入群组聊天，以后可以在学习群组页面看到该小组
3.ai聊天，接入某个ai的api进行问答，暂时只接入deepseek的
4.学习群组，显示加入的群组，可以点进去聊天
5.个人中心，编辑个人信息

## 确定数据类型

项目核心功能对应数据库设计

1. 用户相关

用户表（users）

字段名 类型 说明
id INT AUTO_INCREMENT PRIMARY KEY 用户唯一ID
username VARCHAR(50) UNIQUE NOT NULL 用户名
password VARCHAR(255) 密码（加密存储）
avatar_url VARCHAR(255) 头像图片地址
bio TEXT 个人简介
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 注册时间
updated_at TIMESTAMP 最近更新时间

⸻

2. 群组相关

群组表（groups）

字段名 类型 说明
id INT AUTO_INCREMENT PRIMARY KEY 群组唯一ID
name VARCHAR(100) NOT NULL 群组名称
description TEXT 群组描述
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 创建时间
updated_at TIMESTAMP 最近更新时间

群组成员表（group_members）

字段名 类型 说明
id INT AUTO_INCREMENT PRIMARY KEY 记录ID
group_id INT NOT NULL 群组ID
user_id INT NOT NULL 用户ID
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 加入时间

⸻

3. 聊天消息相关

消息表（messages）

字段名 类型 说明
id BIGINT AUTO_INCREMENT PRIMARY KEY 消息ID
group_id INT NOT NULL 所属群组ID
from_user_id INT NOT NULL 发送者用户ID
content TEXT 消息内容
image_url VARCHAR(255) NULL 附加图片URL（打卡图片等）
to_user_id INT NULL 私聊时接收者用户ID
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 发送时间

⸻

4. 打卡相关

打卡表（checkins）

字段名 类型 说明
id INT AUTO_INCREMENT PRIMARY KEY 记录ID
user_id INT NOT NULL 用户ID
checkin_date DATE 打卡日期
checkin_time DATETIME 打卡具体时间
image_url VARCHAR(255) 打卡上传图片URL

⸻

5. AI聊天记录（可选）

AI问答表（ai_chat_records）

字段名 类型 说明
id BIGINT AUTO_INCREMENT PRIMARY KEY 记录ID
user_id INT NOT NULL 用户ID
question TEXT 用户提问
answer TEXT AI回复
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 记录时间

## 搭建数据库

使用supabase进行后端开发，新建一个测试账号
邮箱：guest1@example.com
密码：guestPassword123

发现有些函数不兼容，暂时计划使用微信小程序 + Supabase + 云函数代理

以下是你要求的完整数据结构，包括所有表及其字段的定义，结合你之前的需求和修改。

1. users 表

用于存储用户信息，只支持微信登录。

create table users (
  id uuid primary key default uuid_generate_v4(), -- 用户唯一 ID
  openid text unique not null, -- 微信的 openid，唯一标识用户
  username text, -- 用户名
  avatar_url text, -- 头像 URL
  bio text, -- 个人简介
  created_at timestamp with time zone default now() -- 用户创建时间
);

2. tags 表

用于存储所有的预定义标签，标签是唯一的，用户只能选择现有标签，不能创建新的标签。

create table tags (
  id serial primary key, -- 标签 ID
  tag_name text unique not null -- 标签名称，唯一
);

-- 示例：插入一些预定义标签
insert into tags (tag_name) values
  ('学习'),
  ('健身'),
  ('娱乐'),
  ('编程'),
  ('游戏');

3. groups 表

存储群组信息。每个群组有一个创建者（群主）。

create table groups (
  id serial primary key, -- 群组 ID
  name text not null, -- 群组名称
  description text, -- 群组描述
  created_by uuid references users(id) on delete cascade, -- 群主，外键指向 users 表
  created_at timestamp with time zone default now() -- 群组创建时间
);

4. group_members 表

存储群组成员信息，记录哪些用户属于哪些群组。

create table group_members (
  id serial primary key, -- 记录 ID
  group_id int references groups(id) on delete cascade, -- 群组 ID，外键指向 groups 表
  user_id uuid references users(id) on delete cascade, -- 用户 ID，外键指向 users 表
  joined_at timestamp with time zone default now(), -- 加入时间
  unique(group_id, user_id) -- 保证每个用户在同一群组中唯一
);

5. group_messages 表

存储群组消息，每条消息属于一个群组，并且由某个用户发送。

create table group_messages (
  id serial primary key, -- 消息 ID
  group_id int references groups(id) on delete cascade, -- 群组 ID，外键指向 groups 表
  content text not null, -- 消息内容
  from_user_id uuid references users(id) on delete cascade, -- 发送者 ID，外键指向 users 表
  created_at timestamp with time zone default now() -- 消息发送时间
);

6. private_messages 表

存储私聊消息，每条消息由发送者和接收者组成。

create table private_messages (
  id serial primary key, -- 消息 ID
  from_user_id uuid references users(id) on delete cascade, -- 发送者 ID，外键指向 users 表
  to_user_id uuid references users(id) on delete cascade, -- 接收者 ID，外键指向 users 表
  content text not null, -- 消息内容
  created_at timestamp with time zone default now() -- 消息发送时间
);

7. group_tags 表

存储群组与标签的多对多关系。一个群组可以有多个标签，而一个标签可以应用于多个群组。

create table group_tags (
  group_id int references groups(id) on delete cascade, -- 群组 ID，外键指向 groups 表
  tag_id int references tags(id) on delete cascade,   -- 标签 ID，外键指向 tags 表
  primary key (group_id, tag_id)  -- 群组和标签的组合唯一
);

8. RLS（Row-Level Security）策略

设置数据访问权限，确保每个用户只能访问自己有权限的数据。

users 表策略

用户只能查看和更新自己的资料。

create policy "Users can view own profile" on users for select
  using (auth.uid() = id);

create policy "Users can update own profile" on users for update
  using (auth.uid() = id);

groups 表策略

群主才能插入、更新和删除群组信息。

create policy "Allow everyone to select groups" on groups for select using (true);
create policy "Only creator can insert groups" on groups for insert with check (auth.uid() = created_by);
create policy "Only creator can update groups" on groups for update using (auth.uid() = created_by);
create policy "Only creator can delete groups" on groups for delete using (auth.uid() = created_by);

group_members 表策略

用户可以查看、插入和删除自己加入的群组成员。

create policy "Users can view their group memberships" on group_members for select
  using (user_id = auth.uid());

create policy "Users can insert their group memberships" on group_members for insert
  with check (user_id = auth.uid());

create policy "Users can delete their group memberships" on group_members for delete
  using (user_id = auth.uid());

group_messages 表策略

只有群组成员可以查看和发送群组消息。

create policy "Users can select group messages if member" on group_messages for select
  using (exists (
    select 1 from group_members gm where gm.group_id = group_messages.group_id and gm.user_id = auth.uid()
  ));

create policy "Users can insert group messages if member" on group_messages for insert
  with check (exists (
    select 1 from group_members gm where gm.group_id = group_messages.group_id and gm.user_id = auth.uid()
  ) and from_user_id = auth.uid());

private_messages 表策略

只有发送者和接收者可以查看和发送私聊消息。

create policy "Users can select private messages if sender or receiver" on private_messages for select
  using (from_user_id = auth.uid() or to_user_id = auth.uid());

create policy "Users can insert private messages if sender" on private_messages for insert
  with check (from_user_id = auth.uid());

group_tags 表策略

只有群主可以修改群组的标签。

create policy "Only creator can insert group tags" on group_tags for insert
  with check (exists (
    select 1 from groups g where g.id = group_tags.group_id and g.created_by = auth.uid()
  ));

create policy "Only creator can delete group tags" on group_tags for delete
  using (exists (
    select 1 from groups g where g.id = group_tags.group_id and g.created_by = auth.uid()
  ));

数据结构总结
 1. users 表：存储用户的 openid（微信唯一标识）及其他基本信息。
 2. tags 表：存储预定义标签，用户只能选择标签而不能创建。
 3. groups 表：存储群组信息，记录群主（created_by）。
 4. group_members 表：记录群组成员，确保用户和群组的多对多关系。
 5. group_messages 表：存储群组消息，记录每条消息的内容、发送者和时间。
 6. private_messages 表：存储私聊消息，记录发送者、接收者、内容等。
 7. group_tags 表：存储群组和标签的多对多关系，群组可以有多个标签。
 8. RLS 策略：确保数据安全性，确保用户只能访问和修改自己有权限的数据。

这样设计的数据库结构非常适合你的小程序需求，确保了标签管理的简单性和群组管理的灵活性。如果有其他问题或需要进一步调整，请随时告诉我！


## 开发步骤建议

1. 搭建Supabase项目，完成表结构创建和RLS配置
2. 微信小程序端实现微信登录，调用云函数获取openid
3. 用户注册/登录到Supabase（用openid绑定）
4. 实现用户资料编辑与展示
5. 实现群组的创建、查询、加入、退出功能
6. 实现聊天消息的发送、接收（包括文本和图片）和实时更新
7. 实现打卡功能，支持上传图片并广播到群组
8. 集成AI聊天，调用云函数转发Deepseek API请求，返回回答
9. 个人中心完善与其他辅助功能

1似乎完成了
2设计一个基于微信小程序 + 云函数 + Supabase **自定义登录（Custom Auth）**的示例流程和核心代码示范
这部分代码在cloudfunctions/wechatLogin/index.js里面，但我感觉有点问题。

这个警告表明你的项目使用了 **uniCloud** 相关的模块（如 **uni-config-center** 和 **uni-id-common**），但是你并没有在项目中启用 **uniCloud 环境**。
实现了云函数部署
我现在想先设计一下数据结构，然后再进行测试。

我想能不能加入一个创建群聊功能，只能拉取自己的好友，所以还需要好友这个数据结构，因为我要进行群聊标签搜索，所以群聊需要有标签

21.17简单登录