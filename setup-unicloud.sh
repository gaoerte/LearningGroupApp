#!/bin/bash
# uniCloud 自动配置脚本

echo "🚀 开始配置 uniCloud 云服务..."

# 1. 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

echo "📁 当前项目目录: $(pwd)"

# 2. 创建 uniCloud 目录结构（使用阿里云）
echo "📦 创建 uniCloud-aliyun 目录结构..."
mkdir -p uniCloud-aliyun/cloudfunctions
mkdir -p uniCloud-aliyun/database

# 3. 移动现有云函数
if [ -d "cloudfunctions" ]; then
    echo "📂 发现现有云函数目录，正在迁移..."
    cp -r cloudfunctions/* uniCloud-aliyun/cloudfunctions/
    echo "✅ 云函数迁移完成"
    
    # 显示迁移的云函数
    echo "📋 已迁移的云函数:"
    ls -la uniCloud-aliyun/cloudfunctions/
else
    echo "⚠️ 未发现 cloudfunctions 目录"
fi

# 4. 创建数据库初始化文件
echo "🗄️ 创建数据库初始化文件..."
cat > uniCloud-aliyun/database/db_init.json << 'EOF'
{
  "collections": [],
  "functions": []
}
EOF

# 5. 创建 uniCloud 配置提示文件
cat > uniCloud-aliyun/README.md << 'EOF'
# uniCloud 配置说明

## 📋 配置步骤

### 1. 开通 uniCloud 服务
访问：https://unicloud.dcloud.net.cn/
使用 DCloud 账号登录并创建云服务空间

### 2. 在 HBuilderX 中关联
1. 右键项目根目录
2. 选择"关联云服务空间或项目"
3. 选择您创建的云服务空间

### 3. 上传云函数
1. 右键具体的云函数目录（如 supabaseTest）
2. 选择"上传并运行"
3. 等待依赖安装完成

### 4. 测试连接
运行 App 并点击聊天页面的 "🔗" 按钮测试连接

## 📁 目录结构
```
uniCloud-aliyun/
├── cloudfunctions/     # 云函数
├── database/          # 数据库初始化
└── README.md         # 说明文档
```

## ⚠️ 注意事项
- 确保在 HBuilderX 中关联了云服务空间
- 首次部署时需要安装依赖，可能需要等待几分钟
- 免费额度足够开发和测试使用
EOF

echo "✅ uniCloud 目录结构创建完成！"
echo ""
echo "📋 下一步操作："
echo "1. 访问 https://unicloud.dcloud.net.cn/ 开通云服务"
echo "2. 在 HBuilderX 中右键项目 → '关联云服务空间'"
echo "3. 右键 uniCloud-aliyun/cloudfunctions/supabaseTest → '上传并运行'"
echo "4. 在聊天页面点击 🔗 按钮测试连接"
echo ""
echo "🎯 配置完成后，您就可以使用云函数了！"
