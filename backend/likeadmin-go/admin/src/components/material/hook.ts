import {
    fileCateAdd,
    fileCateDelete,
    fileCateEdit,
    fileCateLists,
    fileDelete,
    fileList,
    fileMove,
    fileRename
} from '@/api/file'
import { Message } from '@arco-design/web-vue'
import { usePaging } from '@/hooks/usePaging'
import feedback from '@/utils/feedback'
import { shallowRef, type Ref } from 'vue'

// 左侧分组的钩子函数
export function useCate(type: number) {
    const treeRef = shallowRef<{
        selectNode?: (key: string | number, selected?: boolean) => void
    }>()
    // 分组列表
    const cateLists = ref<any[]>([])
    const cateLoadError = ref('')

    // 选中的分组id
    const cateId = ref<number | string>('')

    /** 函数说明：读取素材分组，兼容既有列表结构；失败保留分组并返回 false 供界面重试。 */
    const getCateLists = async () => {
        cateLoadError.value = ''
        try {
            const data = await fileCateLists({ type })
            const normalizedLists = Array.isArray(data)
                ? data
                : Array.isArray((data as any)?.lists)
                ? (data as any).lists
                : Array.isArray((data as any)?.list)
                ? (data as any).list
                : []
            cateLists.value = [...normalizedLists]
            setTimeout(() => treeRef.value?.selectNode?.(cateId.value, true), 0)
            return true
        } catch {
            cateLoadError.value = '素材分组加载失败，请重新加载。'
            return false
        }
    }

    // 添加分组
    const handleAddCate = async (value: string) => {
        await fileCateAdd({
            type,
            name: value,
            pid: 0
        })
        getCateLists()
    }

    // 编辑分组
    const handleEditCate = async (value: string, id: number) => {
        await fileCateEdit({
            id,
            name: value
        })
        getCateLists()
    }

    // 删除分组
    const handleDeleteCate = async (id: number) => {
        await feedback.confirm('确定要删除？')
        await fileCateDelete({ id })
        cateId.value = ''
        getCateLists()
    }

    //选中分类
    const handleCatSelect = (item: any) => {
        cateId.value = item.id
    }

    return {
        treeRef,
        cateId,
        cateLists,
        cateLoadError,
        handleAddCate,
        handleEditCate,
        handleDeleteCate,
        getCateLists,
        handleCatSelect
    }
}

// 处理文件的钩子函数
export function useFile(
    cateId: Ref<string | number>,
    type: Ref<number>,
    limit: Ref<number>,
    size: number
) {
    const listShowType = ref('normal')
    const moveId = ref(0)
    const select = ref<any[]>([])
    const isCheckAll = ref(false)
    const isIndeterminate = ref(false)
    const fileLoadError = ref('')
    const fileActionError = ref('')
    const isProcessingFiles = ref(false)
    let readSerial = 0
    const fileParams = reactive({
        name: '',
        type: type,
        cid: cateId,
        bindType: '',
        bindId: undefined as number | undefined
    })
    const { pager, getLists } = usePaging({
        fetchFun: fileList,
        params: fileParams,
        firstLoading: true,
        size
    })

    /** 函数说明：读取素材列表并显示稳定错误，旧请求不得清除最新失败提示。 */
    const getFileList = async () => {
        const serial = ++readSerial
        try {
            await getLists()
            if (serial === readSerial) fileLoadError.value = ''
            return serial === readSerial
        } catch {
            if (serial === readSerial) fileLoadError.value = '素材列表加载失败，已保留当前内容，请重新加载。'
            return false
        }
    }
    /** 函数说明：从第一页刷新当前素材条件，不改动已选文件或上传参数。 */
    const refresh = async () => {
        if (isProcessingFiles.value) return false
        pager.page = 1
        return getFileList()
    }

    /**
     * 函数说明：清空业务绑定筛选条件，恢复素材全量列表查询。
     */
    const clearBindFilters = () => {
        fileParams.bindType = ''
        fileParams.bindId = undefined
        refresh()
    }

    const isSelect = (id: number) => {
        return !!select.value.find((item: any) => item.id == id)
    }

    /** 函数说明：确认前锁定删除快照，失败保留原选择，成功后刷新失败只提示列表未更新。 */
    const batchFileDelete = async (id?: number[]) => {
        if (isProcessingFiles.value) return false
        const ids = [...new Set(id || select.value.map((item: any) => item.id))]
        if (!ids.length) return false
        isProcessingFiles.value = true
        fileActionError.value = ''
        try {
            try { await feedback.confirm('确认删除后，本地或云存储文件也将同步删除，如文件已被使用，请谨慎操作！') }
            catch { return false }
            try { await fileDelete({ ids }) }
            catch { fileActionError.value = '素材删除失败，已保留选择，请检查后重试。'; return false }
            select.value = select.value.filter((item: any) => !ids.includes(item.id))
            await getFileList()
            return true
        } finally {
            isProcessingFiles.value = false
        }
    }

    /** 函数说明：按提交快照移动所选文件，失败时保留选择和目标分组供重试。 */
    const batchFileMove = async () => {
        if (isProcessingFiles.value) return false
        const ids = [...new Set(select.value.map((item: any) => item.id))]
        if (!ids.length) return false
        const cid = moveId.value
        isProcessingFiles.value = true
        fileActionError.value = ''
        try {
            try { await fileMove({ ids, cid }) }
            catch { fileActionError.value = '素材移动失败，已保留选择和目标分组，请重试。'; return false }
            select.value = select.value.filter((item: any) => !ids.includes(item.id))
            moveId.value = 0
            await getFileList()
            return true
        } finally {
            isProcessingFiles.value = false
        }
    }

    const selectFile = (item: any) => {
        if (isProcessingFiles.value) return
        const index = select.value.findIndex((items: any) => items.id == item.id)
        if (index != -1) {
            select.value.splice(index, 1)
            return
        }
        if (select.value.length == limit.value) {
            if (limit.value == 1) {
                select.value = []
                select.value.push(item)
                return
            }
            Message.warning('已达到选择上限')
            return
        }
        select.value.push(item)
    }

    const clearSelect = () => {
        if (isProcessingFiles.value) return
        select.value = []
    }

    const cancelSelete = (id: number) => {
        if (isProcessingFiles.value) return
        select.value = select.value.filter((item: any) => item.id != id)
    }

    const selectAll = (value: boolean) => {
        if (isProcessingFiles.value) return
        isIndeterminate.value = false
        if (value) {
            select.value = [...pager.lists]
            return
        }
        clearSelect()
    }

    /** 函数说明：重命名失败保留当前文件，错误通过素材区展示，不与批量请求交错。 */
    const handleFileRename = async (value: string, id: number) => {
        if (isProcessingFiles.value) return false
        isProcessingFiles.value = true
        fileActionError.value = ''
        try {
            try { await fileRename({ id, name: value }) }
            catch { fileActionError.value = '素材重命名失败，请重试。'; return false }
            await getFileList()
            return true
        } finally {
            isProcessingFiles.value = false
        }
    }
    return {
        listShowType,
        fileLoadError,
        fileActionError,
        isProcessingFiles,
        moveId,
        pager,
        fileParams,
        select,
        isCheckAll,
        isIndeterminate,
        getFileList,
        refresh,
        clearBindFilters,
        batchFileDelete,
        batchFileMove,
        selectFile,
        isSelect,
        clearSelect,
        cancelSelete,
        selectAll,
        handleFileRename
    }
}
