import { defineStore } from 'pinia'
import { getToolsCate } from '../../components/Tools/tools'

export interface Tool {
  id: number
  title: string
  logo: string | { type: 'svg', name: string }
  desc: string
  url: string
  cateId?: number
  cate?: string
  children?: Tool[]
  isExternal?: boolean
}

export interface ToolSubCategory {
  id: number
  title: string
  list: Tool[]
}

export interface ToolCategory {
  id: number
  title: string
  icon?: string
  list: ToolSubCategory[]
}

interface State {
  list: Tool[]
  toolInfo: Tool | null
  cates: ToolCategory[]
  recommends: Tool[]
  ipData: any
  webInfo: any
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
    getRecommends() {
      // 从分类中筛选推荐工具
      const allTools: Tool[] = []

      // 收集所有工具
      this.cates.forEach((cate: ToolCategory) => {
        cate.list.forEach((subCategory: ToolSubCategory) => {
          subCategory.list.forEach((tool: Tool) => {
            allTools.push({
              ...tool,
              cate: cate.title
            })
          })
        })
      })

      // 推广工具（对外显示为热门工具）
      const adTools: Tool[] = [
        {
          id: 1000,
          title: "Adobe 正版全家桶可用AI",
          desc: "Adobe正版全家桶软件，包含Photoshop、Illustrator、Premiere Pro等全套设计工具，支持AI功能",
          url: "https://universalbus.cn/?s=lPLG02aydo",
          logo: { type: 'svg', name: 'palette' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1001,
          title: "免费AI编程工具",
          desc: "Chat模式支持 doubao-1.5-pro， DeepSeek R1&amp;V3 三种大模型。",
          url: "https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied",
          logo: { type: 'svg', name: 'palette' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1009,
          title: "AI导航",
          desc: "聚合导航工具，包含AI工具、AI学习网站、AI新闻、AI产品榜等",
          url: "https://www.88sheji.cn/ai",
          logo: { type: 'svg', name: 'palette' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1006,
          title: "AI学习网站",
          desc: "每天逛一逛",
          url: "https://www.uied.cn/category/aigc/ai",
          logo: { type: 'svg', name: 'palette' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1002,
          title: "免费AI生成PPT",
          desc: "AI智能生成PPT",
          url: "https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047",
          logo: { type: 'svg', name: 'presentation' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1003,
          title: "AIGC工具",
          desc: "AI智能工具集合",
          url: "https://universalbus.cn/?s=lPLG02aydo",
          logo: { type: 'svg', name: 'ai' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1004,
          title: "AIGC学习网站",
          desc: "UIED技术团队官网",
          url: "https://uied.cn/",
          logo: { type: 'svg', name: 'learn' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1005,
          title: "Midjourney绘画",
          desc: "AI绘画生成工具",
          url: "https://nf.video/czybtp/?gid=26",
          logo: { type: 'svg', name: 'art' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1007,
          title: "GPT-5.0",
          desc: "最新版GPT-5.0智能对话工具",
          url: "https://nf.video/oemcwv/?gid=18",
          logo: { type: 'svg', name: 'code' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1008,
          title: "AI知识库",
          desc: "AI知识库合集（DeepSeek、豆包、即梦、kimi、GPT等）",
          url: "https://dfz3y4k04g.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink",
          logo: { type: 'svg', name: 'code' },
          cate: "热门工具",
          isExternal: true
        }
      ]

      // 合并推荐工具
      this.recommends = [
        // 热门工具（广告）
        ...adTools
      ]
    },
    async getToolCate() {
      try {
        // 使用 tools.ts 中定义的完整工具列表数据
        this.cates = getToolsCate()
      } catch (error) {
        console.error('获取工具分类失败:', error)
        this.cates = []
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
