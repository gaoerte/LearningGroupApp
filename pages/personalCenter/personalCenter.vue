<template>
    <view class="container">
        <text class="title">个人中心</text>

        <!-- 个人信息展示 -->
        <view class="info">
            <image class="avatar" src="/static/images/default_avatar.png" alt="头像"></image>
            <text class="name">小明</text>
            <text class="email">xiaoming@example.com</text>
        </view>

        <!-- 修改个人信息按钮 -->
        <button class="edit-btn" @click="editProfile">编辑个人资料</button>
    </view>
</template>

<script>
export default {
    data() {
        return {};
    },
    methods: {
        // 编辑个人资料
        editProfile() {
            uni.navigateTo({
                url: '/pages/editProfile/editProfile'
            });
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

.info {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: 15px;
}

.name {
    font-size: 22px;
    font-weight: bold;
}

.email {
    font-size: 16px;
    color: #777;
    margin-bottom: 20px;
}

.edit-btn {
    padding: 10px;
    background-color: #1aad19;
    color: white;
    border: none;
    border-radius: 5px;
    width: 100%;
}
</style>
