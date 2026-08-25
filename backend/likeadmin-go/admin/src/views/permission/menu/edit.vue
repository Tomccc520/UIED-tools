<!--
/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-24
 */
-->
<template>
    <div class="edit-popup">
        <popup
            ref="popupRef"
            :title="popupTitle"
            :async="true"
            width="680px"
            @confirm="handleSubmit"
            @close="handleClose"
        >
            <a-form ref="formRef" :model="formData" :rules="formRules" layout="vertical">
                <a-alert
                    class="mb-4"
                    type="info"
                    :closable="false"
                    show-icon
                    content="目录、菜单和按钮的字段要求不同，建议先确认菜单类型，再补齐路由、组件和权限字符。"
                />
                <section class="form-section">
                    <div class="form-section__title">菜单定位</div>
                    <div class="form-section__desc">先定义菜单类型、父级关系和基础名称，这会直接影响侧栏层级和菜单排序。</div>
                    <a-form-item label="菜单类型" field="menuType" required>
                        <a-radio-group v-model="formData.menuType">
                            <a-radio :value="MenuEnum.CATALOGUE">目录</a-radio>
                            <a-radio :value="MenuEnum.MENU">菜单</a-radio>
                            <a-radio :value="MenuEnum.BUTTON">按钮</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="父级菜单" field="pid">
                        <a-tree-select
                            class="flex-1"
                            v-model="formData.pid"
                            :data="menuOptions"
                            :field-names="{
                                key: 'id',
                                title: 'menuName',
                                children: 'children'
                            }"
                            allow-clear
                            allow-search
                            :tree-props="{ defaultExpandAll: true }"
                            placeholder="请选择父级菜单"
                        />
                    </a-form-item>
                    <a-form-item label="菜单名称" field="menuName">
                        <a-input v-model="formData.menuName" placeholder="请输入菜单名称" allow-clear />
                    </a-form-item>
                    <a-form-item
                        v-if="formData.menuType != MenuEnum.BUTTON"
                        label="菜单图标"
                        field="menuIcon"
                    >
                        <div class="flex-1">
                            <icon-picker class="flex-1" v-model="formData.menuIcon" />
                            <div class="form-tips">
                                推荐使用图标选择器；若手输 <code>icon-xxx</code> / <code>system-icon-xxx</code> 也会自动兼容。
                                <a-link href="https://arco.design/iconbox/libs" target="_blank">查看图标库</a-link>
                            </div>
                        </div>
                    </a-form-item>
                    <a-form-item label="菜单排序" field="menuSort">
                        <div>
                            <a-input-number v-model="formData.menuSort" :max="9999" />
                            <div class="form-tips">数值越大越排前，建议同级菜单按模块成组维护。</div>
                        </div>
                    </a-form-item>
                </section>

                <section class="form-section">
                    <div class="form-section__title">路由与权限</div>
                    <div class="form-section__desc">菜单类型为“菜单”或“按钮”时，需要补齐访问路径、组件路径和权限字符，避免出现前端可见但后端不可访问。</div>
                    <a-form-item
                        v-if="formData.menuType != MenuEnum.BUTTON"
                        label="路由路径"
                        field="paths"
                    >
                        <div class="flex-1">
                            <a-input
                                v-model="formData.paths"
                                placeholder="请输入路由路径"
                                allow-clear
                            />
                            <div class="form-tips">
                                访问的路由地址，如：<code>admin</code>；如外网地址需内链访问则以 <code>http(s)://</code> 开头。
                            </div>
                        </div>
                    </a-form-item>
                    <a-form-item
                        v-if="formData.menuType == MenuEnum.MENU"
                        label="组件路径"
                        field="component"
                    >
                        <div class="flex-1">
                            <a-auto-complete
                                class="w-full"
                                v-model="formData.component"
                                :data="componentSuggestions"
                                allow-clear
                                placeholder="请输入组件路径"
                                @search="handleComponentSearch"
                            />
                            <div class="form-tips">
                                访问的组件路径，如：<code>permission/admin/index</code>，默认在 <code>views</code> 目录下。
                            </div>
                        </div>
                    </a-form-item>
                    <a-form-item
                        label="选中菜单"
                        field="selected"
                        v-if="formData.menuType == MenuEnum.MENU"
                    >
                        <div class="flex-1">
                            <a-input
                                v-model="formData.selected"
                                placeholder="请输入高亮路由"
                                allow-clear
                            />
                            <div class="form-tips">详情页或编辑页可通过这里指定高亮菜单，如 <code>/consumer/lists</code>。</div>
                        </div>
                    </a-form-item>
                    <a-form-item
                        v-if="formData.menuType != MenuEnum.CATALOGUE"
                        label="权限字符"
                        field="perms"
                    >
                        <div class="flex-1">
                            <a-input
                                v-model="formData.perms"
                                placeholder="请输入权限字符"
                                allow-clear
                            />
                            <div class="form-tips">
                                将作为 server 端 API 验权使用，如 <code>system:admin:list</code>，请谨慎修改。
                            </div>
                        </div>
                    </a-form-item>
                    <a-form-item
                        v-if="formData.menuType == MenuEnum.MENU"
                        label="路由参数"
                        field="params"
                    >
                        <div>
                            <div class="flex-1">
                                <a-input
                                    v-model="formData.params"
                                    placeholder="请输入路由参数"
                                    allow-clear
                                />
                            </div>
                            <div class="form-tips">
                                访问路由的默认参数，如 <code>{"id":1}</code> 或 <code>id=1&amp;name=admin</code>。
                            </div>
                        </div>
                    </a-form-item>
                    <a-form-item
                        v-if="formData.menuType == MenuEnum.MENU"
                        label="是否缓存"
                        field="isCache"
                        required
                    >
                        <div>
                            <a-radio-group v-model="formData.isCache">
                                <a-radio :value="1">缓存</a-radio>
                                <a-radio :value="0">不缓存</a-radio>
                            </a-radio-group>
                            <div class="form-tips">选择缓存则会被 <code>keep-alive</code> 缓存。</div>
                        </div>
                    </a-form-item>
                </section>

                <section class="form-section">
                    <div class="form-section__title">展示与状态</div>
                    <div class="form-section__desc">这里控制菜单在后台侧栏是否可见、是否可访问，停用会影响路由访问和菜单展示。</div>
                    <a-form-item
                        v-if="formData.menuType != MenuEnum.BUTTON"
                        label="是否显示"
                        field="isShow"
                        required
                    >
                        <div>
                            <a-radio-group v-model="formData.isShow">
                                <a-radio :value="1">显示</a-radio>
                                <a-radio :value="0">隐藏</a-radio>
                            </a-radio-group>
                            <div class="form-tips">隐藏后不会出现在侧边栏，但仍可通过路由访问。</div>
                        </div>
                    </a-form-item>
                    <a-form-item
                        v-if="formData.menuType != MenuEnum.BUTTON"
                        label="菜单状态"
                        field="isDisable"
                        required
                    >
                        <div>
                            <a-radio-group v-model="formData.isDisable">
                                <a-radio :value="0">正常</a-radio>
                                <a-radio :value="1">停用</a-radio>
                            </a-radio-group>
                            <div class="form-tips">停用后该菜单不会出现在侧边栏，且对应路由也不允许访问。</div>
                        </div>
                    </a-form-item>
                </section>
            </a-form>
        </popup>
    </div>
</template>
<script lang="ts" setup>
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { menuLists, menuEdit, menuAdd, menuDetail } from '@/api/perms/menu'
import { getModulesKey } from '@/router'
import { MenuEnum } from '@/enums/appEnums'
import Popup from '@/components/popup/index.vue'
import feedback from '@/utils/feedback'
import { arrayToTree, treeToArray } from '@/utils/util'

const emit = defineEmits(['success', 'close'])
const formRef = shallowRef<FormInstance>()
const popupRef = shallowRef<InstanceType<typeof Popup>>()
const mode = ref('add')
const popupTitle = computed(() => {
    return mode.value == 'edit' ? '编辑菜单' : '新增菜单'
})

const componentsOptions = ref(getModulesKey())
const componentSearchKeyword = ref('')
const componentSuggestions = computed(() => {
    const keyword = componentSearchKeyword.value.trim().toLowerCase()
    if (!keyword) {
        return componentsOptions.value
    }
    return componentsOptions.value.filter((item) => item.toLowerCase().includes(keyword))
})

const formData = reactive({
    id: '',
    //父级id
    pid: 0,
    //类型
    menuType: MenuEnum.CATALOGUE,
    //图标
    menuIcon: '',
    //名称
    menuName: '',
    //排序号
    menuSort: 0,
    // 路由路径
    paths: '',
    //权限链接
    perms: '',
    //前端组件
    component: '',
    //选中路径
    selected: '',
    //路由参数
    params: '',
    //是否缓存 0=否， 1=是
    isCache: 1,
    //是否显示 0=否， 1=是
    isShow: 1,
    //是否禁用 0=否， 1=是
    isDisable: 0
})

const formRules: Record<string, FieldRule[]> = {
    pid: [
        {
            required: true,
            message: '请选择父级菜单',
            trigger: ['blur', 'change']
        }
    ],
    menuName: [
        {
            required: true,
            message: '请输入菜单名称',
            trigger: 'blur'
        }
    ],
    paths: [
        {
            required: true,
            message: '请输入路由地址',
            trigger: 'blur'
        }
    ],
    component: [
        {
            required: true,
            message: '请输入组件地址',
            trigger: 'blur'
        }
    ]
}
const menuOptions = ref<any[]>([])

/**
 * 函数说明：根据输入关键字更新组件路径建议列表
 */
const handleComponentSearch = (keyword: string) => {
    componentSearchKeyword.value = keyword
}

/**
 * 函数说明：读取菜单树并生成“父级菜单”选项，仅展示目录与菜单类型
 */
const getMenu = async () => {
    const data: any = await menuLists()
    const menu: any = { id: 0, menuName: '顶级', children: [] }
    menu.children = arrayToTree(
        treeToArray(data).filter((item) => item.menuType != MenuEnum.BUTTON)
    )
    menuOptions.value = [menu]
}

/**
 * 函数说明：提交菜单新增/编辑请求，先执行前端校验后再发起接口调用
 */
const handleSubmit = async () => {
    const errors = (await formRef.value?.validate()) as Record<string, ValidatedError> | undefined
    if (errors) {
        return
    }
    mode.value == 'edit' ? await menuEdit(formData) : await menuAdd(formData)
    popupRef.value?.close()
    feedback.msgSuccess('操作成功')
    emit('success')
}

/**
 * 函数说明：打开弹窗并设置当前操作模式
 */
const open = (type = 'add') => {
    mode.value = type
    popupRef.value?.open()
}

/**
 * 函数说明：批量回填表单字段，忽略空值避免覆盖已有数据
 */
const setFormData = (data: Record<any, any>) => {
    for (const key in formData) {
        if (data[key] != null && data[key] != undefined) {
            //@ts-ignore
            formData[key] = data[key]
        }
    }
}

/**
 * 函数说明：按菜单 ID 获取详情并填充弹窗表单
 */
const getDetail = async (row: Record<string, any>) => {
    const data = await menuDetail({
        id: row.id
    })
    setFormData(data)
}

/**
 * 函数说明：弹窗关闭时通知父组件同步可见状态
 */
const handleClose = () => {
    emit('close')
}

getMenu()

defineExpose({
    open,
    setFormData,
    getDetail
})
</script>

<style scoped lang="scss">
.form-section {
    padding: 16px 18px;
    border: 1px solid var(--color-border-2, #e5e6eb);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);

    & + & {
        margin-top: 14px;
    }
}

.form-section__title {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-text-1, #1d2129);
}

.form-section__desc {
    margin-top: 6px;
    margin-bottom: 14px;
    font-size: 12px;
    line-height: 1.7;
    color: var(--color-text-3, #86909c);
}

.form-tips {
    margin-top: 6px;
    font-size: 12px;
    line-height: 1.6;
    color: var(--color-text-3, #86909c);
}
</style>
