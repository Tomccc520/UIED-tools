<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-26
 */
-->
<template>
    <div class="border border-br flex flex-col" :style="styles">
        <toolbar
            v-if="!readonly"
            class="border-b border-br"
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            :mode="mode"
        />
        <w-editor
            class="overflow-y-auto flex-1"
            v-model="valueHtml"
            :defaultConfig="editorConfig"
            :mode="mode"
            @onCreated="handleCreated"
        />
        <material-picker
            v-if="!readonly"
            ref="materialPickerRef"
            :type="fileType"
            :limit="-1"
            hidden-upload
            @change="selectChange"
        />
    </div>
</template>
<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor as WEditor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import MaterialPicker from '@/components/material/picker.vue'
import { addUnit } from '@/utils/util'
import type { CSSProperties } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue?: string
        readonly?: boolean
        mode?: 'default' | 'simple'
        height?: string | number
        width?: string | number
        toolbarConfig?: Partial<IToolbarConfig>
    }>(),
    {
        modelValue: '',
        readonly: false,
        mode: 'default',
        height: '100%',
        width: 'auto',
        toolbarConfig: () => ({})
    }
)

const emit = defineEmits<{
    (event: 'update:modelValue', value: string): void
}>()

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef<IDomEditor>()
const materialPickerRef = shallowRef<InstanceType<typeof MaterialPicker>>()
const fileType = ref('')

let insertFn: any

const editorConfig: Partial<IEditorConfig> = {
    readOnly: props.readonly,
    MENU_CONF: {
        uploadImage: {
            /** 打开图片素材选择，仅编辑状态允许插入。 */
            customBrowseAndUpload(insert: any) {
                if (props.readonly) return
                fileType.value = 'image'
                materialPickerRef.value?.showPopup(-1)
                insertFn = insert
            }
        },
        uploadVideo: {
            /** 打开视频素材选择，仅编辑状态允许插入。 */
            customBrowseAndUpload(insert: any) {
                if (props.readonly) return
                fileType.value = 'video'
                materialPickerRef.value?.showPopup(-1)
                insertFn = insert
            }
        }
    }
}

const styles = computed<CSSProperties>(() => ({
    height: addUnit(props.height),
    width: addUnit(props.width)
}))
/** 将 HTML 同步给上层；只读初始化产生的归一化回调不作为编辑。 */
const valueHtml = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        if (!props.readonly) emit('update:modelValue', value)
    }
})

/** 插入当前选择素材，只读时忽略延迟返回的选择结果。 */
const selectChange = (fileUrl: string[]) => {
    if (props.readonly) return
    fileUrl.forEach((url) => {
        insertFn(url)
    })
}

/** 组件销毁时释放编辑器，避免遗留监听与资源。 */
onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

/** 记录实例并立即应用当前只读状态，避免初始化配置与切换时机不一致。 */
const handleCreated = (editor: IDomEditor) => {
    editorRef.value = editor
    if (props.readonly) editor.disable()
    else editor.enable()
}
/** 动态切换可编辑状态，旧组件调用默认保持可编辑。 */
watch(() => props.readonly, value => {
    const editor = editorRef.value
    if (!editor) return
    if (value) editor.disable()
    else editor.enable()
}, { flush: 'sync' })
</script>

<style lang="scss">
.w-e-full-screen-container {
    z-index: 999;
}
.w-e-text-container [data-slate-editor] ul {
    list-style: disc;
}
.w-e-text-container [data-slate-editor] ol {
    list-style: decimal;
}
.w-e-text-container h1 {
    font-size: 2em;
}
.w-e-text-container h2 {
    font-size: 1.5em;
}
.w-e-text-container h3 {
    font-size: 1.17em;
}
.w-e-text-container h4 {
    font-size: 1em;
}
.w-e-text-container h5 {
    font-size: 0.83em;
}
.w-e-text-container h1,
.w-e-text-container h2,
.w-e-text-container h3,
.w-e-text-container h4,
.w-e-text-container h5 {
    font-weight: bold;
}
</style>
