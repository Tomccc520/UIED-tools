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

    // 选中的分组id
    const cateId = ref<number | string>('')

    // 获取分组列表
    const getCateLists = async () => {
        const data = await fileCateLists({ type })
        const item: any[] = [
            // {
            //     name: '全部',
            //     id: ''
            // },
            // {
            //     name: '未分组',
            //     id: 0
            // }
        ]
        /**
         * 函数说明：兼容分类接口返回数组或对象结构，避免 data 为空时调用 filter/unshift 报错。
         */
        const normalizedLists = Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.lists)
            ? (data as any).lists
            : Array.isArray((data as any)?.list)
            ? (data as any).list
            : []
        cateLists.value = [...item, ...normalizedLists]
        setTimeout(() => {
            treeRef.value?.selectNode?.(cateId.value, true)
        }, 0)
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
    const fileParams = reactive({
        name: '',
        type: type,
        cid: cateId,
        bindType: '',
        bindId: undefined as number | undefined
    })
    const { pager, getLists, resetPage } = usePaging({
        fetchFun: fileList,
        params: fileParams,
        firstLoading: true,
        size
    })

    const getFileList = () => {
        getLists()
    }
    const refresh = () => {
        resetPage()
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

    const batchFileDelete = async (id?: number[]) => {
        await feedback.confirm(
            '确认删除后，本地或云存储文件也将同步删除，如文件已被使用，请谨慎操作！'
        )
        const ids = id ? id : select.value.map((item: any) => item.id)
        await fileDelete({ ids })
        getFileList()
        clearSelect()
    }

    const batchFileMove = async () => {
        const ids = select.value.map((item: any) => item.id)
        await fileMove({ ids, cid: moveId.value })
        moveId.value = 0
        getFileList()
        clearSelect()
    }

    const selectFile = (item: any) => {
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
        select.value = []
    }

    const cancelSelete = (id: number) => {
        select.value = select.value.filter((item: any) => item.id != id)
    }

    const selectAll = (value: boolean) => {
        isIndeterminate.value = false
        if (value) {
            select.value = [...pager.lists]
            return
        }
        clearSelect()
    }

    const handleFileRename = async (value: string, id: number) => {
        await fileRename({
            id,
            name: value
        })
        getFileList()
    }
    return {
        listShowType,
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
