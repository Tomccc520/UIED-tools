<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="error">
        <div>
            <slot name="content">
                <div class="error-code">{{ code }}</div>
            </slot>
            <a-typography-text class="error-title" type="secondary">{{ title }}</a-typography-text>
            <a-button v-if="showBtn" type="primary" @click="router.go(-1)">
                {{ second }} 秒后返回上一页
            </a-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps({
    code: String,
    title: String,
    showBtn: {
        type: Boolean,
        default: true
    }
})
let timer: any = null
const second = ref(5)
const router = useRouter()

/**
 * 函数说明：倒计时自动返回上一页，保持原页面交互行为
 */
props.showBtn &&
    (timer = setInterval(() => {
        if (second.value === 0) {
            clearInterval(timer)
            router.go(-1)
        } else {
            second.value--
        }
    }, 1000))

/**
 * 函数说明：组件销毁时清理定时器，防止内存泄漏
 */
onUnmounted(() => {
    timer && clearInterval(timer)
})
</script>
<style lang="scss" scoped>
.error {
    text-align: center;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    .error-code {
        @apply text-primary;
        font-size: 150px;
    }
    .error-title {
        display: block;
        margin: 28px 0;
        font-size: 18px;
    }
    .arco-btn {
        width: 176px;
    }
}
</style>
