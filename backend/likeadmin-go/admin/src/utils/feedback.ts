import { Message, Modal, Notification } from '@arco-design/web-vue'

export class Feedback {
    private loadingInstance: { close: () => void } | null = null
    static instance: Feedback | null = null
    static getInstance() {
        return this.instance ?? (this.instance = new Feedback())
    }
    // 消息提示
    msg(msg: string) {
        Message.info(msg)
    }
    // 错误消息
    msgError(msg: string) {
        Message.error(msg)
    }
    // 成功消息
    msgSuccess(msg: string) {
        Message.success(msg)
    }
    // 警告消息
    msgWarning(msg: string) {
        Message.warning(msg)
    }
    // 弹出提示
    alert(msg: string) {
        Modal.info({
            title: '系统提示',
            content: msg
        })
    }
    // 错误提示
    alertError(msg: string) {
        Modal.error({
            title: '系统提示',
            content: msg
        })
    }
    // 成功提示
    alertSuccess(msg: string) {
        Modal.success({
            title: '系统提示',
            content: msg
        })
    }
    // 警告提示
    alertWarning(msg: string) {
        Modal.warning({
            title: '系统提示',
            content: msg
        })
    }
    // 通知提示
    notify(msg: string) {
        Notification.info({
            content: msg
        })
    }
    // 错误通知
    notifyError(msg: string) {
        Notification.error({
            content: msg
        })
    }
    // 成功通知
    notifySuccess(msg: string) {
        Notification.success({
            content: msg
        })
    }
    // 警告通知
    notifyWarning(msg: string) {
        Notification.warning({
            content: msg
        })
    }
    // 确认窗体
    confirm(msg: string) {
        return new Promise<void>((resolve, reject) => {
            Modal.warning({
                title: '温馨提示',
                content: msg,
                okText: '确定',
                cancelText: '取消',
                onOk: () => resolve(),
                onCancel: () => reject(new Error('cancel'))
            })
        })
    }
    // 提交内容
    prompt(content: string, title: string, options?: { inputValue?: string }) {
        return new Promise<{ value: string }>((resolve, reject) => {
            const inputValue = window.prompt(`${title}\n${content}`, options?.inputValue || '')
            if (inputValue === null) {
                reject(new Error('cancel'))
                return
            }
            resolve({ value: inputValue })
        })
    }
    // 打开全局loading
    loading(msg: string) {
        this.loadingInstance = Message.loading({
            content: msg,
            duration: 0
        })
    }
    // 关闭全局loading
    closeLoading() {
        this.loadingInstance?.close()
    }
}

const feedback = Feedback.getInstance()

export default feedback
