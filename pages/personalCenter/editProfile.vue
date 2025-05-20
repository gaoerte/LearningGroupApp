<template>
    <view class="container">
        <text class="title">编辑个人资料</text>

        <!-- 编辑表单 -->
        <view class="form">
            <view class="form-item">
                <text class="label">姓名：</text>
                <input v-model="name" class="input" placeholder="请输入姓名" />
            </view>
            <view class="form-item">
                <text class="label">邮箱：</text>
                <input v-model="email" class="input" placeholder="请输入邮箱" />
            </view>
        </view>

        <!-- 保存按钮 -->
        <button class="save-btn" @click="saveProfile">保存</button>
    </view>
</template>

<script>
export default {
    data() {
        return {
            name: '小明',
            email: 'xiaoming@example.com'
        };
    },
    methods: {
        // 保存个人资料
        saveProfile() {
            uni.showToast({
                title: '资料已保存',
                icon: 'success'
            });
            // 返回个人中心页面
            uni.navigateBack();
        }
    }
};
</script>

<style scoped>
.container {
    padding: 20px;
}

.title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 20px;
}

.form {
    margin-bottom: 20px;
}

.form-item {
    display: flex;
    margin-bottom: 15px;
}

.label {
    width: 80px;
    font-size: 16px;
}

.input {
    flex: 1;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ddd;
    border-radius: 5px;
}

.save-btn {
    padding: 10px;
    background-color: #1aad19;
    color: white;
    border: none;
    border-radius: 5px;
    width: 100%;
}
</style>
