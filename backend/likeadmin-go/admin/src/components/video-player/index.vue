<template>
    <div>
        <video-play
            ref="playerRef"
            v-bind="options"
            :src="src"
            @play="onPlay"
            @pause="onPause"
            @timeupdate="onTimeupdate"
            @canplay="onCanplay"
        />
    </div>
</template>

<script setup lang="ts">
import { reactive, shallowRef } from 'vue'
import 'vue3-video-play/dist/style.css'
import VideoPlay from 'vue3-video-play'
const props = defineProps({
    src: {
        type: String,
        required: true
    },
    width: String,
    height: String,
    poster: String
})

const playerRef = shallowRef()
const options = reactive({
    color: 'var(--color-primary-6, #6c54ff)', // 主题色
    muted: false, //静音
    webFullScreen: false,
    speedRate: ['0.75', '1.0', '1.25', '1.5', '2.0'], //播放倍速
    autoPlay: true, //自动播放
    loop: false, //循环播放
    mirror: false, //镜像画面
    ligthOff: false, //关灯模式
    volume: 0.3, //默认音量大小
    control: true, //是否显示控制器
    title: '', //视频名称
    poster: '', //封面
    ...props
})

/**
 * 函数说明：开始播放当前视频。
 */
const play = () => {
    playerRef.value.play()
}

/**
 * 函数说明：暂停当前视频播放。
 */
const pause = () => {
    playerRef.value.pause()
}

/**
 * 函数说明：视频开始播放时触发。
 */
const onPlay = (event: any) => {
    console.log(event, '播放')
}

/**
 * 函数说明：视频暂停时触发。
 */
const onPause = (event: any) => {
    console.log(event, '暂停')
}

/**
 * 函数说明：视频播放进度更新时触发。
 */
const onTimeupdate = (event: any) => {
    console.log(event, '时间更新')
}

/**
 * 函数说明：视频可播放时触发。
 */
const onCanplay = (event: any) => {
    console.log(event, '可以播放')
}

defineExpose({
    play,
    pause
})
</script>
