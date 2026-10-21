/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-10-21
 */
import { onBeforeUnmount, ref } from 'vue'
import { ElMessage } from 'element-plus'

interface SpreadsheetReadOptions<Result> {
  mode: 'binary' | 'array'
  parse: (data: string | ArrayBuffer | null) => Promise<Result>
  onSuccess: (result: Result) => void
  reset: () => void
}

/**
 * 管理表格文件读取，只允许当前文件提交解析结果；换文件、清空和卸载都会使旧回调失效。
 * @param options 读取模式、纯解析函数、结果提交与结果清理方法。
 * @returns 读取状态、错误文案、开始读取和取消当前任务的方法。
 */
export function useSpreadsheetRead<Result>(options: SpreadsheetReadOptions<Result>) {
  const isReading = ref(false)
  const readError = ref('')
  let readVersion = 0
  let activeReader: FileReader | null = null
  let disposed = false

  /** 使读取和解析中的旧任务失效，并取消仍在进行的文件读取。 */
  function cancelRead() {
    readVersion += 1
    const reader = activeReader
    activeReader = null
    if (reader) {
      reader.onload = null
      reader.onerror = null
      reader.onabort = null
      if (reader.readyState === 1) reader.abort()
    }
    isReading.value = false
    readError.value = ''
  }

  /** 启动当前文件的本地读取；结果先在局部解析，版本仍有效时才提交到页面。 */
  function readFile(file: File) {
    if (disposed) return
    cancelRead()
    options.reset()
    isReading.value = true
    const version = readVersion
    let finished = false

    /** 判断读取事件或异步解析结果是否仍归属于当前文件。 */
    function isCurrent() {
      return !disposed && !finished && version === readVersion
    }

    /** 清除失败任务的产物，记录内部错误，并向页面提供可重试的简明提示。 */
    function fail(message: string, error: unknown) {
      if (!isCurrent()) return
      finished = true
      activeReader = null
      options.reset()
      isReading.value = false
      readError.value = message
      console.error('[SpreadsheetRead]', error)
      ElMessage.error(message)
    }

    try {
      const reader = new FileReader()
      activeReader = reader
      /** 处理读取结果，异步运行时加载结束后再次核对文件版本。 */
      reader.onload = async (event) => {
        if (!isCurrent()) return
        try {
          const result = await options.parse(event.target?.result ?? null)
          if (!isCurrent()) return
          options.onSuccess(result)
        } catch (error) {
          fail('文件解析失败，请重新上传', error)
        } finally {
          if (isCurrent()) {
            finished = true
            activeReader = null
            isReading.value = false
          }
        }
      }
      /** 当前文件无法读取时保留文件名，清除产物并允许重新上传。 */
      reader.onerror = () => fail('文件读取失败，请重新上传', reader.error)
      /** 只有用户仍在查看的任务被意外取消时才提示，主动替换任务不产生旧错误。 */
      reader.onabort = () => fail('文件读取已取消，请重新上传', new Error('File reading aborted'))
      if (options.mode === 'array') reader.readAsArrayBuffer(file)
      else reader.readAsBinaryString(file)
    } catch (error) {
      fail('文件读取失败，请重新上传', error)
    }
  }

  /** 组件销毁后停止读取并拒绝异步解析的后续提交。 */
  onBeforeUnmount(() => {
    disposed = true
    cancelRead()
  })

  return { isReading, readError, readFile, cancelRead }
}
