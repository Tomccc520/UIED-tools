<script lang="ts">
import * as ArcoIcons from '@arco-design/web-vue/es/icon'
import { computed, defineComponent, h } from 'vue'
import { getArcoIconExportKey, LOCAL_ICON_PREFIX, normalizeSystemIconName } from './index'
import svgIcon from './svg-icon.vue'

/**
 * 函数说明：把系统图标名映射为 Arco 图标组件。
 */
const resolveArcoIconComponent = (name: string) => {
    const iconName = normalizeSystemIconName(name)
    const exportKey = getArcoIconExportKey(iconName)
    const iconComponent = (ArcoIcons as Record<string, any>)[exportKey]
    // 未命中映射时回退为应用图标，避免菜单图标空白
    return iconComponent || (ArcoIcons as Record<string, any>).IconApps
}

/**
 * 函数说明：判断是否为系统图标名称（兼容历史前缀）。
 */
const isSystemIconName = (name: string) => {
    if (!name) {
        return false
    }
    if (name.indexOf(LOCAL_ICON_PREFIX) === 0) {
        return false
    }
    // 函数说明：兼容历史无前缀写法，默认按系统图标处理。
    return true
}

export default defineComponent({
    name: 'Icon',
    props: {
        name: {
            type: String,
            required: true
        },
        size: {
            type: [String, Number],
            default: '14px'
        },
        color: {
            type: String,
            default: 'inherit'
        }
    },
    setup(props) {
        /**
         * 函数说明：统一构建图标容器样式，确保系统图标与本地图标尺寸/颜色一致。
         */
        const wrapperStyle = computed(() => ({
            fontSize: typeof props.size === 'number' ? `${props.size}px` : props.size,
            color: props.color
        }))

        /**
         * 函数说明：渲染图标节点，优先系统图标，其次本地图标，最后兜底应用图标。
         */
        return () => {
            if (isSystemIconName(props.name)) {
                const iconComponent = resolveArcoIconComponent(props.name)
                return h(
                    'i',
                    {
                        class: ['icon-wrapper'],
                        style: wrapperStyle.value
                    },
                    iconComponent ? [h(iconComponent)] : []
                )
            }
            if (props.name.indexOf(LOCAL_ICON_PREFIX) === 0) {
                return h(
                    'i',
                    {
                        class: ['local-icon', 'icon-wrapper'],
                        style: wrapperStyle.value
                    },
                    [h(svgIcon, { ...props })]
                )
            }
            return h(
                'i',
                {
                    class: ['icon-wrapper'],
                    style: wrapperStyle.value
                },
                [h((ArcoIcons as Record<string, any>).IconApps)]
            )
        }
    }
})
</script>

<style scoped>
.icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}
</style>
