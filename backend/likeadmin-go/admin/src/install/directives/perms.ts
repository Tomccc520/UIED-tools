/**
 * perm 操作权限处理
 * 指令用法：
 *  <button v-perms="['auth.menu/edit']">编辑</button>
 */

import useUserStore from '@/stores/modules/user'
export default {
    /**
     * 函数说明：根据当前用户权限决定是否保留该 DOM 节点
     */
    mounted: (el: HTMLElement, binding: any) => {
        const { value } = binding
        const userStore = useUserStore()
        const permissions = userStore.perms
        const all_permission = '*'
        if (Array.isArray(value)) {
            if (value.length > 0) {
                const hasPermission = permissions.some((key: string) => {
                    return all_permission == key || value.includes(key)
                })

                if (!hasPermission) {
                    el.parentNode && el.parentNode.removeChild(el)
                }
            }
        } else {
            throw new Error('like v-perms="[\'auth.menu/edit\']"')
        }
    }
}
