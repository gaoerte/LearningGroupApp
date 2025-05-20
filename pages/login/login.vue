<template>
    <view class="container">
        <view class="login-container">
            <button class="login-btn" @click="login">微信登录</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {}
    },
    methods: {
        login() {
            uni.getUserProfile({
                desc: '用于登录',
                success: (res) => {
                    const userInfo = res.userInfo;
                    // 登录成功后可以保存用户信息并跳转到首页
                    uni.setStorageSync('userInfo', userInfo);
                    uni.navigateTo({
                        url: '/pages/index/index'
                    });
                },
                fail: (err) => {
                    uni.showToast({
                        title: '登录失败，请重试',
                        icon: 'none'
                    });
                }
            });
        }
    }
}
</script>

<style scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.login-container {
    text-align: center;
}

.login-btn {
    background-color: #1aad19;
    color: white;
    padding: 15px 30px;
    border-radius: 5px;
    font-size: 16px;
    border: none;
}
</style>
