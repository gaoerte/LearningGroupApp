<template>
    <view class="container">
        <text class="title">根据兴趣推荐小组</text>

        <!-- 兴趣选择 -->
        <view class="interest-selection">
            <picker mode="selector" :range="interests" @change="selectInterest">
                <view class="picker">
                    <text>选择兴趣领域</text>
                    <text class="selected-interest">{{ selectedInterest || '请选择兴趣领域' }}</text>
                </view>
            </picker>
        </view>

        <!-- 推荐的小组列表 -->
        <view class="group-list">
            <view class="group-item" v-for="(group, index) in recommendedGroups" :key="index">
                <text class="group-name">{{ group.name }}</text>
                <text class="group-description">{{ group.description }}</text>
                <button class="join-btn" @click="joinGroup(group)">加入群组</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            selectedInterest: null, // 当前选择的兴趣
            interests: ['数学', '编程', '英语', '物理'], // 可选的兴趣领域
            recommendedGroups: [] // 推荐的小组
        };
    },
    methods: {
        // 选择兴趣领域后过滤推荐的小组
        selectInterest(e) {
            const selectedIndex = e.detail.value;
            this.selectedInterest = this.interests[selectedIndex];

            // 根据选择的兴趣推荐小组
            this.filterGroupsByInterest(this.selectedInterest);
        },
        // 根据兴趣领域推荐小组
        filterGroupsByInterest(interest) {
            const allGroups = [
                { name: '数学学习小组', description: '一起学习高等数学', interest: '数学' },
                { name: '编程学习小组', description: '编程从入门到精通', interest: '编程' },
                { name: '英语学习小组', description: '提高英语口语能力', interest: '英语' },
                { name: '物理学习小组', description: '物理学基础与应用', interest: '物理' }
            ];

            // 过滤出符合兴趣的小组
            this.recommendedGroups = allGroups.filter(group => group.interest === interest);
        },
        // 加入群组
        joinGroup(group) {
            uni.showToast({
                title: `成功加入 ${group.name}`,
                icon: 'success'
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

.interest-selection {
    margin-bottom: 20px;
}

.picker {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.selected-interest {
    font-size: 18px;
    color: #1aad19;
    margin-top: 10px;
}

.group-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.group-item {
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.group-name {
    font-size: 18px;
    font-weight: bold;
}

.group-description {
    color: #777;
    margin-bottom: 10px;
}

.join-btn {
    width: 100%;
    padding: 10px;
    background-color: #1aad19;
    color: white;
    border: none;
    border-radius: 5px;
}
</style>
