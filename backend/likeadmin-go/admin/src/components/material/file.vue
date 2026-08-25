<template>
    <div>
        <div class="file-item relative" :style="{ height: fileSize, width: fileSize }">
            <a-image
                v-if="type == 'image' && !loadFailed"
                class="image"
                fit="contain"
                :src="uri"
                :preview="false"
                @error="handleLoadError"
            />
            <video v-else-if="type == 'video' && !loadFailed" class="video" :src="uri" @error="handleLoadError"></video>
            <div v-else class="file-item__placeholder">
                <span>{{ type === 'video' ? '视频失效' : '素材失效' }}</span>
            </div>
            <div
                v-if="type == 'video' && !loadFailed"
                class="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] rounded-full w-5 h-5 flex justify-center items-center bg-[rgba(0,0,0,0.3)]"
            >
                <icon-caret-right :size="18" style="color: #fff" />
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IconCaretRight } from '@arco-design/web-vue/es/icon'
export default defineComponent({
    components: {
        IconCaretRight
    },
    props: {
        // 图片地址
        uri: {
            type: String
        },
        // 图片尺寸
        fileSize: {
            type: String,
            default: '100px'
        },
        // 文件类型
        type: {
            type: String,
            default: 'image'
        }
    },
    emits: ['close'],
    data() {
        return {
            loadFailed: false
        }
    },
    watch: {
        uri() {
            this.loadFailed = false
        },
        type() {
            this.loadFailed = false
        }
    },
    methods: {
        /**
         * 函数说明：资源加载失败时切换到占位视图，避免失效素材在列表里持续触发浏览器错误。
         */
        handleLoadError() {
            this.loadFailed = true
        }
    }
})
</script>

<style scoped lang="scss">
.file-item {
    box-sizing: border-box;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    @apply bg-br-extra-light border border-br-extra-light;
    .image,
    .video {
        display: block;
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }

    &__placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        line-height: 1.6;
        color: #86909c;
        background: linear-gradient(180deg, #f7f8fa 0%, #eef1f5 100%);
    }
}
</style>
