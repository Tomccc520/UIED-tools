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
          title: "DeepSeek满血版",
          desc: "免费无限白嫖满血版DeepSeek-R1的隐藏入口，带联网搜索+图片+文档+语音+群聊",
          url: "https://askmany.cn/login?i=bd8ce9a1",
          logo: { type: 'svg', name: 'palette' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1002,
          title: "免费AI编程工具",
          desc: "Chat模式支持 doubao-1.5-pro， DeepSeek R1&amp;V3 三种大模型。",
          url: "https://www.trae.com.cn/?utm_source=advertising&utm_medium=uied_ug_cpa&utm_term=hw_trae_uied",
          logo: { type: 'svg', name: 'palette' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1002,
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
          title: "GPT-4.0",
          desc: "最新版GPT-4.0智能对话工具",
          url: "https://nf.video/oemcwv/?gid=18",
          logo: { type: 'svg', name: 'code' },
          cate: "热门工具",
          isExternal: true
        },
        {
          id: 1008,
          title: "ChatExcel表格",
          desc: "AI Excel 数据分析辅助工具",
          url: "https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6",
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
