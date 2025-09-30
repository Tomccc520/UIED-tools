<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, onUnmounted } from '@vue/runtime-core'
import { Search, Delete, ArrowRight, Close, Expand, Fold, Refresh } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus'
import { useToolsStore } from '@/store/modules/tools'
import { useComponentStore } from '@/store/modules/component'
import 'element-plus/theme-chalk/display.css'
import type { Tool } from '@/components/Tools/tools.type'
import axios from 'axios'
import quotes from '@/assets/designer_quotes_api.json'
import SearchPanel from '@/components/Search/Search.vue'
import router from '@/router';

// 每日一言数据结构
interface DailyWord {
  id: number;
  content: string;
  form: string;
}

// 每日一言
const dailyWord = ref<DailyWord>({
  id: 0,
  content: '',
  form: ''
})

// 添加定时器引用
let dailyWordTimer: ReturnType<typeof setInterval> | null = null

// 添加 JSONP 工具函数
const jsonp = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_' + Date.now() + Math.floor(Math.random() * 1000);
    const script = document.createElement('script');

    // 创建全局回调函数
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      resolve(data);
    };

    // 清理函数
    const cleanup = () => {
      document.body.removeChild(script);
      delete (window as any)[callbackName];
      clearTimeout(timeoutId);
    };

    // 设置超时
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error('JSONP 请求超时'));
    }, 5000);

    // 处理错误
    script.onerror = () => {
      cleanup();
      reject(new Error('JSONP 请求失败'));
    };

    // 构建URL
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

const getDailyWord = async () => {
  try {
    console.log('开始获取一言...')
    const response = await fetch('https://api.pearktrue.cn/api/hitokoto/')
    const text = await response.text()

    if (text) {
      dailyWord.value = {
        id: 0,
        content: text,
        form: '一言'
      }
      console.log('一言获取成功:', dailyWord.value)
      return
    }
    throw new Error('获取数据失败')
  } catch (error) {
    console.error('一言获取失败:', error)
    // 使用本地的随机名言
    const fallbackQuotes = [
      '生活明朗, 万物可爱',
      '道阻且长，行则将至',
      '心之所向，素履以往',
      '生命不息，奋斗不止',
      '保持热爱，奔赴山海',
      '山水一程，三生有幸',
      '愿你眼中有光，心中有爱',
      '不负韶华，不负自己',
      '既见君子，云胡不喜',
      '明月装饰了你的窗子，你装饰了别人的梦'
    ]
    dailyWord.value = {
      id: 0,
      content: fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)],
      form: '本地一言'
    }
  }
}

// 初始化每日一言
const initDailyWord = () => {
  getDailyWord() // 立即获取一次
  // 设置每小时自动刷新一次
  dailyWordTimer = setInterval(() => {
    getDailyWord()
  }, 60 * 60 * 1000) // 60分钟 * 60秒 * 1000毫秒
}

// const isNavDrawer = ref(false)
const loading = ref(false)
const options = ref<Tool[]>([])
//store
const toolsStore = useToolsStore()
const componentStore = useComponentStore()
//查询参数
const searchParam = reactive({
  cateId: 0,
  title: '',
  route: '',
})

// 搜索历史
const searchHistory = ref<string[]>([])
const MAX_HISTORY = 10

// 从localStorage加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史到localStorage
const saveSearchHistory = (query: string) => {
  if (!query.trim()) return
  const index = searchHistory.value.indexOf(query)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
  searchHistory.value.unshift(query)
  if (searchHistory.value.length > MAX_HISTORY) {
    searchHistory.value.pop()
  }
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 清除搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('searchHistory')
}

// 删除单个搜索历史
const removeSearchHistory = (index: number) => {
  searchHistory.value.splice(index, 1)
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
}

// 搜索建议
const searchSuggestions = computed(() => {
  const query = searchParam.title.toLowerCase().trim()
  console.log('搜索关键词:', query)

  if (!query) return []

  // 获取所有工具并打印详细信息
  const allTools = toolsStore.getAllTools()
  console.log('搜索时的工具数据:', {
    totalTools: allTools.length,
    sampleTool: allTools[0],
    allTools
  })

  const filteredTools = allTools.filter((tool: Tool) => {
    const toolTitle = tool?.title?.toLowerCase() || ''
    const toolDesc = tool?.desc?.toLowerCase() || ''
    const matched = toolTitle.includes(query) || toolDesc.includes(query)

    // 打印匹配过程
    console.log('工具匹配检查:', {
      tool: tool.title,
      query,
      titleMatch: toolTitle.includes(query),
      descMatch: toolDesc.includes(query),
      matched
    })

    return matched
  })

  console.log('过滤后的工具:', filteredTools)
  return filteredTools.slice(0, 10)
})

//搜索工具
const searchTools = async (query: string) => {
  loading.value = true
  console.log('执行搜索，关键词:', query)

  try {
    if (query) {
      searchParam.title = query
      const allTools = toolsStore.getAllTools()

      options.value = allTools.filter((tool: Tool) => {
        const toolTitle = tool?.title?.toLowerCase() || ''
        const toolDesc = tool?.desc?.toLowerCase() || ''

        return toolTitle.includes(query.toLowerCase()) ||
          toolDesc.includes(query.toLowerCase())
      })

      saveSearchHistory(query)
    } else {
      options.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    options.value = []
  } finally {
    loading.value = false
  }
}

// 选择搜索历史或建议
const selectSearchItem = (query: string) => {
  searchParam.title = query
  searchTools(query)
}

// 搜索面板控制
const showSearch = ref(false)

// 处理搜索选择
const handleSearchSelect = (url: string) => {
  if (!url) {
    console.warn('点击的链接为空')
    return
  }

  console.log('准备跳转到:', url)

  try {
    // 检查是否是外部链接
    if (url.startsWith('http')) {
      window.open(url, '_blank')
    } else {
      // 使用 router.push 的 catch 来处理导航失败
      router.push(url).catch(err => {
        console.error('路由跳转失败:', err)
        ElMessage.error('页面不存在')
      })
    }
  } catch (error) {
    console.error('导航错误:', error)
    ElMessage.error('导航失败，请稍后重试')
  }
}

// 切换搜索面板
const toggleSearch = () => {
  showSearch.value = !showSearch.value
}

// 添加点击外部关闭搜索
const handleClickOutside = (event: MouseEvent) => {
  const searchPanel = document.querySelector('.search-panel')
  const searchButton = document.querySelector('.search-trigger-btn')
  const target = event.target as HTMLElement

  // 检查点击的目标是否在搜索面板或搜索按钮内
  if (showSearch.value &&
    searchPanel &&
    searchButton &&
    !searchPanel.contains(target) &&
    !searchButton.contains(target) &&
    !target.closest('.el-select-dropdown')) { // 排除下拉菜单
    showSearch.value = false
    searchParam.title = ''
  }
}

// 快捷入口数据
const quickTools = computed(() => {
  return [
    {
      title: '疯狂星期四',
      url: '/tools/copywriting/kfc'
    },
    {
      title: '舔狗日记',
      url: '/tools/copywriting/dog-diary'
    },
    {
      title: '图片压缩',
      url: '/tools/image-compress'
    },
    {
      title: '图片裁剪',
      url: '/tools/image-crop'
    },
    {
      title: '二维码生成',
      url: '/tools/qrcode'
    },
    {
      title: '图片格式转换',
      url: '/tools/img-format'
    }
  ]
})

const addToBookmark = () => {
  try {
    // 使用当前页面标题
    const title = document.title
    // 现代浏览器
    if ('sidebar' in window && 'addPanel' in (window as any).sidebar) { // Firefox
      (window as any).sidebar.addPanel(title, window.location.href, '');
    } else if ('external' in window && 'AddFavorite' in (window as any).external) { // IE
      (window as any).external.AddFavorite(window.location.href, title);
    } else { // Chrome, Safari, Opera, etc.
      alert('请按 ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Command/Cmd' : 'CTRL') + ' + D 将本页添加到书签。');
    }
  } catch (e) {
    alert('您的浏览器不支持此操作，请手动添加书签。');
  }
}

// 添加左侧菜单控制
const isCollapse = ref(false)
const isMobile = ref(window.innerWidth <= 768)

const handleResize = () => {
  const newIsMobile = window.innerWidth <= 768
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile
    // 在设备类型改变时重置菜单状态
    if (newIsMobile) {
      isCollapse.value = componentStore.leftComDrawer
    } else {
      isCollapse.value = componentStore.leftCom
    }
  }
}

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  // 判断是否为移动端
  if (isMobile.value) {
    componentStore.setleftComDrawerStatus(!componentStore.leftComDrawer)
  } else {
    componentStore.setLeftComStatus(isCollapse.value)
  }
}

onMounted(() => {
  initDailyWord()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)

  // 初始化菜单状态，根据设备类型设置不同的初始值
  if (isMobile.value) {
    isCollapse.value = componentStore.leftComDrawer
  } else {
    isCollapse.value = componentStore.leftCom
  }
})

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  // 清理定时器
  if (dailyWordTimer) {
    clearInterval(dailyWordTimer)
    dailyWordTimer = null
  }
})
</script>

<template>
  <header class="h-14 sm:h-16 w-full flex items-center bg-white border-b border-gray-200 rounded-b-xl">
    <div class="flex items-center">
      <!-- 菜单折叠按钮 -->
      <div class="menu-toggle cursor-pointer pl-4" @click="toggleSidebar">
        <el-icon class="text-gray-500 hover:text-blue-500 text-xl">
          <Expand v-if="isCollapse" />
          <Fold v-else />
        </el-icon>
      </div>

      <!-- 左侧一言 - 仅在 PC 端显示 -->
      <div class="daily-word-outer hidden md:block" @click.stop="getDailyWord">
        <div class="daily-word-wrapper">
          <span class="daily-word-prefix">每日一言：</span>
          <div class="daily-word-content">
            <div>
              <span class="daily-word-text">{{ dailyWord.content }}</span>
              <span class="daily-word-translation" v-if="dailyWord.form">
                —— {{ dailyWord.form }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container mx-auto px-0 md:px-4">
      <div class="flex justify-end items-center w-full">
        <div class="flex items-center gap-4">
          <div class="flex items-center space-x-2.5 pr-4 md:pr-0">
            <!-- 搜索按钮 -->
            <div class="menu-icon-btn" @click="toggleSearch">
              <el-icon class="text-gray-500 hover:text-blue-500">
                <Search />
              </el-icon>
            </div>

            <router-link to="/about" class="menu-icon-btn hover:text-blue-500">
              <el-tooltip content="关于UIED-Tools">
                <svg class="w-5 h-5" viewBox="0 0 1024 1024">
                  <path
                    d="M511.899716 948.506609c-241.310951 0-437.636339-196.318224-437.636339-437.636339 0-241.323231 196.325387-437.639408 437.636339-437.639408s437.636339 196.316178 437.636339 437.639408C949.536055 752.188384 753.210667 948.506609 511.899716 948.506609zM511.899716 113.944122c-218.866776 0-396.926148 178.064488-396.926148 396.926148 0 218.856543 178.059372 396.926148 396.926148 396.926148 218.868823 0 396.926148-178.069605 396.926148-396.926148C908.825864 292.00861 730.768539 113.944122 511.899716 113.944122zM561.15656 335.324138c-29.853935 0-54.03773-24.189935-54.03773-54.047963 0-29.855982 24.184819-54.047963 54.03773-54.047963 29.838585 0 54.0408 24.191982 54.0408 54.047963C615.19736 311.134203 590.995145 335.324138 561.15656 335.324138zM424.962691 430.321746c0-4.394077 0-8.806573 0-13.19758 42.878576-17.016559 108.943224-10.793834 153.201218-26.418696 1.75804 0 3.510964 0 5.27719 0-21.329794 108.134813-66.391083 206.496028-76.599585 316.955792 2.425236 1.850138 2.086521 1.473561 5.287423 2.623757 33.247218 11.155061 52.320623-66.110697 73.948199-60.727083 21.644973 5.38873-13.548574 43.733037-18.47784 50.193169-19.400862 25.362644-56.465013 68.439742-100.376105 68.657706-31.008224 0.181125-63.159482-19.378349-58.101279-71.301929 5.056156-51.981908 34.219359-124.319423 50.172703-182.263114C472.184179 468.050022 488.801648 429.049776 424.962691 430.321746z"
                    fill="currentColor"></path>
                </svg>
              </el-tooltip>
            </router-link>

            <a href="https://tomda.top/" target="_blank" class="menu-icon-btn hover:text-blue-500">
              <el-tooltip content="个人网站">
                <svg class="w-5 h-5" viewBox="0 0 1024 1024">
                  <path
                    d="M290.0992 409.6H155.136a371.4048 371.4048 0 0 0-14.2848 102.4c0 35.5328 4.9664 69.888 14.336 102.4h134.9632c-5.632-32.768-8.4992-66.9184-8.4992-102.4 0-35.4816 2.8672-69.632 8.4992-102.4z m52.0704 0a542.1056 542.1056 0 0 0-9.3696 102.4c0 35.7376 3.072 69.888 9.3696 102.4H486.4V409.6H342.1696z m75.008 461.3632A491.8784 491.8784 0 0 1 301.568 665.6H173.9776a372.0704 372.0704 0 0 0 243.2 205.3632z m69.2224-3.584V665.6H354.9696c24.064 77.1072 67.84 144.2304 131.4304 201.8304zM417.1776 153.088A372.0704 372.0704 0 0 0 173.9776 358.4H301.568a491.8784 491.8784 0 0 1 115.5584-205.3632z m69.2224 3.584C422.8096 214.1184 379.0848 281.2416 354.9696 358.4H486.4V156.5696zM733.9008 409.6c5.632 32.768 8.4992 66.9184 8.4992 102.4 0 35.4816-2.8672 69.632-8.4992 102.4h135.0144c9.3184-32.512 14.2848-66.8672 14.2848-102.4s-4.9664-69.888-14.336-102.4h-134.9632z m-52.0704 0H537.6v204.8h144.2304c6.2464-32.512 9.3696-66.6624 9.3696-102.4s-3.072-69.888-9.3696-102.4z m-75.008 461.3632A372.0704 372.0704 0 0 0 850.0224 665.6H722.432a491.8784 491.8784 0 0 1-115.5584 205.3632z m-69.2224-3.584c63.5904-57.5488 107.3152-124.672 131.4304-201.7792H537.6v201.8304zM606.8224 153.088A491.8784 491.8784 0 0 1 722.432 358.4h127.6416a372.0704 372.0704 0 0 0-243.2-205.3632z m-69.2224 3.584V358.4h131.4304c-24.064-77.1072-67.84-144.2304-131.4304-201.8304zM512 947.2a435.2 435.2 0 1 1 0-870.4 435.2 435.2 0 0 1 0 870.4z"
                    fill="currentColor"></path>
                </svg>
              </el-tooltip>
            </a>

            <el-button type="primary" @click="addToBookmark" class="hidden md:flex ml-2.5">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" fill="currentColor" />
                </svg>
                收藏到书签
              </span>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索组件 -->
    <SearchPanel v-model:visible="showSearch" @select="handleSearchSelect" />
  </header>
</template>
<style scoped>
.fold-enter-active {
  transition: all 1s ease-out;
}

.fold-enter-from,
.fold-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

:deep(.el-select__wrapper) {
  box-shadow: 0 0 0 0px var(--el-input-border-color, var(--el-border-color)) inset;
  cursor: default;
  @apply md:w-full;
}

.el-select :deep(.el-select__wrapper) {
  background-color: rgb(255, 255, 255);
}

/* 一言样式 */
.daily-word-outer {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  margin-left: 12px;
  flex: 1;
  min-width: 200px;
  max-width: fit-content;
}

.daily-word-outer:hover {
  background: #f0edff;
}

.daily-word-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.daily-word-prefix {
  color: #6C54FF;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 2px;
}

.daily-word-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.daily-word-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  display: inline;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.daily-word-translation {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  display: inline;
  margin-left: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}

@media screen and (max-width: 1400px) {
  .daily-word-outer {
    max-width: 800px;
  }
}

@media screen and (max-width: 1200px) {
  .daily-word-outer {
    max-width: 600px;
  }
}

@media screen and (max-width: 992px) {
  .daily-word-outer {
    max-width: 400px;
  }
}

/* 统一图标按钮样式 */
.menu-icon-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #515151;
}

.menu-icon-btn:hover {
  color: #6C54FF;
  transform: translateY(-1px);
}

.menu-icon-btn .el-icon {
  font-size: 20px;
}

/* 修改菜单折叠按钮悬停颜色 */
.menu-toggle .el-icon {
  transition: all 0.3s ease;
}

.menu-toggle:hover .el-icon {
  color: #6C54FF !important;
}

/* 修改收藏到书签按钮样式 */
.el-button.el-button--primary {
  background-color: #6C54FF !important;
  border-color: #6C54FF !important;
  color: #fff !important;
  transition: all 0.3s ease;
}

.el-button.el-button--primary:hover {
  background-color: #5842cc !important;
  border-color: #5842cc !important;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .daily-word-outer {
    display: none;
  }
}
</style>
