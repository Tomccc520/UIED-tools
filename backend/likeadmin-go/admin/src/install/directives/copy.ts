/**
 * copy 文本复制指令
 * 指令用法：
 *  <button v-copy="'需要复制的文本'">复制</button>
 */

import feedback from '@/utils/feedback'
import useClipboard from 'vue-clipboard3'
const clipboard = 'data-clipboard-text'
export default {
    /**
     * 函数说明：指令挂载时写入待复制文本并绑定点击复制事件
     */
    mounted: (el: HTMLElement, binding: any) => {
        el.setAttribute(clipboard, binding.value)
        const { toClipboard } = useClipboard()

        el.onclick = () => {
            toClipboard(el.getAttribute(clipboard)!)
                .then(() => {
                    feedback.msgSuccess('复制成功')
                })
                .catch(() => {
                    feedback.msgError('复制失败')
                })
        }
    },
    /**
     * 函数说明：当绑定值更新时同步更新复制文本
     */
    updated: (el: HTMLElement, binding: any) => {
        el.setAttribute(clipboard, binding.value)
    }
}
