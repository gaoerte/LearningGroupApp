# 软件工程实验日志

## 明确实验功能

1.打卡，最好可以附加一张图片，广播给所有人 
2.小组匹配，可以根据搜索功能找到群组，在这里可以加入群组聊天，以后可以在学习群组页面看到该小组 
3.ai聊天，接入某个ai的api进行问答，暂时只接入deepseek的 4.学习群组，显示加入的群组，可以点进去聊天
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
group_id INT NOT NULL 所属群组ID
checkin_date DATE 打卡日期
checkin_time DATETIME 打卡具体时间
image_url VARCHAR(255) 打卡上传图片URL
status VARCHAR(20) 打卡状态（正常/迟到等）
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 记录创建时间

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
