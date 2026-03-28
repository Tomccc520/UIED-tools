import { defineStore } from 'pinia'
import { getToolsCate } from '../../components/Tools/tools'
import { getWebInfo } from '../../api/webinfo'
import { getSitePublicConfig, type SiteHotToolItem } from '@/services/siteConfig'
import type { Tool, ToolCategory, ToolSubCategory } from '@/types/tools'

interface ToolInfoQuery {
  id?: number
  title?: string
  route?: string
  cateId?: number
}

interface State {
  list: Tool[]
  toolInfo: Tool | null
  cates: ToolCategory[]
  recommends: Tool[]
  ipData: any
  webInfo: any
}

/**
 * 函数说明：热门工具兜底数据，与后台默认配置保持一致，避免接口异常时出现“链接被替换”感知。
 */
const getFallbackHotTools = (): SiteHotToolItem[] => {
  return [
    { title: 'Adobe 正版全家桶可用AI', desc: 'Adobe 正版全家桶可用AI', link: 'https://universalbus.cn/?s=lPLG02aydo' },
    { title: 'Gemini3 可用 nanobanana', desc: 'Gemini3 可用 nanobanana', link: 'https://universalbus.cn/?s=lPLG02aydo' },
    { title: 'AI学习网站', desc: '每天逛一逛', link: 'https://www.uied.cn/category/aigc/ai' },
    { title: '免费AI生成PPT', desc: 'AI智能生成PPT', link: 'https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047' },
    { title: 'AIGC学习网站', desc: 'UIED技术团队官网', link: 'https://uied.cn/' },
    { title: 'AIGC工具', desc: 'AI智能工具集合', link: 'https://universalbus.cn/?s=lPLG02aydo' },
    { title: 'Midjourney绘画', desc: 'AI绘画生成工具', link: 'https://nf.video/czybtp/?gid=26' },
    { title: 'GPT-5.2', desc: '最新版GPT-5.2智能对话工具', link: 'https://nf.video/oemcwv/?gid=18' },
    { title: 'ChatExcel表格', desc: 'AI Excel 数据分析辅助工具', link: 'https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6' }
  ]
}

/**
 * 函数说明：判断链接是否为外链，支持 http/https 协议
 */
const isExternalLink = (url: string): boolean => /^https?:\/\//i.test(url)

/**
 * 函数说明：将后台热门工具配置转换为前端推荐工具结构
 */
const buildHotTools = (items: SiteHotToolItem[]): Tool[] => {
  return items.map((item, index) => ({
    id: 1000 + index,
    title: item.title,
    desc: item.desc || item.title,
    url: item.link,
    logo: { type: 'svg', name: 'palette' },
    cate: '热门工具',
    isExternal: isExternalLink(item.link)
  }))
}

/**
 * 函数说明：深拷贝工具分类数据，避免组件层对 store 原始数据产生引用污染
 */
const cloneToolCategories = (categories: ToolCategory[]): ToolCategory[] => {
  return categories.map((category) => ({
    ...category,
    list: category.list.map((subCategory) => ({
      ...subCategory,
      list: subCategory.list.map((tool) => ({ ...tool }))
    }))
  }))
}

export const useToolsStore = defineStore('tools', {
  state: (): State => ({
    list: [],
    toolInfo: null,
    cates: [],
    recommends: [],
    ipData: null,
    webInfo: null
  }),
  actions: {
    async getRecommends() {
      // 先回填本地默认值，保证首屏可见
      this.recommends = buildHotTools(getFallbackHotTools())

      try {
        const siteConfig = await getSitePublicConfig({ forceRefresh: true })
        if (siteConfig.hotTools.length > 0) {
          this.recommends = buildHotTools(siteConfig.hotTools)
        }
      } catch (error) {
        console.error('获取热门工具配置失败，使用默认配置:', error)
      }
    },
    async getWebInfo(params: any) {
      try {
        const res: any = await getWebInfo(params)
        if (res.code == 200) {
          this.webInfo = res.data
        } else {
          // 处理错误，或者清空 webInfo
          console.error('Web info fetch failed:', res.message)
          this.webInfo = {} // 或者 null
        }
      } catch (error) {
        console.error('Web info fetch error:', error)
        this.webInfo = {}
      }
    },
    async getToolInfo(params: ToolInfoQuery) {
      try {
        if (!this.cates.length) {
          await this.getToolCate()
        }
        const routeValue = params.route?.trim()
        const toolId = params.id
        const titleValue = params.title?.trim()

        const allTools = this.toolsList()
        const matchedTool = allTools.find(tool => {
          if (routeValue) {
            return tool.url === routeValue
          }
          if (typeof toolId === 'number') {
            return tool.id === toolId
          }
          if (titleValue) {
            return tool.title === titleValue
          }
          return false
        })

        this.toolInfo = matchedTool || null
        return this.toolInfo
      } catch (error) {
        console.error('获取工具详情失败:', error)
        this.toolInfo = null
        return null
      }
    },
    async getToolCate() {
      try {
        // 先回填前端内置工具库，保证接口不可用时功能不受影响
        this.cates = cloneToolCategories(getToolsCate())

        // 再尝试读取后台配置化工具分类，优先使用运营配置
        const siteConfig = await getSitePublicConfig({ forceRefresh: true })
        if (siteConfig.toolCategories.length > 0) {
          this.cates = cloneToolCategories(siteConfig.toolCategories)
        }
      } catch (error) {
        console.error('获取工具分类失败:', error)
        this.cates = cloneToolCategories(getToolsCate())
      }
    },
    toolsList(): Tool[] {
      const allTools: Tool[] = []
      this.cates.forEach((category: ToolCategory) => {
        category.list.forEach((subCategory: ToolSubCategory) => {
          if (Array.isArray(subCategory.list)) {
            subCategory.list.forEach((tool: Tool) => {
              allTools.push({
                ...tool,
                cate: subCategory.title
              })
            })
          }
        })
      })
      return allTools
    },
    getAllTools() {
      // 返回所有工具的扁平数组，包括子分类中的工具
      const allTools: Tool[] = []
      this.cates.forEach((category: ToolCategory) => {
        category.list.forEach((subCategory: ToolSubCategory) => {
          if (Array.isArray(subCategory.list)) {
            subCategory.list.forEach((tool: Tool) => {
              allTools.push({
                ...tool,
                cate: subCategory.title
              })
            })
          }
        })
      })
      return allTools
    }
  }
})
