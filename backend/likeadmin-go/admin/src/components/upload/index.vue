<template>
    <div class="upload">
        <a-upload
            ref="uploadRefs"
            :action="action"
            :multiple="multiple"
            :limit="limit"
            :show-file-list="false"
            :file-list="uploadFileList"
            :headers="headers"
            :data="data"
            :accept="getAccept"
            @change="handleChange"
            @progress="handleProgress"
            @success="handleSuccess"
            @exceed-limit="handleExceed"
            @error="handleError"
        >
            <slot></slot>
        </a-upload>
        <a-modal
            v-if="showProgress && fileList.length"
            v-model="visible"
            title="上传进度"
            :mask-closable="false"
            width="500px"
            :mask="false"
            @cancel="handleClose"
        >
            <div class="file-list p-4">
                <template v-for="(item, index) in fileList" :key="index">
                    <div class="mb-5">
                        <div>{{ item.name }}</div>
                        <div class="flex-1">
                            <a-progress :percent="getProgressPercent(item)" />
                        </div>
                    </div>
                </template>
            </div>
        </a-modal>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, shallowRef } from 'vue'
import useUserStore from '@/stores/modules/user'
import config from '@/config'
import feedback from '@/utils/feedback'
import { RequestCodeEnum } from '@/enums/requestEnums'
export default defineComponent({
    components: {},
    props: {
        // 上传文件类型
        type: {
            type: String,
            default: 'image'
        },
        // 是否支持多选
        multiple: {
            type: Boolean,
            default: true
        },
        // 多选时最多选择几条
        limit: {
            type: Number,
            default: 10
        },
        // 上传时的额外参数
        data: {
            type: Object,
            default: () => ({})
        },
        // 是否显示上传进度
        showProgress: {
            type: Boolean,
            default: false
        }
    },
    emits: ['change', 'error'],
    setup(props, { emit }) {
        const userStore = useUserStore()
        const uploadRefs = shallowRef<{
            abort?: (fileItem?: any) => void
        }>()
        const action = ref(`${config.baseUrl}${config.urlPrefix}/common/upload/${props.type}`)
        const headers = computed(() => ({
            token: userStore.token,
            version: config.version
        }))
        const visible = ref(false)
        const uploadFileList = ref<any[]>([])
        const fileList = computed(() => uploadFileList.value)

        /**
         * 同步上传组件的文件列表，统一作为进度弹窗的数据源。
         */
        const handleChange = (fileItems: any[]) => {
            uploadFileList.value = [...fileItems]
        }

        /**
         * 处理上传进度变化，开启弹窗并刷新当前文件百分比。
         */
        const handleProgress = (fileItem: any) => {
            if (props.showProgress) {
                visible.value = true
            }
            const index = uploadFileList.value.findIndex((item) => item.uid === fileItem.uid)
            if (index !== -1) {
                uploadFileList.value[index] = fileItem
            }
        }

        /**
         * 处理上传成功事件，全部完成后关闭弹窗并通知父组件刷新。
         */
        const handleSuccess = (fileItem: any) => {
            const response = fileItem?.response
            const allSuccess =
                uploadFileList.value.length > 0 &&
                uploadFileList.value.every((item) => item.status === 'done')
            if (allSuccess) {
                visible.value = false
                uploadFileList.value = []
                emit('change')
            }
            if (response.code == RequestCodeEnum.FAILED && response.msg) {
                feedback.msgError(response.msg)
            }
        }

        /**
         * 处理上传异常，终止当前上传并清理状态。
         */
        const handleError = (fileItem: any) => {
            feedback.msgError(`${fileItem.name}文件上传失败`)
            uploadRefs.value?.abort?.(fileItem)
            visible.value = false
            uploadFileList.value = []
            emit('change')
            emit('error')
        }

        /**
         * 处理超出数量限制提示。
         */
        const handleExceed = () => {
            feedback.msgError(`超出上传上限${props.limit}，请重新上传`)
        }

        /**
         * 关闭进度弹窗时，主动终止未完成任务并重置列表。
         */
        const handleClose = () => {
            uploadFileList.value.forEach((item) => uploadRefs.value?.abort?.(item))
            uploadFileList.value = []
            visible.value = false
        }

        /**
         * 规范化进度百分比，Arco Progress 要求 0~1。
         */
        const getProgressPercent = (fileItem: any) => {
            const percent = Number(fileItem?.percent ?? 0)
            if (Number.isNaN(percent)) {
                return 0
            }
            return Math.min(1, Math.max(0, percent))
        }

        /**
         * 根据素材类型返回可上传文件后缀。
         */
        const getAccept = computed(() => {
            switch (props.type) {
                case 'image':
                    return '.jpg,.png,.gif,.jpeg,.ico,.bmp,.svg'
                case 'video':
                    return '.wmv,.avi,.mov,.mp4,.flv,.rmvb'
                default:
                    return '*'
            }
        })
        return {
            uploadRefs,
            action,
            headers,
            visible,
            fileList,
            uploadFileList,
            getAccept,
            handleChange,
            handleProgress,
            handleSuccess,
            handleError,
            handleExceed,
            handleClose,
            getProgressPercent
        }
    }
})
</script>

<style lang="scss"></style>
