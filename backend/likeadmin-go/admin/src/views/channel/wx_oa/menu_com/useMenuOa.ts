import { ref } from 'vue'
import feedback from '@/utils/feedback'
import type { FieldRule, FormInstance, ValidatedError } from '@arco-design/web-vue'
import { setOaMenuSave, getOaMenu, setOaMenuPublish } from '@/api/channel/wx_oa'
import type { Menu } from '@/api/channel/wx_oa'

// 菜单实例
export const menuRef = shallowRef()
// 菜单数据
const menuList = ref<Menu[]>([])
const menuIndex = ref<number>(0)
const isMenuLoading = ref(false)
const isMenuSaving = ref(false)
const isMenuPublishing = ref(false)

type MenuFormRules = Record<string, FieldRule | FieldRule[]>

// 校验
export const rules = reactive<MenuFormRules>({
    name: [
        {
            required: true,
            message: '必填项不能为空'
        },
        {
            min: 1,
            max: 12,
            message: '长度限制12个字符'
        }
    ],
    menuType: [
        {
            required: true,
            message: '必填项不能为空'
        }
    ],
    visitType: [
        {
            required: true,
            message: '必填项不能为空'
        }
    ],
    url: [
        {
            required: true,
            message: '必填项不能为空'
        },
        {
            match: /^https?:\/\/[^\s]+$/i,
            message: '请输入合法的网址链接'
        }
    ],
    appId: [
        {
            required: true,
            message: '必填项不能为空'
        }
    ],
    pagePath: [
        {
            required: true,
            message: '必填项不能为空'
        }
    ]
})

/**
 * 兼容 Arco Form 的校验返回值：无错误返回 undefined，有错误返回错误对象
 * 同时兼容旧链路异常抛出的场景，统一返回布尔结果
 */
const validateMenuFormRef = async (formRef?: FormInstance): Promise<boolean> => {
    if (!formRef) {
        return true
    }
    try {
        const errors = (await formRef.validate()) as Record<string, ValidatedError> | undefined
        return !errors || Object.keys(errors).length === 0
    } catch {
        return false
    }
}

export const useMenuOa = (ref: any) => {
    if (ref && typeof ref !== 'function') {
        menuRef.value = ref
    }

    // 添加主菜单
    const handleAddMenu = () => {
        menuList.value.push({
            name: '菜单名称',
            menuType: 1,
            visitType: 'view',
            url: '',
            appId: '',
            pagePath: '',
            subButtons: []
        })
    }

    // 添加子菜单
    const handleAddSubMenu = (event?: Menu) => {
        const index = menuIndex.value
        if (menuList.value[index].subButtons.length >= 5) {
            feedback.msgError('已添加上限～')
            return
        }
        menuList.value[index].subButtons.push(event)
    }

    // 编辑子菜单
    const handleEditSubMenu = (event: Menu, subIndex: number) => {
        const index = menuIndex.value
        menuList.value[index].subButtons[subIndex] = event
    }

    // 删除主菜单
    const handleDelMenu = (index: number) => {
        menuList.value.splice(index, 1)
    }

    // 删除子菜单
    const handleDelSubMenu = (index: number, subIndex: number) => {
        menuList.value[index].subButtons.splice(subIndex, 1)
    }

    // 获取菜单
    const getOaMenuFunc = async () => {
        isMenuLoading.value = true
        try {
            menuList.value = await getOaMenu()
        } catch (error) {
            feedback.msgError('公众号菜单加载失败，请稍后重试')
        } finally {
            isMenuLoading.value = false
        }
    }

    // 保存菜单
    const handleSave = async () => {
        if (isMenuSaving.value) {
            return
        }
        const refs = menuRef.value?.value ?? []
        for (let i = 0; i < refs.length; i++) {
            const passed = await validateMenuFormRef(refs[i]?.menuFormRef)
            if (!passed) {
                menuIndex.value = i
                return
            }
        }
        isMenuSaving.value = true
        try {
            await setOaMenuSave(menuList.value)
            feedback.msgSuccess('保存成功')
        } catch (error) {
            feedback.msgError('保存失败，请稍后重试')
        } finally {
            isMenuSaving.value = false
        }
    }

    // 保存菜单
    const handlePublish = async () => {
        if (isMenuPublishing.value) {
            return
        }
        const refs = menuRef.value?.value ?? []
        for (let i = 0; i < refs.length; i++) {
            const passed = await validateMenuFormRef(refs[i]?.menuFormRef)
            if (!passed) {
                menuIndex.value = i
                return
            }
        }
        isMenuPublishing.value = true
        try {
            await setOaMenuPublish(menuList.value)
            feedback.msgSuccess('发布成功')
        } catch (error) {
            feedback.msgError('发布失败，请稍后重试')
        } finally {
            isMenuPublishing.value = false
        }
    }

    return {
        menuList,
        menuIndex,
        handleAddMenu,
        handleAddSubMenu,
        handleEditSubMenu,
        handleDelMenu,
        handleDelSubMenu,
        getOaMenuFunc,
        handleSave,
        handlePublish,
        isMenuLoading,
        isMenuSaving,
        isMenuPublishing
    }
}
