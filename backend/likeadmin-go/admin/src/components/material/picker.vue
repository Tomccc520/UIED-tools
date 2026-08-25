<template>
    <div class="material-select">
        <popup
            ref="popupRef"
            width="830px"
            custom-class="body-padding"
            :title="`选择${tipsText}`"
            @confirm="handleConfirm"
            @close="handleClose"
        >
            <template v-if="!hiddenUpload" #trigger>
                <div class="material-select__trigger clearfix" @click.stop>
                    <draggable class="draggable" v-model="fileList" animation="300" item-key="id">
                        <template v-slot:item="{ element, index }">
                            <div
                                class="material-preview"
                                :class="{
                                    'is-disabled': disabled,
                                    'is-one': limit == 1
                                }"
                                @click="showPopup(index)"
                            >
                                <del-wrap @close="deleteImg(index)">
                                    <file-item
                                        :uri="excludeDomain ? getImageUrl(element) : element"
                                        :file-size="size"
                                        :type="type"
                                    ></file-item>
                                </del-wrap>
                                <div class="operation-btns text-xs text-center">
                                    <span>修改</span>
                                    |
                                    <span @click.stop="handlePreview(element)">查看</span>
                                </div>
                            </div>
                        </template>
                    </draggable>
                    <div
                        class="material-upload"
                        @click="showPopup(-1)"
                        v-show="showUpload"
                        :class="{
                            'is-disabled': disabled,
                            'is-one': limit == 1,
                            [uploadClass]: true
                        }"
                    >
                        <slot name="upload">
                            <div
                                class="upload-btn"
                                :style="{
                                    width: size,
                                    height: size
                                }"
                            >
                                <icon-plus :size="25" />
                                <span>添加</span>
                            </div>
                        </slot>
                    </div>
                </div>
            </template>
            <a-scrollbar>
                <div class="material-wrap">
                    <material
                        ref="materialRef"
                        :type="type"
                        :album-type="albumType"
                        :file-size="fileSize"
                        :limit="meterialLimit"
                        @change="selectChange"
                    />
                </div>
            </a-scrollbar>
        </popup>
        <preview v-model="showPreview" :url="previewUrl" :type="type" />
    </div>
</template>

<script lang="ts">
import { IconPlus } from '@arco-design/web-vue/es/icon'
import Draggable from 'vuedraggable'
import Popup from '@/components/popup/index.vue'
import FileItem from './file.vue'
import Material from './index.vue'
import Preview from './preview.vue'
import useAppStore from '@/stores/modules/app'
import { useThrottleFn } from '@vueuse/shared'
export default defineComponent({
    components: {
        IconPlus,
        Popup,
        Draggable,
        FileItem,
        Material,
        Preview
    },
    props: {
        modelValue: {
            type: [String, Array],
            default: () => []
        },
        // 文件类型
        type: {
            type: String,
            default: 'image'
        },
        /**
         * 函数说明：可选覆盖素材类型值，用于区分独立素材池（例如图标库）。
         */
        albumType: {
            type: Number,
            default: 0
        },
        // 选择器尺寸
        size: {
            type: String,
            default: '100px'
        },
        // 文件尺寸
        fileSize: {
            type: String,
            default: '100px'
        },
        // 选择数量限制
        limit: {
            type: Number,
            default: 1
        },
        // 禁用选择
        disabled: {
            type: Boolean,
            default: false
        },
        // 隐藏上传框*(目前在富文本中使用到)
        hiddenUpload: {
            type: Boolean,
            default: false
        },
        uploadClass: {
            type: String,
            default: ''
        },
        //选择的url排出域名
        excludeDomain: {
            type: Boolean,
            default: false
        }
    },

    emits: ['change', 'update:modelValue'],
    setup(props, { emit }) {
        const popupRef = ref<InstanceType<typeof Popup>>()
        const materialRef = ref<InstanceType<typeof Material>>()
        const previewUrl = ref('')
        const showPreview = ref(false)
        const fileList = ref<any[]>([])
        const select = ref<any[]>([])
        const isAdd = ref(true)
        const currentIndex = ref(-1)
        const { disabled, limit, modelValue } = toRefs(props)
        const { getImageUrl } = useAppStore()
        const tipsText = computed(() => {
            switch (props.type) {
                case 'image':
                    return '图片'
                case 'video':
                    return '视频'
                default:
                    return ''
            }
        })

        const showUpload = computed(() => {
            return props.limit - fileList.value.length > 0
        })
        const meterialLimit: any = computed(() => {
            if (!isAdd.value) {
                return 1
            }
            if (limit.value == -1) return null
            return limit.value - fileList.value.length
        })
        const handleConfirm = useThrottleFn(
            () => {
                const selectUri = select.value.map((item) =>
                    props.excludeDomain ? item.path : item.uri
                )
                if (!isAdd.value) {
                    fileList.value.splice(currentIndex.value, 1, selectUri.shift())
                } else {
                    fileList.value = [...fileList.value, ...selectUri]
                }
                handleChange()
            },
            1000,
            false
        )
        const showPopup = (index: number) => {
            if (disabled.value) return
            if (index >= 0) {
                isAdd.value = false
                currentIndex.value = index
            } else {
                isAdd.value = true
            }
            popupRef.value?.open()
        }

        const selectChange = (val: any[]) => {
            select.value = val
        }
        const handleChange = () => {
            const valueImg = limit.value != 1 ? fileList.value : fileList.value[0] || ''
            emit('update:modelValue', valueImg)
            emit('change', valueImg)
            handleClose()
        }

        const deleteImg = (index: number) => {
            fileList.value.splice(index, 1)
            handleChange()
        }

        const handlePreview = (url: string) => {
            previewUrl.value = url
            showPreview.value = true
        }

        const handleClose = () => {
            nextTick(() => {
                if (props.hiddenUpload) fileList.value = []
                materialRef.value?.clearSelect()
            })
        }

        watch(
            modelValue,
            (val: any[] | string) => {
                fileList.value = Array.isArray(val) ? val : val == '' ? [] : [val]
            },
            {
                immediate: true
            }
        )
        provide('limit', props.limit)
        provide('hiddenUpload', props.hiddenUpload)
        return {
            popupRef,
            materialRef,
            fileList,
            tipsText,
            handleConfirm,
            meterialLimit,
            showUpload,
            showPopup,
            selectChange,
            deleteImg,
            previewUrl,
            showPreview,
            handlePreview,
            handleClose,
            getImageUrl
        }
    }
})
</script>

<style scoped lang="scss">
.material-select {
    .material-upload,
    .material-preview {
        position: relative;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 8px;
        margin-bottom: 8px;
        box-sizing: border-box;
        float: left;
        &.is-disabled {
            cursor: not-allowed;
        }
        &.is-one {
            margin-bottom: 0;
        }
        &:hover {
            .operation-btns {
                display: block;
            }
        }
        .operation-btns {
            display: none;
            position: absolute;
            bottom: 0;
            border-radius: 4px;
            width: 100%;
            line-height: 2;
            color: #fff;
            background-color: rgba(0, 0, 0, 0.3);
        }
    }
    .material-upload {
        :deep(.upload-btn) {
            color: var(--color-text-3, #86909c);
            box-sizing: border-box;
            border-radius: 8px;
            border: 1px dashed var(--color-border-2, #e5e6eb);
            background: var(--color-fill-1, #f7f8fa);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: all 0.2s ease;
            &:hover {
                color: var(--color-primary-6, #165dff);
                border-color: var(--color-primary-6, #165dff);
                background: var(--color-primary-light-1, #e8f3ff);
            }
        }
    }
}
.material-wrap {
    min-width: 720px;
    height: 430px;
    @apply border-t border-b border-br;
}
</style>
