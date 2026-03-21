import os

# 组件配置列表
components = [
    {
        "name": "CustomAnalysis",
        "title": "自定义分析报告",
        "desc": "针对特定需求生成的深度分析报告，支持自定义分析维度和结构",
        "icon": "ChartBarIcon",
        "color": "indigo",
        "inputs": [
            {"label": "分析主题", "model": "topic", "placeholder": "例如：2024年用户增长分析", "type": "input"},
            {"label": "分析维度", "model": "dimensions", "placeholder": "例如：用户画像、留存率、转化路径...", "type": "textarea", "rows": 3},
            {"label": "详细要求", "model": "requirements", "placeholder": "请输入具体的分析要求或侧重点...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请帮我撰写一份关于${topic}的分析报告。\n分析维度：${dimensions}\n具体要求：${requirements}\n\n要求：\n1. 结构严谨，逻辑清晰。\n2. 数据分析深入，观点独到。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "ResearchReport",
        "title": "研究报告",
        "desc": "智能生成学术或商业研究报告，包含研究背景、方法、发现和结论",
        "icon": "AcademicCapIcon",
        "color": "blue",
        "inputs": [
            {"label": "研究课题", "model": "topic", "placeholder": "例如：人工智能在医疗领域的应用现状", "type": "input"},
            {"label": "研究背景", "model": "background", "placeholder": "简述研究的起因或背景...", "type": "textarea", "rows": 3},
            {"label": "研究目标", "model": "goal", "placeholder": "希望通过研究解决什么问题...", "type": "textarea", "rows": 2}
        ],
        "prompt_template": "请帮我撰写一份关于${topic}的研究报告。\n研究背景：${background}\n研究目标：${goal}\n\n要求：\n1. 包含摘要、背景、方法、主要发现和结论。\n2. 语言学术专业，论证严密。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "ActivityPlan",
        "title": "活动方案",
        "desc": "智能策划各类线上线下活动方案，包含创意亮点、流程安排和执行细节",
        "icon": "CalendarDaysIcon",
        "color": "rose",
        "inputs": [
            {"label": "活动名称", "model": "topic", "placeholder": "例如：双十一品牌促销活动", "type": "input"},
            {"label": "活动目的", "model": "purpose", "placeholder": "例如：提升品牌知名度、增加销售额...", "type": "textarea", "rows": 2},
            {"label": "目标人群", "model": "target", "placeholder": "例如：18-25岁大学生", "type": "input"},
            {"label": "预算范围", "model": "budget", "placeholder": "例如：5-10万元", "type": "input"}
        ],
        "prompt_template": "请帮我策划一份${topic}的活动方案。\n活动目的：${purpose}\n目标人群：${target}\n预算范围：${budget}\n\n要求：\n1. 方案创意新颖，可行性强。\n2. 包含活动主题、时间地点、流程安排、推广计划和预算预估。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "BusinessPlan",
        "title": "商业计划书",
        "desc": "智能生成专业的商业计划书(BP)，助力项目融资和商业路演",
        "icon": "BriefcaseIcon",
        "color": "amber",
        "inputs": [
            {"label": "项目名称", "model": "project", "placeholder": "例如：智能家居生态平台", "type": "input"},
            {"label": "商业模式", "model": "model", "placeholder": "简述产品服务及盈利模式...", "type": "textarea", "rows": 3},
            {"label": "核心优势", "model": "advantage", "placeholder": "例如：技术壁垒、团队资源...", "type": "textarea", "rows": 2},
            {"label": "融资需求", "model": "financing", "placeholder": "例如：天使轮 500万 出让10%", "type": "input"}
        ],
        "prompt_template": "请帮我撰写一份${project}的商业计划书。\n商业模式：${model}\n核心优势：${advantage}\n融资需求：${financing}\n\n要求：\n1. 结构完整，包含执行摘要、市场分析、产品介绍、商业模式、竞争分析和财务预测。\n2. 语言精炼有力，突出投资价值。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "SurveyReport",
        "title": "调研报告",
        "desc": "智能生成市场调研或社会调查报告，深入分析数据背后的趋势",
        "icon": "ClipboardDocumentListIcon",
        "color": "cyan",
        "inputs": [
            {"label": "调研主题", "model": "topic", "placeholder": "例如：Z世代消费习惯调研", "type": "input"},
            {"label": "调研对象", "model": "target", "placeholder": "例如：在一线城市工作的95后", "type": "input"},
            {"label": "调研方法", "model": "method", "placeholder": "例如：问卷调查、深度访谈", "type": "input"},
            {"label": "主要发现", "model": "findings", "placeholder": "简述调研得到的核心数据或现象...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请帮我撰写一份关于${topic}的调研报告。\n调研对象：${target}\n调研方法：${method}\n主要发现：${findings}\n\n要求：\n1. 分析深入，数据详实。\n2. 包含调研背景、方法、结果分析和建议。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "IndustryReport",
        "title": "行业报告",
        "desc": "智能分析行业发展现状、趋势和竞争格局，提供战略参考",
        "icon": "BuildingOffice2Icon",
        "color": "slate",
        "inputs": [
            {"label": "行业名称", "model": "industry", "placeholder": "例如：新能源汽车行业", "type": "input"},
            {"label": "分析时段", "model": "period", "placeholder": "例如：2024-2025年", "type": "input"},
            {"label": "关注重点", "model": "focus", "placeholder": "例如：技术趋势、政策影响、市场规模...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请帮我撰写一份${industry}的行业分析报告。\n分析时段：${period}\n关注重点：${focus}\n\n要求：\n1. 宏观分析与微观分析相结合。\n2. 包含市场规模、竞争格局、发展趋势和风险提示。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "FeasibilityReport",
        "title": "可行性研究报告",
        "desc": "全面评估项目的技术、经济和社会可行性，为决策提供依据",
        "icon": "CheckBadgeIcon",
        "color": "emerald",
        "inputs": [
            {"label": "项目名称", "model": "project", "placeholder": "例如：新建年产5万吨锂电池工厂", "type": "input"},
            {"label": "建设内容", "model": "content", "placeholder": "简述项目建设的主要内容和规模...", "type": "textarea", "rows": 3},
            {"label": "投资估算", "model": "investment", "placeholder": "例如：总投资2亿元", "type": "input"}
        ],
        "prompt_template": "请帮我撰写一份${project}的可行性研究报告。\n建设内容：${content}\n投资估算：${investment}\n\n要求：\n1. 从技术、经济、社会、环境等方面进行全面评估。\n2. 包含项目背景、必要性、可行性分析、风险评估和结论。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "ProjectApplication",
        "title": "立项申请报告",
        "desc": "智能生成规范的项目立项申请书，清晰阐述项目价值和实施计划",
        "icon": "DocumentPlusIcon",
        "color": "violet",
        "inputs": [
            {"label": "项目名称", "model": "project", "placeholder": "例如：企业数字化转型一期项目", "type": "input"},
            {"label": "项目背景", "model": "background", "placeholder": "为什么要发起这个项目...", "type": "textarea", "rows": 3},
            {"label": "预期收益", "model": "benefits", "placeholder": "项目完成后带来的经济或社会效益...", "type": "textarea", "rows": 2}
        ],
        "prompt_template": "请帮我撰写一份${project}的立项申请报告。\n项目背景：${background}\n预期收益：${benefits}\n\n要求：\n1. 论述充分，目标明确。\n2. 包含项目概况、必要性、实施方案、进度计划和预算需求。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "PESTAnalysis",
        "title": "PEST分析",
        "desc": "利用PEST模型从政治、经济、社会、技术四个维度分析宏观环境",
        "icon": "GlobeAsiaAustraliaIcon",
        "color": "sky",
        "inputs": [
            {"label": "分析对象", "model": "target", "placeholder": "例如：跨境电商行业、某公司出海战略", "type": "input"},
            {"label": "背景信息", "model": "background", "placeholder": "补充相关的背景信息（可选）...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请运用PEST模型对${target}进行宏观环境分析。\n背景信息：${background}\n\n要求：\n1. 分别从政治(Political)、经济(Economic)、社会(Social)、技术(Technological)四个维度进行深入分析。\n2. 结合具体情况，给出战略建议。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "SWOTAnalysis",
        "title": "SWOT分析",
        "desc": "利用SWOT模型分析优势、劣势、机会和威胁，制定战略对策",
        "icon": "ArrowsPointingOutIcon",
        "color": "orange",
        "inputs": [
            {"label": "分析对象", "model": "target", "placeholder": "例如：某品牌新产品、个人职业发展", "type": "input"},
            {"label": "具体情况", "model": "details", "placeholder": "简述分析对象的现状和面临的问题...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请运用SWOT模型对${target}进行战略分析。\n具体情况：${details}\n\n要求：\n1. 详细分析优势(Strengths)、劣势(Weaknesses)、机会(Opportunities)和威胁(Threats)。\n2. 基于分析结果，提出SO、WO、ST、WT战略组合建议。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "TransportPlan",
        "title": "运输方案",
        "desc": "智能规划物流运输路线和方式，优化成本和效率",
        "icon": "TruckIcon",
        "color": "lime",
        "inputs": [
            {"label": "货物类型", "model": "goods", "placeholder": "例如：精密仪器、生鲜食品", "type": "input"},
            {"label": "起止地点", "model": "route", "placeholder": "例如：从上海到法兰克福", "type": "input"},
            {"label": "运输要求", "model": "requirements", "placeholder": "例如：全程冷链、时效3天以内...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请帮我制定一份${goods}的运输方案。\n起止地点：${route}\n运输要求：${requirements}\n\n要求：\n1. 综合考虑成本、时效和安全性。\n2. 包含运输方式选择、路线规划、包装方案、风险控制和应急预案。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "SituationReport",
        "title": "情况报告",
        "desc": "客观陈述事件经过或当前状态，分析原因并提出处理意见",
        "icon": "InformationCircleIcon",
        "color": "zinc",
        "inputs": [
            {"label": "事件/情况", "model": "event", "placeholder": "例如：服务器宕机事故、突发公共卫生事件", "type": "input"},
            {"label": "当前状态", "model": "status", "placeholder": "目前的情况如何...", "type": "textarea", "rows": 3},
            {"label": "拟采取措施", "model": "measures", "placeholder": "计划如何处理...", "type": "textarea", "rows": 2}
        ],
        "prompt_template": "请帮我撰写一份关于${event}的情况报告。\n当前状态：${status}\n拟采取措施：${measures}\n\n要求：\n1. 实事求是，语言客观。\n2. 包含基本情况、原因分析、已采取措施、下一步计划和建议。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "SevenSAnalysis",
        "title": "7S模型分析",
        "desc": "利用麦肯锡7S模型全方位分析企业组织有效性",
        "icon": "CubeTransparentIcon",
        "color": "fuchsia",
        "inputs": [
            {"label": "分析对象", "model": "target", "placeholder": "例如：某公司的组织架构改革", "type": "input"},
            {"label": "背景信息", "model": "background", "placeholder": "简述企业现状和存在的问题...", "type": "textarea", "rows": 3}
        ],
        "prompt_template": "请运用麦肯锡7S模型对${target}进行组织分析。\n背景信息：${background}\n\n要求：\n1. 从战略(Strategy)、结构(Structure)、制度(Systems)、人员(Staff)、风格(Style)、技能(Skills)、共同价值观(Shared Values)七个维度进行剖析。\n2. 分析各要素之间的相互作用和匹配程度，提出改进建议。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "Marketing4P",
        "title": "4P营销分析",
        "desc": "利用4P理论制定产品营销组合策略",
        "icon": "ShoppingBagIcon",
        "color": "pink",
        "inputs": [
            {"label": "产品/服务", "model": "product", "placeholder": "例如：新款智能手表", "type": "input"},
            {"label": "目标市场", "model": "market", "placeholder": "例如：城市白领、运动爱好者", "type": "input"},
            {"label": "营销目标", "model": "goal", "placeholder": "例如：首发月销量突破1万台", "type": "input"}
        ],
        "prompt_template": "请运用4P营销理论为${product}制定营销策略。\n目标市场：${market}\n营销目标：${goal}\n\n要求：\n1. 详细规划产品(Product)、价格(Price)、渠道(Place)和促销(Promotion)策略。\n2. 策略要具体可执行，符合市场定位。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "IndustryConsultant",
        "title": "产业顾问",
        "desc": "模拟资深产业顾问，解答行业疑惑，提供专业见解",
        "icon": "UserGroupIcon",
        "color": "teal",
        "inputs": [
            {"label": "咨询问题", "model": "question", "placeholder": "例如：未来5年光伏产业的发展前景如何？", "type": "textarea", "rows": 3},
            {"label": "行业背景", "model": "context", "placeholder": "补充相关的行业或地区背景...", "type": "input"}
        ],
        "prompt_template": "你是一位资深的产业顾问，请回答以下问题：\n${question}\n行业背景：${context}\n\n要求：\n1. 观点专业，数据支撑。\n2. 结合产业链上下游进行分析。\n3. 给出具有前瞻性的判断和建议。\n4. 标题使用 Markdown 三级标题格式（### 标题）。"
    },
    {
        "name": "StartupIdea",
        "title": "创新创业金点子",
        "desc": "结合个人优势和市场趋势，激发创新创业灵感",
        "icon": "LightBulbIcon",
        "color": "yellow",
        "inputs": [
            {"label": "感兴趣领域", "model": "field", "placeholder": "例如：银发经济、宠物市场", "type": "input"},
            {"label": "个人优势/资源", "model": "advantage", "placeholder": "例如：懂技术、有供应链资源...", "type": "textarea", "rows": 2}
        ],
        "prompt_template": "请基于${field}领域，结合我的优势：${advantage}，提供5个创新创业的金点子。\n\n要求：\n1. 每个点子包含项目名称、痛点分析、解决方案、商业模式和可行性评估。\n2. 点子要新颖且具有落地可能性。\n3. 标题使用 Markdown 三级标题格式（### 标题）。"
    }
]

template = """<!--
 * @file {name}.vue
 * @description AI{title}工具
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2025-12-16
 -->

<template>
  <div class="min-h-screen">
    <div class="mx-auto">
      <div class="bg-white rounded-xl p-8 mb-4 shadow-sm">
        <div class="text-center mb-10 relative">
          <div class="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div class="w-64 h-64 bg-{color}-400 rounded-full blur-3xl"></div>
            <div class="w-64 h-64 bg-{color}-600 rounded-full blur-3xl -ml-20"></div>
          </div>
          <h2
            class="text-4xl font-bold mb-4 relative inline-block bg-clip-text text-transparent bg-gradient-to-r from-{color}-600 to-{color}-500">
            {title}
          </h2>
          <p class="text-gray-500 text-lg max-w-2xl mx-auto relative z-10">{desc}</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100 sticky top-4">
              <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <span class="w-8 h-8 rounded-lg bg-{color}-100 text-{color}-600 flex items-center justify-center mr-3">
                  <{icon} class="w-5 h-5" />
                </span>
                配置信息
              </h3>

              <div class="space-y-5">
{inputs_html}
                <div class="pt-4">
                  <button @click="generateContent" :disabled="isGenerating || !form.{first_model}"
                    class="group w-full py-3.5 px-4 bg-gradient-to-r from-{color}-600 to-{color}-500 hover:from-{color}-700 hover:to-{color}-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-{color}-500/30 hover:shadow-{color}-500/40 transform active:scale-[0.98]">
                    <span v-if="!isGenerating" class="flex items-center">
                      <PencilSquareIcon class="w-5 h-5 mr-2" />
                      生成内容
                    </span>
                    <span v-else class="flex items-center">
                      <svg class="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                      AI正在思考中...
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-8">
            <div class="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-[900px] bg-white shadow-sm">
              <div class="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <DocumentTextIcon class="w-5 h-5" />
                  </div>
                  <span class="font-medium text-gray-700">生成结果</span>
                </div>
                <div class="flex space-x-2">
                  <button @click="copyContent" :disabled="!resultText"
                    class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="复制内容">
                    <ClipboardDocumentIcon class="w-5 h-5" />
                  </button>
                  <button @click="downloadText" :disabled="!resultText"
                    class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="下载文件">
                    <ArrowDownTrayIcon class="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div class="flex-1 p-6 overflow-y-auto custom-scrollbar">
                <div v-if="resultText" class="prose prose-slate max-w-none">
                  <MarkdownRenderer :content="resultText" />
                </div>
                <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
                  <SparklesIcon class="w-16 h-16 mb-4 opacity-20" />
                  <p>在左侧输入信息，AI将为您生成{title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import {
  {icon},
  PencilSquareIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowDownTrayIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import { generateAIWriting } from '@/utils/aiUtils'

const form = reactive({
{form_fields}
})

const isGenerating = ref(false)
const resultText = ref('')

const generateContent = async () => {
  if (!form.{first_model}) {
    ElMessage.warning('请输入必要信息')
    return
  }

  try {
    isGenerating.value = true
    resultText.value = ''

    // 构建提示词
    const prompt = `{prompt_template}`
      {prompt_replacements}

    await generateAIWriting({
      prompt,
      systemPrompt: '你是一个专业的分析师和文档撰写专家，擅长编写各类高质量的分析报告和方案。',
      temperature: 0.7
    }, (content) => {
      resultText.value += content
    })

    ElMessage.success('生成完成')
  } catch (error) {
    ElMessage.error('生成失败，请稍后重试')
  } finally {
    isGenerating.value = false
  }
}

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(resultText.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const downloadText = () => {
  const blob = new Blob([resultText.value], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '{title}.md'
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.custom-input :deep(.el-input__wrapper),
.custom-input :deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #e5e7eb;
  padding: 8px 12px;
  transition: all 0.2s;
}

.custom-input :deep(.el-input__wrapper):hover,
.custom-input :deep(.el-textarea__inner):hover {
  box-shadow: 0 0 0 1px #a5b4fc;
}

.custom-input :deep(.el-input__wrapper.is-focus),
.custom-input :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px #6366f1;
}
</style>
"""

base_path = "/Users/tangxiaoda/Desktop/网站备份/tools-web-master 2/tools-web/src/components/Tools/AI/Analysis"

for comp in components:
    inputs_html = ""
    form_fields = ""
    prompt_replacements = ""

    for i, inp in enumerate(comp["inputs"]):
        # HTML
        inputs_html += f"""                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">{inp['label']}</label>
"""
        if inp['type'] == 'input':
            inputs_html += f"""                  <el-input v-model="form.{inp['model']}" placeholder="{inp['placeholder']}" size="large" clearable class="custom-input" />
                </div>
"""
        else:
            inputs_html += f"""                  <el-input v-model="form.{inp['model']}" type="textarea" :rows="{inp.get('rows', 3)}" placeholder="{inp['placeholder']}" class="custom-input" />
                </div>
"""

        # JS Form Fields
        form_fields += f"  {inp['model']}: '',\n"

        # Prompt Replacements
        prompt_replacements += f".replace('${{{inp['model']}}}', form.{inp['model']} || '未指定')\n      "

    # Fill template
    content = template.replace("{name}", comp["name"]) \
                      .replace("{title}", comp["title"]) \
                      .replace("{desc}", comp["desc"]) \
                      .replace("{color}", comp["color"]) \
                      .replace("{icon}", comp["icon"]) \
                      .replace("{inputs_html}", inputs_html.rstrip()) \
                      .replace("{first_model}", comp["inputs"][0]["model"]) \
                      .replace("{form_fields}", form_fields.rstrip()) \
                      .replace("{prompt_template}", comp["prompt_template"]) \
                      .replace("{prompt_replacements}", prompt_replacements.rstrip())

    # Write file
    file_path = os.path.join(base_path, f"{comp['name']}.vue")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {file_path}")

print("All files generated successfully!")
