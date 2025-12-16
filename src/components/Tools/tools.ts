import { toolIcons } from './icons'

// 基础工具接口
interface BaseTool {
  id: number
  title: string
}

// 具体工具接口
interface Tool extends BaseTool {
  logo: string | { type: 'svg', name: keyof typeof toolIcons }
  desc: string
  url: string
  cateId?: number
  cate: string
  isExternal?: boolean
  releaseDate?: string
  tags?: string[]
  icon?: string
  isNew?: boolean
}

// 工具子分类接口
interface ToolSubCategory extends BaseTool {
  list: Tool[]
}

// 工具分类接口
interface ToolCategory extends BaseTool {
  icon: string
  list: ToolSubCategory[]
}

interface ToolsReqData {
  cateId: number
  title: string
}

//获取tools分类与对应的工具
export function getToolsCate(): ToolCategory[] {
  return [
    {
      id: 0,
      title: 'AI工具箱',
      icon: '',
      list: [
        {
          id: 1,
          title: 'DeepSeek',
          list: [
            {
              id: 1004,
              title: 'DeepSeek导航',
              logo: { type: 'svg', name: 'deepseek' },
              desc: '发现免费好用的DeepSeek模型服务，包含多轮对话、清晰的速度标识、在线状态等信息',
              url: '/tools/ai/deepseek-nav',
              cate: 'DeepSeek',
              releaseDate: '2024/3/21 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1001,
              title: 'DeepSeek AI对话',
              logo: { type: 'svg', name: 'deepseek' },
              desc: '基于最新DeepSeekChat API的智能对话工具，支持上下文记忆，让AI对话更智能、更流畅',
              url: '/tools/ai/deepseek',
              cate: 'DeepSeek'
            },
            {
              id: 1002,
              title: 'DeepSeek R1 对话',
              logo: { type: 'svg', name: 'deepseekR1' },
              desc: '基于硅基流动大模型平台的 DeepSeek-R1 模型，支持上下文记忆，最大输出长度8192 tokens',
              url: '/tools/ai/deepseek-r1',
              cate: 'DeepSeek'
            },
            {
              id: 1003,
              title: 'DeepSeek应用指令库',
              logo: { type: 'svg', name: 'deepseekPrompt' },
              desc: '收录精选的DeepSeek提示词和应用场景指令，帮助您更好地使用DeepSeek AI进行创作和工作',
              url: '/tools/ai/deepseek-prompt',
              cate: 'DeepSeek',
              releaseDate: '2024/3/20 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 9,
          title: 'AI办公工具',
          list: [
            {
              id: 901,
              title: '自定义总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '灵活生成各类总结文档，支持自定义主题和结构，满足个性化需求',
              url: '/tools/ai/office/custom-summary',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 902,
              title: '工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业的工作总结，包含工作成果、问题分析和未来规划',
              url: '/tools/ai/work-summary',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 903,
              title: '述职报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成个人述职报告，突出工作业绩和职业亮点',
              url: '/tools/ai/debriefing-report',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 904,
              title: '年度工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '全面总结年度工作成果，分析不足，规划未来发展',
              url: '/tools/ai/work-summary?type=annual',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 905,
              title: '简历制作',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业简历，优化工作经历和技能描述，提升求职成功率',
              url: '/tools/ai/office/resume-creation',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 906,
              title: '工作方案',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成详细的工作实施方案，明确目标、步骤和资源配置',
              url: '/tools/ai/office/work-plan',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 907,
              title: '项目策划方案',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业的项目策划方案，包含背景、目标、实施计划和预算预估',
              url: '/tools/ai/project-proposal',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 908,
              title: '放假通知',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成规范、温馨的放假通知，包含放假时间、调休安排和注意事项',
              url: '/tools/ai/office/holiday-notice',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 909,
              title: '工作汇报',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成条理清晰、重点突出的工作汇报，展示工作成果和价值',
              url: '/tools/ai/office/work-report',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 910,
              title: '通知撰写',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类办公通知、会议通知、行政通告，格式规范，用词精准',
              url: '/tools/ai/office/notice-writing',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 911,
              title: '季度工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '系统回顾季度工作进展，总结经验教训，制定下季度计划',
              url: '/tools/ai/work-summary?type=quarterly',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 912,
              title: '年中工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '全面复盘上半年工作，总结得失，为下半年工作指明方向',
              url: '/tools/ai/work-summary?type=mid_year',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 913,
              title: '半年工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '对半年度工作进行系统梳理和总结，展望下半年工作重点',
              url: '/tools/ai/work-summary?type=mid_year',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 914,
              title: '部门计划',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成部门年度、季度或月度工作计划，明确团队目标和分工',
              url: '/tools/ai/office/work-plan?type=department',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 915,
              title: '工作考核总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成个人或团队绩效考核总结，客观评价工作表现',
              url: '/tools/ai/work-summary?type=performance',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 916,
              title: '转正工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成试用期转正工作总结，展示试用期成果和成长',
              url: '/tools/ai/work-summary?type=probation',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 917,
              title: '晋升工作总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成晋升述职报告，突出业绩贡献和能力提升，助力职场晋升',
              url: '/tools/ai/work-summary?type=promotion',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 918,
              title: '工作感想',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '记录工作中的所思所感，总结经验，提升职业认知',
              url: '/tools/ai/office/work-reflections',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 919,
              title: '申请报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类申请报告，如物资申请、调岗申请等，格式规范',
              url: '/tools/ai/office/application-report',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 920,
              title: '辞职报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成得体、专业的辞职报告，保持良好职业形象',
              url: '/tools/ai/office/resignation-letter',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 921,
              title: '培训方案',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能设计员工培训方案，包含课程设置、讲师安排和考核方式',
              url: '/tools/ai/office/training-scheme',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 922,
              title: '工作计划',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成个人近期工作计划，条理清晰，目标明确',
              url: '/tools/ai/office/work-plan?type=personal',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 923,
              title: '合同模版',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类常用合同模版，条款清晰，规避法律风险',
              url: '/tools/ai/office/contract-template',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 924,
              title: '润色会议纪要',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能整理和润色会议记录，生成结构清晰、重点突出的会议纪要',
              url: '/tools/ai/office/meeting-minutes',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 925,
              title: 'OKR制定',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能协助制定目标与关键结果（OKR），确保目标聚焦且可衡量',
              url: '/tools/ai/office/okr-generator',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 926,
              title: '写代码',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成高质量代码片段、函数或完整脚本，支持多种编程语言',
              url: '/tools/ai/office/code-generator',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 927,
              title: '招聘JD',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业、吸引人的职位描述（JD），提高招聘效率',
              url: '/tools/ai/office/job-description',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 928,
              title: '起诉书',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能辅助起草起诉书，格式规范，逻辑严密（仅供参考）',
              url: '/tools/ai/office/lawsuit-document',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 929,
              title: '工作培训总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '总结参加培训的学习收获和感悟，制定应用计划',
              url: '/tools/ai/work-summary?type=training',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 931,
              title: '工作日报',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '快速生成今日工作总结、问题反馈和明日计划',
              url: '/tools/ai/office/work-report?type=daily',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 932,
              title: '工作周报',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '系统梳理本周工作进展，分析问题，规划下周重点',
              url: '/tools/ai/office/work-report?type=weekly',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 933,
              title: '会议记录润色',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能整理和润色会议记录，生成结构清晰、重点突出的会议纪要',
              url: '/tools/ai/office/meeting-minutes',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 934,
              title: '竟聘演讲稿',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业、有感染力的岗位竞聘演讲稿，助您脱颖而出',
              url: '/tools/ai/office/competitor-speech',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 935,
              title: '设计理念',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成独特、有深度的设计理念阐述，提升设计作品的价值感',
              url: '/tools/ai/office/design-concept',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 936,
              title: '离职申请',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成得体、专业的辞职报告，保持良好职业形象',
              url: '/tools/ai/office/resignation-letter',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 937,
              title: '问卷设计',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成科学、合理的调查问卷，提高数据收集的有效性',
              url: '/tools/ai/office/questionnaire-design',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 938,
              title: '通稿润色改写',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能改写文本，降低查重率，优化语言表达，提升文章质量',
              url: '/tools/ai/article-polishing',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 939,
              title: '标书撰写',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能辅助撰写投标文件，包含技术方案、商务标和实施计划等核心内容',
              url: '/tools/ai/office/tender-writing',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 940,
              title: '求职信',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成真诚、得体的求职信，向招聘方展示您的热情和能力',
              url: '/tools/ai/office/cover-letter',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 941,
              title: '访谈提纲',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能设计专业的访谈提纲，确保访谈过程高效、深入',
              url: '/tools/ai/office/interview-outline',
              cate: 'AI办公工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1018,
              title: '评论分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能分析用户评论，提取情感倾向、关键观点和改进建议',
              url: '/tools/ai/analysis/review-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1019,
              title: '竞品分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '全方位对比分析竞争对手，洞察市场机会，制定差异化竞争策略',
              url: '/tools/ai/analysis/competitive-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1020,
              title: '数据分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能解读数据背后的趋势与规律，提供专业的分析洞察',
              url: '/tools/ai/analysis/data-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1021,
              title: '行业分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '深度解析行业现状、发展趋势和竞争格局，把握行业脉搏',
              url: '/tools/ai/analysis/industry-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1022,
              title: '市场分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '精准定位目标市场，分析受众特征，发掘商业增长点',
              url: '/tools/ai/analysis/market-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1023,
              title: '产品分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '全方位拆解产品要素，评估产品竞争力，提供优化建议',
              url: '/tools/ai/analysis/product-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1024,
              title: '用户画像',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '基于产品特征构建精准用户画像，深入理解目标受众',
              url: '/tools/ai/analysis/user-profile',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1025,
              title: '需求分析',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '专业梳理业务需求，转化为清晰的功能规范和用户故事',
              url: '/tools/ai/analysis/requirements-analysis',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 1026,
              title: '代码解释',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能解析代码逻辑，分析算法复杂度，提供优化建议',
              url: '/tools/ai/analysis/code-explanation',
              cate: 'AI分析报告',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },

        {
          id: 2,
          title: 'AI对话助手',
          list: [
            {
              id: 100,
              title: '免费AI聚合聊天',
              logo: { type: 'svg', name: 'aiChat' },
              desc: '聚合多种AI大模型，支持智能对话、代码编写、创意写作等，基于Ant Design X设计风格',
              url: '/tools/ai/chat',
              cate: 'AI对话助手',
              releaseDate: '2025/12/03 10:00:00',
              tags: ['免费', '多模型', '新品'],
              isNew: true
            },
            {
              id: 103,
              title: '讯飞星火 Lite1.5',
              logo: { type: 'svg', name: 'xunfeiSpark' },
              desc: '基于讯飞星火认知大模型的智能对话工具，支持多轮对话，提供自然流畅的对话体验',
              url: '/tools/ai/xunfei-spark',
              cate: 'AI对话助手'
            }
          ]
        },
        {
          id: 3,
          title: 'AI提示词',
          list: [
            {
              id: 202,
              title: 'AIGC提示词编辑器',
              logo: { type: 'svg', name: 'aiPrompt' },
              desc: '专业的 AI 绘图提示词编辑工具，支持可视化编辑和智能优化',
              url: '/tools/ai/prompt-editor',
              cate: 'AI提示词'
               },
            {
              id: 406,
              title: '免费图片提示词反推',
              logo: { type: 'svg', name: 'promptReverse' },
              desc: '上传图片智能反推提示词，支持Flux、Stable Diffusion、Midjourney等多种模型',
              url: '/tools/ai/prompt-reverse',
              cate: 'AI图像工具',
              releaseDate: '2025/12/02 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 4,
          title: 'AI设计工具',
          list: [
            {
              id: 302,
              title: 'AI生成设计封面',
              logo: { type: 'svg', name: 'aiCover' },
              desc: '使用AI技术智能生成精美的设计封面，支持多种风格和布局，一键生成专业级封面设计',
              url: '/tools/ai-design-cover',
              cate: 'AI设计工具',
              releaseDate: '2024/3/19 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 301,
              title: 'AI生成矢量图标',
              logo: { type: 'svg', name: 'aiIcon' },
              desc: '使用DeepSeek AI生成高质量的矢量图标，支持多种风格和格式',
              url: '/tools/ai/icon-generator',
              cate: 'AI设计工具',
              releaseDate: '2024/2/8 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 5,
          title: 'AI图像工具',
          list: [
            {
              id: 407,
              title: 'AI智能去水印',
              logo: { type: 'svg', name: 'removeWatermark' },
              desc: '免费在线AI智能去水印工具，自动识别并移除图片水印，支持JPG/PNG等格式',
              url: '/tools/ai/remove-watermark',
              cate: 'AI图像工具',
              releaseDate: '2025/12/04 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 401,
              title: 'StableDiffusion AI绘画',
              logo: { type: 'svg', name: 'stableDiffusion' },
              desc: '使用AI技术，将文字描述转换为精美图片，支持多种尺寸和风格',
              url: '/tools/ai/stable-diffusion',
              cate: 'AI图像工具',
              releaseDate: '2024/1/27 15:30:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 402,
              title: 'AI图片变清晰',
              logo: { type: 'svg', name: 'imageEnhance' },
              desc: '使用AI技术提升图片清晰度，让模糊图片变得清晰',
              url: '/tools/ai/image-enhance',
              cate: 'AI图像工具',
              releaseDate: '2024/1/27 14:30:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 403,
              title: 'AI艺术二维码',
              logo: { type: 'svg', name: 'aiQrcode' },
              desc: '使用AI技术，将普通二维码转换为艺术作品，支持多种场景和风格',
              url: '/tools/ai/qrcode',
              cate: 'AI图像工具',
              releaseDate: '2024/1/27 16:30:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 404,
              title: 'OCR图像文字识别',
              logo: { type: 'svg', name: 'ocr' },
              desc: '支持多语言文字识别，快速提取图片中的文字内容',
              url: '/tools/ai/ocr',
              cate: 'AI图像工具',
              releaseDate: '2024/2/8 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 405,
              title: '小红书风格图片生成',
              logo: { type: 'svg', name: 'xiaohongshu' },
              desc: '一键生成小红书风格的图片，支持自定义内容和样式，快速美化你的图文笔记',
              url: '/tools/xiaohongshu',
              cate: 'AI图像工具',
              releaseDate: '2024/2/7 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 6,
          title: 'AI文档工具',
          list: [
            {
              id: 501,
              title: 'AI简历生成器',
              logo: { type: 'svg', name: 'resume' },
              desc: '使用AI技术，一键生成专业简历，支持多种模板和导出为PDF，让求职更加高效',
              url: '/tools/ai/resume',
              cate: 'AI文档工具',
              releaseDate: '2024/7/18 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 7,
          title: 'AI效率工具',
          list: [
            {
              id: 601,
              title: 'AI外包报价单生成器',
              logo: { type: 'svg', name: 'aiQuote' },
              desc: '智能生成专业的外包项目报价单，支持程序开发、短视频制作、设计等多种项目类型，AI智能分析项目需求并生成合理报价',
              url: '/tools/ai-outsource-quote',
              cate: 'AI效率工具',
              releaseDate: '2024/3/20 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
              },
            {
              id: 602,
              title: '免费在线文本配音',
              logo: { type: 'svg', name: 'microphone' },
              desc: '免费在线文本转语音工具，支持多种角色和情感风格，一键生成自然流畅的语音配音',
              url: '/tools/ai/text-to-speech',
              cate: 'AI效率工具',
              releaseDate: '2024/12/03 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 603,
              title: 'AI实时快讯',
              logo: { type: 'svg', name: 'aiNews' },
              desc: '实时展示最新AI科技资讯，及时了解人工智能领域的最新动态和发展趋势',
              url: '/tools/ai-news',
              cate: 'AI效率工具',
              isNew: true,
              tags: ['免费', '资讯']
            }
          ]
        },
        {
          id: 8,
          title: 'AI写作工具',
          list: [
            {
              id: 701,
              title: 'AI文章生成',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成高质量文章，支持多种风格和用途，助您高效创作',
              url: '/tools/ai/article-generator',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 702,
              title: 'AI工作总结',
              logo: { type: 'svg', name: 'aiArticle' }, // Reusing icon for now
              desc: '智能生成专业的工作总结，包含工作成果、问题分析和未来规划',
              url: '/tools/ai/work-summary',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 703,
              title: 'AI实习总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成高质量的实习总结报告，记录成长点滴，助力职场起步',
              url: '/tools/ai/intern-summary',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 704,
              title: 'AI实践报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成社会实践报告，记录实践过程，总结实践经验',
              url: '/tools/ai/practice-report',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 705,
              title: 'AI分析报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业的数据分析、市场分析或问题分析报告，提供深度洞察',
              url: '/tools/ai/analysis-report',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 706,
              title: 'AI周报总结',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成结构化周报，清晰展示工作进度，提升沟通效率',
              url: '/tools/ai/weekly-summary',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 707,
              title: '读后感/读书笔记',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成高质量读后感和读书笔记，支持多种书籍类型',
              url: '/tools/ai/book-review',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 708,
              title: '文献综述',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业文献综述，支持多种学术领域',
              url: '/tools/ai/literature-review',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 709,
              title: '培训心得',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成培训心得体会，总结学习收获和感悟',
              url: '/tools/ai/training-experience',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 710,
              title: '工作汇报PPT',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成工作汇报PPT大纲和内容脚本，助力高效汇报',
              url: '/tools/ai/work-report-ppt',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 711,
              title: '演讲稿',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成精彩演讲稿，支持多种场合和风格',
              url: '/tools/ai/speech-draft',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 712,
              title: '小说剧情创作',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成小说剧情大纲、角色设定和故事梗概',
              url: '/tools/ai/novel-plot',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 713,
              title: '述职报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成个人述职报告，突出工作业绩和职业亮点',
              url: '/tools/ai/debriefing-report',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 714,
              title: '作文一键写作',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类作文，支持不同年级和题材要求',
              url: '/tools/ai/essay-writing',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 715,
              title: '小红书笔记生成',
              logo: { type: 'svg', name: 'xiaohongshu' },
              desc: '智能生成小红书风格笔记，包含Emoji和种草文案',
              url: '/tools/ai/xiaohongshu-note',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 716,
              title: '小红书爆款标题',
              logo: { type: 'svg', name: 'xiaohongshu' },
              desc: '智能生成吸引眼球的小红书爆款标题，提升点击率',
              url: '/tools/ai/xiaohongshu-title',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 717,
              title: '小红书笔记改写',
              logo: { type: 'svg', name: 'xiaohongshu' },
              desc: '一键将普通文本改写为小红书风格笔记，增加吸引力',
              url: '/tools/ai/xiaohongshu-rewrite',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 718,
              title: '征文',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类征文稿件，紧扣主题，文采斐然',
              url: '/tools/ai/essay-contest',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 719,
              title: '发言稿',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类会议、活动发言稿，得体大方',
              url: '/tools/ai/spokesperson-speech',
              cate: 'AI写作工具',
              releaseDate: '2025/12/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 720,
              title: '文献推荐',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能推荐相关领域的高质量文献，助力学术研究和论文写作',
              url: '/tools/ai/literature-recommend',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 721,
              title: '检讨书',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成态度诚恳、深刻反省的检讨书，助您表达歉意和改进决心',
              url: '/tools/ai/self-reflection',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 722,
              title: '项目策划方案',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成专业的项目策划方案，包含背景、目标、实施计划和预算预估',
              url: '/tools/ai/project-proposal',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 723,
              title: '讲话稿',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成各类场合的领导讲话稿、致辞，得体大方，富有感染力',
              url: '/tools/ai/speech-script',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 724,
              title: '短视频标题',
              logo: { type: 'svg', name: 'xiaohongshu' },
              desc: '智能生成吸引眼球的短视频爆款标题，提升播放量和点击率',
              url: '/tools/ai/short-video-title',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 725,
              title: '短视频剧本',
              logo: { type: 'svg', name: 'xiaohongshu' },
              desc: '智能生成专业的分镜头脚本，包含画面、台词、运镜和音效指导',
              url: '/tools/ai/short-video-script',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 726,
              title: '长文/报告摘要',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能提炼长文和报告的核心观点，快速生成精准摘要，提高阅读效率',
              url: '/tools/ai/article-summary',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 727,
              title: '开题报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成标准规范的开题报告，包含选题意义、研究现状、内容方法和进度安排',
              url: '/tools/ai/opening-report',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 728,
              title: '长文/报告大纲',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能生成逻辑清晰、结构严谨的文章/报告大纲，理清写作思路',
              url: '/tools/ai/article-outline',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 729,
              title: '文章降重润色',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能改写文本，降低查重率，优化语言表达，提升文章质量',
              url: '/tools/ai/article-polishing',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 730,
              title: '毕业长文/报告',
              logo: { type: 'svg', name: 'aiArticle' },
              desc: '智能辅助生成毕业论文初稿，包含摘要、正文和参考文献，助力学术写作',
              url: '/tools/ai/graduation-thesis',
              cate: 'AI写作工具',
              releaseDate: '2025/12/16 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        }
      ]
    },
    {
      id: 1,
      title: '设计工具',
      icon: '',
      list: [
        {
          id: 11,
          title: '在线工具',
          list: [
            {
              id: 114,
              title: '栅格计算器',
              logo: { type: 'svg', name: 'grid' },
              desc: '快速计算和预览网页栅格布局系统，支持自定义列数、间距等参数',
              url: '/tools/design/grid',
              cate: '在线工具'
            },
            {
              id: 112,
              title: '配色方案生成器',
              logo: { type: 'svg', name: 'colorPalette' },
              desc: '智能生成配色方案，支持多种配色风格和场景',
              url: '/tools/design/color',
              cate: '在线工具'
            },
            {
              id: 113,
              title: '字体搭配助手',
              logo: { type: 'svg', name: 'fontMatch' },
              desc: '智能推荐中英文字体搭配方案，提供字体预览',
              url: '/tools/design/font',
              cate: '在线工具'
            },
            {
              id: 1101,
              title: '免费图标下载',
              desc: '提供常用设计图标下载和预览，支持多种格式',
              url: '/tools/design/icon',
              logo: { type: 'svg', name: 'iconDesign' },
              cate: '在线工具'
            },
            {
              id: 1102,
              title: '图片转SVG矢量图',
              desc: '将JPG、PNG等格式图片转换为SVG矢量图，支持多种参数调整',
              url: '/tools/design/image-svg',
              logo: { type: 'svg', name: 'svg' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1103,
              title: 'CSS 玻璃拟态生成器',
              desc: '在线生成 Glassmorphism 风格 CSS 代码，支持自定义模糊度、透明度等参数',
              url: '/tools/design/glassmorphism',
              logo: { type: 'svg', name: 'glassmorphism' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1104,
              title: 'CSS 渐变生成器',
              desc: '在线生成精美的 CSS 线性渐变和径向渐变背景代码',
              url: '/tools/design/gradient',
              logo: { type: 'svg', name: 'gradient' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1105,
              title: '在线图片压缩',
              desc: '免费在线图片压缩工具，支持JPG/PNG/WEBP格式，可调节压缩质量和尺寸',
              url: '/tools/design/image-compressor',
              logo: { type: 'svg', name: 'compress' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1106,
              title: '色彩对比度检测',
              desc: '在线检测前景色和背景色的对比度，确保符合WCAG标准',
              url: '/tools/design/contrast-checker',
              logo: { type: 'svg', name: 'contrastChecker' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1107,
              title: 'CSS 阴影生成器',
              desc: '可视化调节 Box Shadow 属性，实时预览并生成CSS代码',
              url: '/tools/design/box-shadow',
              logo: { type: 'svg', name: 'boxShadow' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1108,
              title: '黄金比例计算器',
              desc: '快速计算设计的黄金分割比数值 (1:1.618)，让设计更具美感',
              url: '/tools/design/golden-ratio',
              logo: { type: 'svg', name: 'goldenRatio' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1109,
              title: 'Blob 形状生成器',
              desc: '生成独一无二的流体有机形状，支持导出 SVG 和 CSS',
              url: '/tools/design/blob-maker',
              logo: { type: 'svg', name: 'blobMaker' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1110,
              title: 'CSS Clip-path 生成器',
              desc: '在线可视化生成 CSS clip-path 代码，支持拖拽调整多边形顶点，提供多种常用形状预设。',
              url: '/tools/design/clip-path',
              logo: { type: 'svg', name: 'clipPath' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1111,
              title: 'CSS 圆角生成器',
              desc: '在线可视化生成 CSS border-radius 代码，支持 8 个值的复杂圆角设置。',
              url: '/tools/design/border-radius',
              logo: { type: 'svg', name: 'borderRadius' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1112,
              title: 'CSS 滤镜生成器',
              desc: '在线调节 CSS Filter 属性：模糊、亮度、对比度等，实时预览图片效果。',
              url: '/tools/design/css-filter',
              logo: { type: 'svg', name: 'cssFilter' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1113,
              title: 'CSS 三角形生成器',
              desc: '利用 CSS border 属性特性，快速生成各种方向和尺寸的三角形代码。',
              url: '/tools/design/css-triangle',
              logo: { type: 'svg', name: 'cssTriangle' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1114,
              title: 'CSS 丝带生成器',
              desc: '快速生成常见的角落丝带（Ribbon）样式，常用于标记“热门”、“新品”等状态。',
              url: '/tools/design/css-ribbon',
              logo: { type: 'svg', name: 'cssRibbon' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1115,
              title: 'CSS 加载动画',
              desc: '生成纯 CSS 实现的 Loading 旋转动画，可自定义大小、颜色和速度。',
              url: '/tools/design/css-loader',
              logo: { type: 'svg', name: 'cssLoader' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1116,
              title: 'CSS Flexbox 生成器',
              desc: '可视化调整 CSS Flexbox 布局属性，实时预览布局效果并生成代码。',
              url: '/tools/design/css-flexbox',
              logo: { type: 'svg', name: 'cssFlexbox' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1117,
              title: 'CSS 文本阴影生成器',
              desc: '在线可视化生成 CSS text-shadow 代码，支持偏移、模糊和颜色透明度调节。',
              url: '/tools/design/css-text-shadow',
              logo: { type: 'svg', name: 'cssTextShadow' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1118,
              title: 'CSS 渐变文字生成器',
              desc: '利用 background-clip: text 属性，快速生成炫酷的渐变色文字效果。',
              url: '/tools/design/css-gradient-text',
              logo: { type: 'svg', name: 'cssGradientText' },
              cate: '在线工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 12,
          title: '设计规范',
          list: [
            {
              id: 121,
              title: '屏幕尺寸大全',
              logo: { type: 'svg', name: 'uiSpec' },
              desc: '提供全面的手机屏幕尺寸参数查询',
              url: '/tools/design/ui-spec',
              cate: '设计规范'
            },
            {
              id: 124,
              title: '设计尺寸规范',
              logo: { type: 'svg', name: 'designSpec' },
              desc: '提供 iOS 和 Android 平台的设计规范参考，包括字体、图标、分辨率等详细参数',
              url: '/tools/design/spec',
              cate: '设计规范',
              tags: ['热门']
            },
            {
              id: 122,
              title: 'Logo设计规范',
              logo: { type: 'svg', name: 'logoSpec' },
              desc: '生成专业的Logo设计规范，包含使用场景和注意事项',
              url: '/tools/design/logo-spec',
              cate: '设计规范'
            },
            {
              id: 123,
              title: '品牌设计规范',
              logo: { type: 'svg', name: 'brandSpec' },
              desc: '生成完整的品牌设计规范，包含VI系统和应用场景',
              url: '/tools/design/brand-spec',
              cate: '设计规范'
            },
            {
              id: 125,
              title: '应用图标生成器',
              logo: { type: 'svg', name: 'designSpec' },
              desc: '一键生成 iOS、Android 和 Web App 所需的各种尺寸应用图标。支持自定义圆角、实时预览，并进行图标优化。',
              url: '/tools/design/icon-generator',
              cate: '设计规范',
              tags: ['热门']
            },
            {
              id: 2903,
              title: '移动端UI设计规范',
              logo: { type: 'svg', name: 'design_mobile' },
              desc: '提供iOS和Android平台的UI设计规范，包含界面设计尺寸、组件规范、设计原则等',
              url: '/tools/mobile-ui-spec',
              cateId: 2,
              cate: '设计规范',
              isNew: true
            },
            {
              id: 1119,
              title: 'Web端设计规范',
              desc: '提供Web端设计的尺寸、布局和组件规范参考，助你打造专业的桌面端应用。',
              url: '/tools/design/web-ui-spec',
              logo: { type: 'svg', name: 'webUISpec' },
              cate: '设计规范',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1120,
              title: '字体排版规范',
              desc: '基于模块化比例生成字体排版系统，建立清晰的视觉层级。',
              url: '/tools/design/typography-spec',
              logo: { type: 'svg', name: 'typographySpec' },
              cate: '设计规范',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1121,
              title: '色彩规范生成器',
              desc: '输入品牌主色，自动生成完整的色阶板，适用于UI设计系统。',
              url: '/tools/design/color-spec',
              logo: { type: 'svg', name: 'colorSpec' },
              cate: '设计规范',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 661,
              title: '常用文档规范',
              logo: { type: 'svg', name: 'docSpec' },
              desc: '公文写作与文档排版的标准规范参考，助你打造专业的办公文档',
              url: '/tools/doc/spec',
              cate: '设计规范',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 13,
          title: '接单工具',
          list: [
            {
              id: 111,
              title: '设计报价单生成器',
              logo: { type: 'svg', name: 'designQuote' },
              desc: '快速生成专业的设计报价单，支持多种模板和自定义选项',
              url: '/tools/design/DesignQuote',
              cate: '在线工具'
            },
            /* 暂未开发的工具
            {
              id: 131,
              title: '设计合同生成器-更新中',
              logo: { type: 'svg', name: 'designContract' },
              desc: '快速生成设计项目合同，包含条款和版权说明',
              url: '/tools/design/contract',
              cate: '接单工具'
            }
            */
          ]
        }
      ]
    },
    {
      id: 10,
      title: '剪辑工具',
      icon: '',
      list: [
        {
          id: 101,
          title: '视频处理',
          list: [
            {
              id: 1011,
              title: '视频抽帧',
              logo: { type: 'svg', name: 'videoFrame' },
              desc: '在线提取视频画面，支持按时间点精确截图和批量导出',
              url: '/tools/video/frame',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1012,
              title: '视频提取音频',
              logo: { type: 'svg', name: 'videoAudio' },
              desc: '在线从视频中提取音频，支持导出为 MP3/WAV 格式',
              url: '/tools/video/to-audio',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1013,
              title: '视频转GIF',
              logo: { type: 'svg', name: 'videoToGif' },
              desc: '在线将视频转换为GIF动图，支持截取片段、调整尺寸和帧率',
              url: '/tools/video/gif',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1015,
              title: '摄像头录制',
              logo: { type: 'svg', name: 'webcam' },
              desc: '在线录制摄像头视频，支持高清录制和音频采集，本地处理更安全',
              url: '/tools/video/webcam',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1016,
              title: '视频加水印',
              logo: { type: 'svg', name: 'videoWatermark' },
              desc: '在线为视频添加文字或图片水印，支持拖拽调节位置，本地处理保护隐私',
              url: '/tools/video/watermark',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1017,
              title: '视频倍速处理',
              logo: { type: 'svg', name: 'videoSpeed' },
              desc: '在线调整视频播放速度（0.5x - 4.0x），支持导出处理后的视频，本地处理更安全',
              url: '/tools/video/speed',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1018,
              title: '视频旋转/翻转',
              logo: { type: 'svg', name: 'videoRotate' },
              desc: '在线旋转视频角度（90°/180°/270°）或进行水平/垂直翻转，本地处理保护隐私',
              url: '/tools/video/rotate',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1014,
              title: '在线屏幕录制',
              logo: { type: 'svg', name: 'screenRecorder' },
              desc: '免费在线屏幕录制工具，支持录制系统声音，本地录制更安全',
              url: '/tools/screen-recorder',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1019,
              title: '视频画面裁剪',
              logo: { type: 'svg', name: 'imageCrop' },
              desc: '在线裁剪视频画面区域，支持自由调整比例，本地处理保护隐私',
              url: '/tools/video/crop',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1020,
              title: '视频静音',
              logo: { type: 'svg', name: 'videoAudio' },
              desc: '一键移除视频中的音频轨道，快速制作静音视频，本地处理更安全',
              url: '/tools/video/mute',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1021,
              title: '视频时长剪辑',
              logo: { type: 'svg', name: 'imageCrop' },
              desc: '在线截取视频片段，精准控制开始和结束时间，本地处理保护隐私',
              url: '/tools/video/trimmer',
              cate: '剪辑工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 102,
          title: '音频工具',
          list: [
            {
              id: 1112,
              title: '音频格式转换',
              logo: { type: 'svg', name: 'audioConverter' },
              desc: '在线音频格式转换工具，支持 WAV、WebM 等格式互转',
              url: '/tools/audio/converter',
              cate: '音频工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1113,
              title: '音频剪辑',
              logo: { type: 'svg', name: 'audioTrimmer' },
              desc: '在线音频剪辑工具，支持可视化的波形剪辑，精确裁剪音频片段',
              url: '/tools/audio/trimmer',
              cate: '音频工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1111,
              title: '在线录音',
              logo: { type: 'svg', name: 'voiceRecorder' },
              desc: '在线录音工具，支持波形可视化、暂停/继续录制，并可导出为 WebM 格式',
              url: '/tools/audio/recorder',
              cate: '音频工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1114,
              title: '音频音量放大',
              logo: { type: 'svg', name: 'videoAudio' },
              desc: '在线调整音频音量，支持最大 300% 增益，本地处理保护隐私',
              url: '/tools/audio/volume-booster',
              cate: '音频工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 1115,
              title: '音频合并',
              logo: { type: 'svg', name: 'audioTrimmer' }, // Reuse icon
              desc: '免费在线合并多个音频文件，支持 WAV 等格式拼接，本地处理更安全',
              url: '/tools/audio/merge',
              cate: '音频工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        }
      ]
    },
    {
      id: 6,
      title: '办公工具',
      icon: '',
      list: [
        {
          id: 61,
          title: 'PDF工具',
          list: [
            {
              id: 611,
              title: '图片转PDF',
              logo: { type: 'svg', name: 'imageToPdf' },
              desc: '在线图片转PDF工具，支持多张图片合并成PDF',
              url: '/tools/img-to-pdf',
              cate: 'PDF工具'
            },
            {
              id: 612,
              title: 'PDF转图片',
              logo: { type: 'svg', name: 'pdfToImages' },
              desc: '在线PDF转图片工具，支持批量转换PDF页面为高质量图片，可自定义输出设置',
              url: '/tools/pdf-to-images',
              cate: 'PDF工具'
            },
            {
              id: 613,
              title: 'PDF合并',
              logo: { type: 'svg', name: 'pdfMerge' },
              desc: '免费在线PDF合并工具，支持多个PDF文件合并，无需上传至云端，本地处理更安全。',
              url: '/tools/pdf-merge',
              cate: 'PDF工具'
            },
            {
              id: 614,
              title: 'PDF分割',
              logo: { type: 'svg', name: 'pdfSplit' },
              desc: '免费在线PDF分割工具，支持将PDF拆分为单页，批量处理多个文件，本地处理更安全。',
              url: '/tools/pdf-split',
              cate: 'PDF工具'
            },
            {
              id: 615,
              title: 'PDF页面旋转',
              logo: { type: 'svg', name: 'pdfRotate' },
              desc: '在线PDF页面旋转工具，支持批量旋转、单独旋转页面，同时可调整页面顺序',
              url: '/tools/pdf-rotate',
              cate: 'PDF工具'
            },
            {
              id: 616,
              title: 'PDF页面删除',
              logo: { type: 'svg', name: 'pdfDelete' },
              desc: '在线PDF页面删除工具，支持删除指定页面，同时可调整页面顺序和旋转页面',
              url: '/tools/pdf-delete',
              cate: 'PDF工具'
            },
            {
              id: 617,
              title: 'PDF压缩',
              logo: { type: 'svg', name: 'pdfCompress' },
              desc: '在线压缩PDF文件大小，支持批量处理，本地压缩更安全，适合邮件发送和文件上传',
              url: '/tools/pdf-compress',
              cate: 'PDF工具'
            },
            {
              id: 618,
              title: 'PDF添加水印',
              logo: { type: 'svg', name: 'pdfWatermark' },
              desc: '免费在线PDF添加水印工具，支持自定义文字、大小、颜色、透明度和旋转角度，本地处理更安全。',
              url: '/tools/pdf-watermark',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 619,
              title: 'PDF加密',
              logo: { type: 'svg', name: 'pdfEncrypt' },
              desc: '免费在线PDF加密工具，支持设置打开密码和权限密码，本地处理更安全。',
              url: '/tools/pdf-encrypt',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 620,
              title: 'PDF添加页码',
              logo: { type: 'svg', name: 'pdfPageNumber' },
              desc: '免费在线PDF添加页码工具，支持自定义位置、格式和字体样式，本地处理更安全。',
              url: '/tools/pdf-page-number',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 625,
              title: 'PDF签名',
              logo: { type: 'svg', name: 'pdfSign' },
              desc: '免费在线PDF签名工具，支持手写签名并添加到PDF文件中，本地处理更安全。',
              url: '/tools/pdf-sign',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 626,
              title: 'PDF文本提取',
              logo: { type: 'svg', name: 'pdfExtractText' },
              desc: '免费在线提取PDF文件中的文本内容，支持复制和导出TXT，本地处理更安全。',
              url: '/tools/pdf-extract-text',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 627,
              title: '文本转PDF',
              logo: { type: 'svg', name: 'textToPdf' },
              desc: '在线将文本内容转换为PDF文档，支持自定义排版',
              url: '/tools/text-to-pdf',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 628,
              title: 'Markdown转PDF',
              logo: { type: 'svg', name: 'markdownToPdf' },
              desc: '在线将Markdown文档转换为PDF，支持代码高亮和实时预览',
              url: '/tools/markdown-to-pdf',
              cate: 'PDF工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 62,
          title: '表格工具',
          list: [
            {
              id: 621,
              title: 'Excel转JSON',
              logo: { type: 'svg', name: 'excelToJson' },
              desc: '在线将Excel文件转换为JSON格式，支持.xlsx, .xls格式，本地处理更安全。',
              url: '/tools/excel-to-json',
              cate: '表格工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 622,
              title: 'JSON转Excel',
              logo: { type: 'svg', name: 'jsonToExcel' },
              desc: '在线将JSON数据转换为Excel文件，支持数组格式JSON，本地处理更安全。',
              url: '/tools/json-to-excel',
              cate: '表格工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 623,
              title: 'CSV转Excel',
              logo: { type: 'svg', name: 'csvToExcel' },
              desc: '在线将CSV文件转换为Excel (.xlsx)格式，自动处理编码问题，本地处理更安全。',
              url: '/tools/csv-to-excel',
              cate: '表格工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 624,
              title: 'Excel转CSV',
              logo: { type: 'svg', name: 'excelToCsv' },
              desc: '在线将Excel文件转换为CSV格式，支持.xlsx, .xls格式，本地处理更安全。',
              url: '/tools/excel-to-csv',
              cate: '表格工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 63,
          title: '文档工具',
          list: [
            {
              id: 631,
              title: '字数统计',
              logo: { type: 'svg', name: 'wordCount' },
              desc: '在线字数统计工具，支持字符数、单词数、行数、段落数统计，实时计算阅读时间',
              url: '/tools/word-count',
              cate: '文档工具',
              tags: ['免费', '热门']
            },
            {
              id: 632,
              title: 'Markdown 表格生成器',
              logo: { type: 'svg', name: 'markdown' }, // Reusing markdown icon
              desc: '可视化编辑表格，自动生成 Markdown 格式代码，支持对齐方式设置',
              url: '/tools/doc/markdown-table',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 633,
              title: '文本清洗工具',
              logo: { type: 'svg', name: 'textEdit' }, // Using textEdit icon as placeholder or cleaner icon if available
              desc: '一键去除空行、重复行、HTML标签，支持大小写转换和文本替换',
              url: '/tools/doc/text-cleaner',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 634,
              title: '数字转中文大写',
              logo: { type: 'svg', name: 'numberToChinese' },
              desc: '在线将数字转换为中文大写金额，适用于财务报销、合同填写等场景',
              url: '/tools/doc/number-chinese',
              cate: '文档工具',
              tags: ['免费', '实用']
            },
            {
              id: 635,
              title: 'JSON 格式化工具',
              logo: { type: 'svg', name: 'jsonFormat' },
              desc: '在线 JSON 代码格式化、验证、压缩工具，支持错误检查和一键复制',
              url: '/tools/dev/json-format',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 636,
              title: '文本对比工具',
              logo: { type: 'svg', name: 'diffChecker' },
              desc: '在线比较两段文本或代码的差异，高亮显示新增和删除的内容',
              url: '/tools/dev/diff-checker',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 637,
              title: '二维码生成器',
              logo: { type: 'svg', name: 'qrcodeGenerator' },
              desc: '在线生成自定义二维码，支持设置颜色、尺寸、容错率，可下载 PNG 图片',
              url: '/tools/media/qrcode-generator',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 638,
              title: 'URL 编码/解码',
              logo: { type: 'svg', name: 'urlEncoder' },
              desc: '在线 URL 编码/解码工具，支持 UTF-8 编码，一键转换和复制',
              url: '/tools/dev/url-encoder',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 639,
              title: '时间戳转换',
              logo: { type: 'svg', name: 'timestampConverter' },
              desc: '在线 Unix 时间戳与北京时间相互转换工具，支持秒和毫秒单位',
              url: '/tools/dev/timestamp-converter',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 640,
              title: 'MD5 加密工具',
              logo: { type: 'svg', name: 'md5' },
              desc: '在线 MD5 加密工具，支持 32 位和 16 位加密，大小写可选，一键复制',
              url: '/tools/dev/md5-encrypt',
              cate: '文档工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 64,
          title: '辅助工具',
          list: [
            {
              id: 641,
              title: '日期计算器',
              logo: { type: 'svg', name: 'dateCalculator' },
              desc: '在线日期计算器，支持日期间隔计算和日期推算',
              url: '/tools/date-calculator',
              cate: '辅助工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 643,
              title: '亲戚称呼计算器',
              logo: { type: 'svg', name: 'relationship' },
              desc: '中国亲戚关系称呼查询，支持互查，逢年过节必备神器',
              url: '/tools/relationship',
              cate: '辅助工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 644,
              title: 'User Agent 解析',
              logo: { type: 'svg', name: 'userAgent' },
              desc: '查看您的浏览器 User Agent 字符串，解析操作系统、浏览器版本和设备类型',
              url: '/tools/dev/user-agent',
              cate: '辅助工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 645,
              title: '键盘键值码',
              logo: { type: 'svg', name: 'keyCode' },
              desc: '在线查看键盘按键的 KeyCode、Code 等详细信息，开发调试必备',
              url: '/tools/dev/keycode',
              cate: '辅助工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 646,
              title: 'URL 解析器',
              logo: { type: 'svg', name: 'urlParser' },
              desc: '将 URL 解析为协议、主机、路径、查询参数等组成部分',
              url: '/tools/dev/url-parser',
              cate: '辅助工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 647,
              title: 'Cron 表达式',
              logo: { type: 'svg', name: 'cron' },
              desc: '可视化生成 Cron 表达式，支持 Quartz 和 Linux Crontab 格式',
              url: '/tools/dev/cron',
              cate: '辅助工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 65,
          title: '效率工具',
          list: [
            {
              id: 651,
              title: '待办清单',
              logo: { type: 'svg', name: 'todoList' },
              desc: '极简风格的待办事项清单，支持任务管理、优先级设置，帮助您高效管理日常任务',
              url: '/tools/todo-list',
              cate: '效率工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 652,
              title: '番茄钟',
              logo: { type: 'svg', name: 'pomodoro' },
              desc: '基于番茄工作法的专注时钟，支持自定义工作/休息时长，助您保持专注高效',
              url: '/tools/pomodoro',
              cate: '效率工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        }
      ]
    },
    {
      id: 8,
      title: '生活常用',
      icon: '',
      list: [
        {
          id: 81,
          title: '实用查询',
          list: [
            {
              id: 811,
              title: '天气查询',
              logo: { type: 'svg', name: 'weather' },
              desc: '免费天气预报查询，支持全球城市，提供实时温度、湿度、风速等详细气象信息',
              url: '/tools/daily/weather',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 812,
              title: 'BMI计算器',
              logo: { type: 'svg', name: 'bmi' },
              desc: '在线计算身体质量指数(BMI)，评估身体健康状况',
              url: '/tools/daily/bmi',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 813,
              title: '在线秒表',
              logo: { type: 'svg', name: 'stopwatch' },
              desc: '简单好用的在线秒表工具，支持计次功能',
              url: '/tools/daily/stopwatch',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 814,
              title: '年龄计算器',
              logo: { type: 'svg', name: 'ageCalculator' },
              desc: '在线计算精确年龄，包含周岁、虚岁、生肖及星座',
              url: '/tools/daily/age-calculator',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 815,
              title: '人生进度条',
              logo: { type: 'svg', name: 'lifeProgress' },
              desc: '可视化展示人生进度，计算已度过的时间和剩余时间',
              url: '/tools/daily/life-progress',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 816,
              title: '帮我决定',
              logo: { type: 'svg', name: 'decisionMaker' },
              desc: '选择困难症福音！输入选项，让运气帮你做决定',
              url: '/tools/daily/decision-maker',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 817,
              title: '百分比计算器',
              logo: { type: 'svg', name: 'percentage' },
              desc: '在线百分比计算工具，支持计算占比、数值计算、增长率等多种模式',
              url: '/tools/percentage',
              cate: '实用查询',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        }
      ]
    },
    {
      id: 5,
      title: '图片处理',
      icon: '',
      list: [
        {
          id: 51,
          title: '图片工具',
          list: [
            {
              id: 511,
              title: '二维码生成器',
              logo: { type: 'svg', name: 'qrcode' },
              desc: '在线生成二维码',
              url: '/tools/qrcode',
              cate: '图片工具'
            },
            {
              id: 512,
              title: '在线图片处理',
              logo: { type: 'svg', name: 'imageProcess' },
              desc: '在线图片裁剪，图片标注，图片滤镜，图片画笔、图片旋转、图片文字等操作',
              url: '/tools/signimage',
              cate: '图片工具'
            },
            {
              id: 513,
              title: '文本转图片',
              logo: { type: 'svg', name: 'textToImage' },
              desc: '把文本转换成图片，生成长图，具有超多个性文字排版',
              url: '/tools/texttoimg',
              cate: '图片工具'
            },
            {
              id: 514,
              title: '图片压缩',
              logo: { type: 'svg', name: 'imageCompress' },
              desc: '支持JPG、PNG、GIF等格式图片压缩，最大支持10MB',
              url: '/tools/image-compress',
              cate: '图片工具'
            },
            {
              id: 515,
              title: '图片裁剪',
              logo: { type: 'svg', name: 'imageCrop' },
              desc: '支持自定义尺寸裁剪图片，支持等比例缩放',
              url: '/tools/image-crop',
              cate: '图片工具'
            },
            {
              id: 5151,
              title: '图片格式转换',
              logo: { type: 'svg', name: 'imageToWebp' },
              desc: '支持JPG、PNG、WebP等多种格式互相转换，批量处理高效便捷',
              url: '/tools/image-to-webp',
              cate: '图片工具',
              releaseDate: '2024/5/15 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            },
            {
              id: 516,
              title: 'GIF动图压缩',
              logo: { type: 'svg', name: 'gifCompress' },
              desc: '在线GIF动图压缩工具，支持批量压缩、调整尺寸，快速实现GIF体积压缩',
              url: '/tools/gif-compress',
              cate: '图片工具'
            },
            {
              id: 517,
              title: 'Favicon制作',
              logo: { type: 'svg', name: 'favicon' },
              desc: '在线制作网站图标，支持多种尺寸和格式，可以裁剪、编辑图片并生成favicon',
              url: '/tools/favicon-maker',
              cate: '图片工具'
            },
            {
              id: 518,
              title: '免费九宫格切图',
              logo: { type: 'svg', name: 'imgCut' },
              desc: '专业的在线图片切割工具，支持自定义行列数的九宫格切图',
              url: '/tools/img-cut',
              cate: '图片工具'
            },
            {
              id: 520,
              title: '免费在线图片拼接',
              logo: { type: 'svg', name: 'imageJoin' },
              desc: '支持多张图片横向或纵向拼接，自定义间距和背景色，制作长图神器',
              url: '/tools/image-joiner',
              cate: '图片工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 521,
              title: '免费图片合成GIF',
              logo: { type: 'svg', name: 'imageToGif' },
              desc: '在线将多张图片合成为动态GIF，支持自定义延迟、尺寸和循环播放',
              url: '/tools/image-to-gif',
              cate: '图片工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 519,
              title: '批量添加图片水印',
              logo: { type: 'svg', name: 'imgWatermark' },
              desc: '批量给图片添加文字或图片水印',
              url: '/tools/img-watermark',
              cate: '图片工具'
            },
            {
              id: 522,
              title: '图片主色调提取',
              logo: { type: 'svg', name: 'imageColor' },
              desc: '上传图片自动提取主色调，生成配色方案，支持复制HEX和RGB颜色值',
              url: '/tools/image-color',
              cate: '图片工具',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 523,
              title: '图片转 Base64',
              logo: { type: 'svg', name: 'imageToBase64' },
              desc: '在线将图片转换为 Base64 编码，支持一键复制 HTML 标签和 CSS 代码',
              url: '/tools/image-to-base64',
              cate: '图片工具',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 52,
          title: '头像工具',
          list: [
            {
              id: 521,
              title: '随机头像',
              logo: { type: 'svg', name: 'randomAvatar' },
              desc: '每次都能获取一个独特的随机头像',
              url: '/tools/avatar/random',
              cate: '头像工具'
            },
            {
              id: 522,
              title: '动漫头像转换',
              logo: { type: 'svg', name: 'animeAvatar' },
              desc: 'AI将您的照片转换为动漫风格头像',
              url: '/tools/avatar/anime',
              cate: '头像工具'
            },
            {
              id: 523,
              title: '摸头GIF生成器',
              logo: { type: 'svg', name: 'ruaAvatar' },
              desc: '生成可爱的摸头GIF图片',
              url: '/tools/avatar/rua',
              cate: '头像工具'
            },
            {
              id: 524,
              title: '国庆专属头像',
              logo: { type: 'svg', name: 'nationalDayAvatar' },
              desc: '为您的头像添加国庆元素，支持多种国庆帽子和装饰，生成专属国庆头像',
              url: '/tools/avatar/national-day',
              cate: '头像工具',
              releaseDate: '2024/9/22 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 53,
          title: '证件照工具',
          list: [
            {
              id: 531,
              title: '免费证件照换底色',
              logo: { type: 'svg', name: 'idPhotoBackground' },
              desc: '一键智能更换证件照背景颜色，支持白底、红底、蓝底等多种规格',
              url: '/tools/photo/background',
              cate: '证件照工具'
            },
            {
              id: 532,
              title: '证件照免冠处理',
              logo: { type: 'svg', name: 'idPhotoMaker' },
              desc: '智能去除证件照背景，生成标准PNG透明证件照，支持多种证件类型',
              url: '/tools/photo/transparent',
              cate: '证件照工具'
            },
            {
              id: 533,
              title: '证件照尺寸裁剪',
              logo: { type: 'svg', name: 'idPhotoCrop' },
              desc: '一键裁剪生成各种规格的证件照，支持护照、签证、身份证等多种标准',
              url: '/tools/photo/crop',
              cate: '证件照工具'
            },
            {
              id: 534,
              title: '证件照排版打印',
              logo: { type: 'svg', name: 'idPhotoLayout' },
              desc: '在线证件照排版工具，支持多种尺寸组合，一键打印更省钱',
              url: '/tools/photo/layout',
              cate: '证件照工具'
            }
          ]
        },
        {
          id: 54,
          title: '数据图表',
          list: [
            {
              id: 541,
              title: '柱状图',
              logo: { type: 'svg', name: 'bar' },
              desc: '在线制作柱状图，像做表格一样制作可视化图表，支持导出静态或动态图表',
              url: '/tools/bar',
              cateId: 8,
              cate: '数据图表'
            },
            {
              id: 542,
              title: '折线图',
              logo: { type: 'svg', name: 'line' },
              desc: '在线制作折线图，像做表格一样制作可视化图表，支持导出静态或动态图表',
              url: '/tools/line',
              cateId: 8,
              cate: '数据图表'
            },
            {
              id: 543,
              title: '饼图',
              logo: { type: 'svg', name: 'pie' },
              desc: '在线制作饼图，像做表格一样制作可视化图表，支持导出静态或动态图表',
              url: '/tools/pie',
              cateId: 8,
              cate: '数据图表'
            },
            {
              id: 544,
              title: '散点图',
              logo: { type: 'svg', name: 'scatter' },
              desc: '在线制作散点图，像做表格一样制作可视化图表，支持导出静态或动态图表',
              url: '/tools/scatter',
              cateId: 8,
              cate: '数据图表'
            },
            {
              id: 545,
              title: '雷达图',
              logo: { type: 'svg', name: 'radar' },
              desc: '在线制作雷达图，适用于多维数据对比分析，支持导出静态或动态图表',
              url: '/tools/radar',
              cateId: 8,
              cate: '数据图表',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 546,
              title: '漏斗图',
              logo: { type: 'svg', name: 'funnel' },
              desc: '在线制作漏斗图，适用于转化率分析，支持导出静态或动态图表',
              url: '/tools/funnel',
              cateId: 8,
              cate: '数据图表',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 547,
              title: '仪表盘',
              logo: { type: 'svg', name: 'gauge' },
              desc: '在线制作仪表盘，适用于进度展示、完成率分析，支持导出静态或动态图表',
              url: '/tools/gauge',
              cateId: 8,
              cate: '数据图表',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        }
      ]
    },
    {
      id: 11,
      title: '文案工具',
      icon: '',
      list: [
        {
          id: 111,
          title: '每日一言',
          list: [
            {
              id: 1111,
              title: '随机一言',
              logo: { type: 'svg', name: 'emotionalQuote' },
              desc: '每次都能获取最新的随机一言',
              url: '/tools/copywriting/emotional-quotes',
              cate: '每日一言'
            },
            {
              id: 1112,
              title: '设计一言',
              logo: { type: 'svg', name: 'designQuote' },
              desc: '每日一句设计语录',
              url: '/tools/copywriting/design-quotes',
              cate: '每日一言'
            },
            {
              id: 1113,
              title: '今日诗词',
              logo: { type: 'svg', name: 'dailyPoem' },
              desc: '每天为你送上一首精选古诗词，感受传统文化的魅力',
              url: '/tools/copywriting/daily-poem',
              cate: '每日一言'
            },
            {
              id: 1114,
              title: '朋友圈一言',
              logo: { type: 'svg', name: 'momentsQuote' },
              desc: '每次都能获取一条走心的朋友圈文案，让你的朋友圈更有趣',
              url: '/tools/copywriting/moments',
              cate: '每日一言'
            },
            {
              id: 1115,
              title: '励志一言',
              logo: { type: 'svg', name: 'inspiringQuote' },
              desc: '每次都能获取一句激励人心的话语，让你充满正能量',
              url: '/tools/copywriting/inspiring',
              cate: '每日一言'
            },
            {
              id: 1116,
              title: '爱情公寓一言',
              logo: { type: 'svg', name: 'loveApartment' },
              desc: '每次都能获取一条爱情公寓经典台词，重温青春记忆',
              url: '/tools/copywriting/love-apartment',
              cate: '每日一言'
            }
          ]
        },
        {
          id: 112,
          title: '随机文案',
          list: [
            {
              id: 1121,
              title: '疯狂星期四',
              logo: { type: 'svg', name: 'kfc' },
              desc: '随机生成疯狂星期四文案',
              url: '/tools/copywriting/kfc',
              cate: '随机文案'
            },
            {
              id: 1122,
              title: '随机搞笑文案',
              logo: { type: 'svg', name: 'funny' },
              desc: '随机生成搞笑段子和趣味文案',
              url: '/tools/copywriting/funny',
              cate: '随机文案'
            },
            {
              id: 1123,
              title: '舔狗日记',
              logo: { type: 'svg', name: 'dogDiary' },
              desc: '每次都能获取一篇有趣的舔狗日记，让你的生活充满欢乐',
              url: '/tools/copywriting/dog-diary',
              cate: '随机文案'
            },
            {
              id: 1124,
              title: '网易云热评',
              logo: { type: 'svg', name: 'cloudMusic' },
              desc: '每次都能获取一条走心的网易云音乐热评，感受音乐中的共鸣',
              url: '/tools/copywriting/cloud-music',
              cate: '随机文案'
            },
            {
              id: 1125,
              title: '暖心安慰',
              logo: { type: 'svg', name: 'comfort' },
              desc: '每次都能获取一句暖心的安慰话语，给你温暖的力量',
              url: '/tools/copywriting/comfort',
              cate: '随机文案'
            },
            {
              id: 1126,
              title: '毒鸡汤',
              logo: { type: 'svg', name: 'poisonSoup' },
              desc: '每次都能获取一句扎心的毒鸡汤，让你笑中带泪',
              url: '/tools/copywriting/poison-soup',
              cate: '随机文案'
            },
            {
              id: 1127,
              title: '新年朋友圈文案',
              logo: { type: 'svg', name: 'newyear' },
              desc: '使用 DeepSeek AI 生成走心的新年朋友圈文案，让你的新年祝福与众不同',
              url: '/tools/copywriting/newyear',
              cate: '随机文案'
            }
          ]
        },
        {
          id: 113,
          title: '文本处理',
          list: [
            {
              id: 1131,
              title: '文本对比',
              logo: { type: 'svg', name: 'diff' },
              desc: '文本差异比对支持中文、英文、代码比对',
              url: '/tools/diff',
              cateId: 11,
              cate: '文本处理'
            },
            {
              id: 1132,
              title: 'markdown编辑器',
              logo: { type: 'svg', name: 'markdown' },
              desc: '在线创建或编辑markdown, 实时预览，导出markdown',
              url: '/tools/markdown',
              cateId: 11,
              cate: '文本处理'
            },
            {
              id: 1133,
              title: '字数统计',
              logo: { type: 'svg', name: 'wordCount' },
              desc: '在线统计字符串的字数、段落、标点符号数量',
              url: '/tools/wordcount',
              cateId: 11,
              cate: '文本处理'
            },
            {
              id: 1134,
              title: '文本去重',
              logo: { type: 'svg', name: 'textRemoveDuplicate' },
              desc: '文本重复内容去除工具',
              url: '/tools/textremoveduplicate',
              cateId: 11,
              cate: '文本处理'
            },
            {
              id: 1135,
              title: 'ASCII字符生成器',
              logo: { type: 'svg', name: 'asciiWordPic' },
              desc: '在线生成艺术ASCII',
              url: '/tools/asciiwordpic',
              cateId: 11,
              cate: '文本处理'
            },
            {
              id: 1136,
              title: '在线文本编辑/HTML获取',
              logo: { type: 'svg', name: 'richTextEditor' },
              desc: '在线富文本编辑, html实时预览，在线编辑本，文本编辑获取html',
              url: '/tools/textedit',
              cateId: 11,
              cate: '文本处理'
            },
            {
              id: 1137,
              title: '乱数假文生成',
              logo: { type: 'svg', name: 'loremIpsum' },
              desc: '在线生成 Lorem Ipsum 或中文随机文本，用于排版测试',
              url: '/tools/text/lorem-ipsum',
              cateId: 11,
              cate: '文本处理',
              isNew: true
            }
          ]
        }
      ]
    },
    {
      id: 12,
      title: '潜能测试',
      icon: '',
      list: [
        {
          id: 121,
          title: '性格测试',
          list: [
            {
              id: 1211,
              title: 'MBTI职业性格测试',
              logo: { type: 'svg', name: 'mbti' },
              desc: '简洁版MBTI测试，快速分析你的性格类型和职业倾向',
              url: '/tools/psychology/mbti',
              cate: '性格测试',
              tags: ['热门', '免费'],
              isNew: true
            },
            {
              id: 1212,
              title: '九型人格测试',
              logo: { type: 'svg', name: 'enneagram' },
              desc: '探索你的核心性格型号，了解深层动机和恐惧',
              url: '/tools/psychology/enneagram',
              cate: '性格测试',
              tags: ['免费'],
              isNew: true
            },
            {
              id: 1213,
              title: '大五人格测试',
              logo: { type: 'svg', name: 'bigfive' },
              desc: '从五个维度全面分析你的性格特征，科学权威',
              url: '/tools/psychology/big-five',
              cate: '性格测试',
              tags: ['专业', '免费'],
              isNew: true
            },
            {
              id: 1214,
              title: 'ABO心理性别测试',
              logo: { type: 'svg', name: 'abo' },
              desc: '趣味测试：你是霸气的Alpha，温和的Beta，还是惹人怜爱的Omega？',
              url: '/tools/psychology/abo',
              cate: '趣味测试',
              tags: ['趣味', '免费'],
              isNew: true
            },
            {
              id: 1215,
              title: '国际标准情商(EQ)测试',
              logo: { type: 'svg', name: 'eqTest' },
              desc: '评估你的情绪感知、控制和社交能力，了解你的情商水平',
              url: '/tools/psychology/eq-test',
              cate: '性格测试',
              tags: ['专业', '免费'],
              isNew: true
            },
            {
              id: 1216,
              title: '色彩性格测试',
              logo: { type: 'svg', name: 'colorTest' },
              desc: '探索你是红、蓝、白、黄哪种性格，了解你的核心动力和优势',
              url: '/tools/psychology/color-test',
              cate: '性格测试',
              tags: ['免费'],
              isNew: true
            }
          ]
        },
        {
          id: 122,
          title: '职业潜能',
          list: [
            {
              id: 1221,
              title: '程序员vs设计师测试',
              logo: { type: 'svg', name: 'programmerTest' },
              desc: '测试你的思维更偏向逻辑严密的程序员，还是感性创意的设计师',
              url: '/tools/psychology/programmer-test',
              cate: '职业潜能',
              tags: ['职业', '免费'],
              isNew: true
            },
            {
              id: 1222,
              title: '左右脑优势测试',
              logo: { type: 'svg', name: 'brainTest' },
              desc: '了解你是理性逻辑的左脑型，还是感性创意的右脑型',
              url: '/tools/psychology/left-right-brain',
              cate: '职业潜能',
              tags: ['思维', '免费'],
              isNew: true
            }
          ]
        }
      ]
    },
    {
      id: 2,
      title: '开发工具',
      icon: '',
      list: [
        {
          id: 21,
          title: '开发运维',
          list: [
            {
              id: 211,
              title: '随机密码生成',
              logo: { type: 'svg', name: 'keywords' },
              desc: '密码生成器、随机字符串生成,批量生成',
              url: '/tools/randompassword',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 212,
              title: 'URL编码/解码',
              logo: { type: 'svg', name: 'url' },
              desc: 'URL在线编码解码工具（UrlEncode编码 和 UrlDecode解码）',
              url: '/tools/urlencode',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 213,
              title: 'UUID生成器',
              logo: { type: 'svg', name: 'uuid' },
              desc: '批量生成UUID',
              url: '/tools/uuid',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 214,
              title: '时间戳转换',
              logo: { type: 'svg', name: 'time' },
              desc: '在线时间戳转换工具以及获取当前时间戳',
              url: '/tools/timetran',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 215,
              title: 'MD5在线加密',
              logo: { type: 'svg', name: 'md5' },
              desc: 'MD5在线加密,长度包含32位、16位',
              url: '/tools/md5',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 2114,
              title: 'Base64转换工具',
              logo: { type: 'svg', name: 'base64' },
              desc: '支持文本/图片与Base64编码之间的相互转换',
              url: '/tools/base64',
              cateId: 2,
              cate: '开发运维',
              isNew: true
            },
            {
              id: 216,
              title: 'Json在线转换',
              logo: { type: 'svg', name: 'json' },
              desc: '提供实时编辑和预览JSON 数据，语法高亮、校验、格式化、转义，去转义、压缩等功能',
              url: '/tools/json',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 217,
              title: '正则测试工具',
              logo: { type: 'svg', name: 'reg' },
              desc: '正则表达式测试工具, 常用正则表达式',
              url: '/tools/reg',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 218,
              title: 'Unicode转中文',
              logo: { type: 'svg', name: 'union' },
              desc: 'Unicode和中文的相互转换',
              url: '/tools/unicode',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 219,
              title: 'HTTP状态码',
              logo: { type: 'svg', name: 'httpCode' },
              desc: 'http状态对应的名称和含义解释',
              url: '/tools/httpstatuscode',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 2110,
              title: 'JWT解析',
              logo: { type: 'svg', name: 'jwtParse' },
              desc: '解析和解码JSON Web Token（jwt）',
              url: '/tools/jwt',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 2111,
              title: 'HTML实体转义',
              logo: { type: 'svg', name: 'htmlEntity' },
              desc: 'html实体转义，实体转义成html',
              url: '/tools/htmlentity',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 2112,
              title: 'HTML代码格式化',
              logo: { type: 'svg', name: 'htmlFormat' },
              desc: '提供在线html、xml格式化',
              url: '/tools/htmlformat',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 2113,
              title: 'CSS代码格式化',
              logo: { type: 'svg', name: 'cssFormat' },
              desc: 'CSS代码格式化和压缩工具',
              url: '/tools/cssformat',
              cateId: 2,
              cate: '开发运维'
            },
            {
              id: 2114,
              title: 'Cron表达式生成器',
              logo: { type: 'svg', name: 'cron' },
              desc: '可视化生成和解析 Cron 表达式',
              url: '/tools/dev/cron',
              cateId: 2,
              cate: '开发运维',
              isNew: true
            },
            {
              id: 2115,
              title: '变量命名转换',
              logo: { type: 'svg', name: 'caseConverter' },
              desc: '支持 Camel, Pascal, Snake, Kebab 等多种命名风格互转',
              url: '/tools/dev/case-converter',
              cateId: 2,
              cate: '开发运维',
              isNew: true
            },
            {
              id: 2116,
              title: '键盘按键测试',
              logo: { type: 'svg', name: 'keyboard' },
              desc: '在线键盘按键测试，查看 KeyCode 和按键信息',
              url: '/tools/dev/keyboard-test',
              cateId: 2,
              cate: '开发运维',
              isNew: true
            },
            {
              id: 2118,
              title: 'SQL格式化',
              logo: { type: 'svg', name: 'sqlFormat' },
              desc: '在线SQL代码格式化和美化工具，支持多种SQL方言',
              url: '/tools/dev/sql-format',
              cateId: 2,
              cate: '开发运维',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 2119,
              title: 'CSS 渐变生成器',
              logo: { type: 'svg', name: 'gradient' },
              desc: '在线生成精美的 CSS 线性渐变和径向渐变背景代码，支持多种颜色和方向设置',
              url: '/tools/design/gradient',
              cateId: 2,
              cate: '开发运维',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 2120,
              title: 'Meta 标签生成器',
              logo: { type: 'svg', name: 'metaTags' },
              desc: '生成网页 SEO 及社交媒体分享所需的 Meta 标签，并实时预览分享效果',
              url: '/tools/web/meta-tags',
              cateId: 2,
              cate: '开发运维',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 2121,
              title: '网站信息获取',
              logo: { type: 'svg', name: 'webInfo' },
              desc: '一键获取网站Favicon、Logo、标题、关键词和描述信息',
              url: '/tools/web/info',
              cateId: 2,
              cate: '开发运维',
              isNew: true,
              tags: ['免费', '新品']
            },
            /* 暂时隐藏后端API测试工具
            {
              id: 224,
              title: '后端API测试',
              logo: { type: 'svg', name: 'backendTest' },
              desc: '测试后端API接口的工具，支持GET、POST、PUT、DELETE等请求',
              url: '/backend-test',
              cateId: 2,
              cate: '开发运维',
              isNew: true
            }
            */
          ]
        }
      ]
    },
    {
      id: 7,
      title: '摸鱼工具',
      icon: '',
      list: [
        {
          id: 71,
          title: '随机壁纸',
          list: [
            {
              id: 711,
              title: '随机动漫壁纸',
              logo: { type: 'svg', name: 'animeWallpaper' },
              desc: '获取高质量随机动漫壁纸，支持多种分辨率',
              url: '/tools/wallpaper/anime',
              cate: '随机壁纸'
            }
          ]
        },
        {
          id: 72,
          title: '随机表情',
          list: [
            {
              id: 721,
              title: '随机柴郡表情包',
              logo: { type: 'svg', name: 'cheshireCat' },
              desc: '随机获取可爱的柴郡猫表情包，适合日常聊天使用',
              url: '/tools/emoji/cheshire',
              cate: '随机表情'
            },
            {
              id: 722,
              title: '随机表情包',
              logo: { type: 'svg', name: 'randomEmoji' },
              desc: '随机获取热门表情包，包含多种风格和类型',
              url: '/tools/emoji/random',
              cate: '随机表情'
            },
            {
            id: 723,
              title: '表情包制作',
              logo: { type: 'svg', name: 'emojiMaker' },
              desc: '在线表情包制作工具，支持添加文字、调整样式，一键导出',
              url: '/tools/emoji-maker',
              cate: '随机表情',
              releaseDate: '2024/3/25 00:00:00',
              tags: ['免费', '新品'],
              isNew: true
            }
          ]
        },
        {
          id: 73,
          title: '其他摸鱼',
          list: [
            {
              id: 730,
              title: '每日热榜',
              logo: { type: 'svg', name: 'hotRanking' },
              desc: '汇聚全网热点，实时更新各大平台热榜内容',
              url: '/tools/hot-ranking',
              cate: '其他摸鱼',
              isNew: true,
              tags: ['免费', '热门']
            },
            {
              id: 731,
              title: '星座运势',
              logo: { type: 'svg', name: 'horoscope' },
              desc: '查看十二星座每日运势，包含爱情、事业、财运等信息',
              url: '/tools/horoscope',
              cate: '其他摸鱼'
            },
            {
              id: 732,
              title: '星系运动查看',
              logo: { type: 'svg', name: 'galaxyMotion' },
              desc: '可视化模拟宇宙中星系运动的轨迹和状态，提供沉浸式的宇宙体验',
              url: '/galaxy-motion',
              cate: '其他摸鱼',
              isNew: true
            },
            {
              id: 733,
              title: '摸鱼日历',
              logo: { type: 'svg', name: 'calendar' },
              desc: '查看每日摸鱼日历，了解距离各种假期的剩余时间，支持历史日期查询',
              url: '/tools/fish-calendar',
              cate: '其他摸鱼',
              isNew: true
            },
            {
              id: 734,
              title: '全屏翻页时钟',
              logo: { type: 'svg', name: 'flipClock' },
              desc: '极简风格的全屏翻页时钟，支持12/24小时制切换，适合作为桌面时钟',
              url: '/tools/daily/flip-clock',
              cate: '其他摸鱼',
              isNew: true
            }
          ]
        },
        {
          id: 74,
          title: '摸鱼游戏',
          list: [
            {
              id: 741,
              title: '打字雨 (中文)',
              logo: { type: 'svg', name: 'typingRain' },
              desc: '经典的打字雨游戏中文版，锻炼打字速度与反应能力',
              url: '/tools/games/typing-rain-cn',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 742,
              title: '打字雨 (English)',
              logo: { type: 'svg', name: 'typingRain' },
              desc: 'Classic Typing Rain game, test your English typing speed',
              url: '/tools/games/typing-rain-en',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 743,
              title: '贪吃蛇',
              logo: { type: 'svg', name: 'snake' },
              desc: '经典的贪吃蛇游戏，控制蛇吃食物变长，挑战最高分',
              url: '/tools/games/snake',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 744,
              title: '扫雷',
              logo: { type: 'svg', name: 'minesweeper' },
              desc: '经典的扫雷游戏，运用逻辑推理避开地雷，锻炼大脑',
              url: '/tools/games/minesweeper',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '新品']
            },
            {
              id: 745,
              title: '电子木鱼',
              logo: { type: 'svg', name: 'game' },
              desc: '在线敲木鱼，积攒功德，放松心情，净化心灵',
              url: '/tools/games/woodfish',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '解压']
            },
            {
              id: 746,
              title: '2048',
              logo: { type: 'svg', name: 'game' },
              desc: '经典的数字合成游戏，移动方块合并数字，挑战2048',
              url: '/tools/games/2048',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '益智']
            },
            {
              id: 747,
              title: '记忆翻牌',
              logo: { type: 'svg', name: 'memoryCard' },
              desc: '经典的记忆翻牌游戏，翻开卡片寻找相同的图案，考验你的瞬间记忆力！',
              url: '/tools/games/memory-card',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '益智']
            },
            {
              id: 748,
              title: '反应速度测试',
              logo: { type: 'svg', name: 'reactionTest' },
              desc: '测试你的神经反射速度，看看你能有多快！',
              url: '/tools/games/reaction-test',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '测试']
            },
            {
              id: 749,
              title: '五子棋',
              logo: { type: 'svg', name: 'gomoku' },
              desc: '经典的双人对弈游戏，五子连珠即可获胜',
              url: '/tools/games/gomoku',
              cate: '摸鱼游戏',
              isNew: true,
              tags: ['免费', '对战']
            }
          ]
        }
      ]
    },
    {
      id: 3,
      title: '效率工具',
      icon: '',
      list: [
        {
          id: 31,
          title: '教育学术',
          list: [
            {
              id: 311,
              title: '单位换算',
              logo: { type: 'svg', name: 'unit' },
              desc: '在线重量、长度、面积、时间、角度、速度、温度、压力、热量、功率等换算',
              url: '/tools/unit',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 312,
              title: '摩斯电码',
              logo: { type: 'svg', name: 'morse' },
              desc: '支持中文的摩斯电码编码解码',
              url: '/tools/morse',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 313,
              title: '常用进制转换',
              logo: { type: 'svg', name: 'scaletran' },
              desc: '在线进制转换工具，支持2到64进制之间的转换',
              url: '/tools/scaletran',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 314,
              title: 'ASCII码表',
              logo: { type: 'svg', name: 'ascii' },
              desc: 'ASCII码表,控制代码、标准ASCII字符和非标准ASCII字符对照表',
              url: '/tools/ascii',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 315,
              title: '长度单位转换',
              logo: { type: 'svg', name: 'length' },
              desc: '长度转换工具-支持国际长度单位，中国传统长度单位，英制长度单位',
              url: '/tools/unit?active=length',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 316,
              title: '面积单位转换',
              logo: { type: 'svg', name: 'area' },
              desc: '面积转换工具-支持国际面积单位，中国传统面积单位，英制面积单位',
              url: '/tools/unit?active=area',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 317,
              title: '重量单位转换',
              logo: { type: 'svg', name: 'weight' },
              desc: '在线重量单位换算工具，支持多种计量单位',
              url: '/tools/unit?active=weight',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 318,
              title: '时间单位转换',
              logo: { type: 'svg', name: 'timeUnit' },
              desc: '时间单位转换工具-支持国际时间单位',
              url: '/tools/unit?active=time',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 319,
              title: '温度单位转换',
              logo: { type: 'svg', name: 'temperature' },
              desc: '温度单位转换工具-支持国际温度单位',
              url: '/tools/unit?active=temperature',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 3110,
              title: '压力单位转换',
              logo: { type: 'svg', name: 'pressure' },
              desc: '压力单位转换工具-Pa/kPa/hPa/MPa/bar/torr/psi等',
              url: '/tools/unit?active=pressure',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 3111,
              title: '热量单位转换',
              logo: { type: 'svg', name: 'heat' },
              desc: '热量单位在线转换工具，支持Wh/mWh/kWh/MWh/J/kJ等单位',
              url: '/tools/unit?active=heat',
              cateId: 3,
              cate: '教育学术'
            },
            {
              id: 3112,
              title: '功率单位转换',
              logo: { type: 'svg', name: 'power' },
              desc: '功率单位转换工具-W/mW/kW/MW/GW等',
              url: '/tools/unit?active=power',
              cateId: 3,
              cate: '教育学术'
            }
          ]
        },
        {
          id: 32,
          title: '选择随机',
          list: [
            {
              id: 321,
              title: '生成随机数',
              logo: { type: 'svg', name: 'random' },
              desc: '可定制范围内进行随机数字，可用于抽奖、点名等用途',
              url: '/tools/random',
              cateId: 3,
              cate: '选择随机'
            },
            {
              id: 322,
              title: '帮我决定',
              logo: { type: 'svg', name: 'choose' },
              desc: '选择困难，难以决定，今天吃什么，现在做什么，自定义选项都给你安排的明明白白',
              url: '/tools/decision',
              cateId: 3,
              cate: '选择随机'
            },
            {
              id: 323,
              title: '抛硬币',
              logo: { type: 'svg', name: 'coin' },
              desc: '在线抛硬币，选择困难那么交给硬币来帮你选',
              url: '/tools/coin',
              cateId: 3,
              cate: '选择随机'
            },
            {
              id: 324,
              title: '投骰子',
              logo: { type: 'svg', name: 'dice' },
              desc: '在线投骰子，可自定义骰子数，简单好用的骰子工具',
              url: '/tools/dice',
              cateId: 3,
              cate: '选择随机'
            }
          ]
        },
        {
          id: 34,
          title: '数据换算',
          list: [
            {
              id: 341,
              title: '房贷利率调整计算器',
              logo: { type: 'svg', name: 'calculator' },
              desc: '在线计算房贷利率调整后的月供变化，支持LPR利率调整计算',
              url: '/tools/calculation/mortgage-rate',
              cateId: 3,
              cate: '数据换算'
            },
            {
              id: 342,
              title: '投资收益计算器',
              logo: { type: 'svg', name: 'chart' },
              desc: '在线投资收益计算器，支持复利计算、定投计算',
              url: '/tools/calculation/investment',
              cateId: 3,
              cate: '数据换算'
            },
            {
              id: 343,
              title: '五险一金计算器',
              logo: { type: 'svg', name: 'money' },
              desc: '2025最新五险一金计算器，快速计算个人应缴和实发工资',
              url: '/tools/calculation/social-insurance',
              cateId: 3,
              cate: '数据换算'
            },
            {
              id: 344,
              title: '温度转换器',
              logo: { type: 'svg', name: 'temperature' },
              desc: '在线温度单位转换工具，支持摄氏度、华氏度、开尔文之间的快速互转',
              url: '/tools/calculation/temperature',
              cateId: 3,
              cate: '数据换算'
            },
            {
              id: 345,
              title: '房贷计算器',
              logo: { type: 'svg', name: 'house' },
              desc: '专业的房贷计算器，支持等额本息和等额本金两种还款方式',
              url: '/tools/calculation/mortgage',
              cateId: 3,
              cate: '数据换算'
            },
            {
              id: 346,
              title: 'BMR基础代谢计算器',
              logo: { type: 'svg', name: 'bmr' },
              desc: '计算您的基础代谢率(BMR)和每日热量消耗(TDEE)，科学管理身材',
              url: '/tools/calculation/bmr',
              cateId: 3,
              cate: '数据换算',
              isNew: true
            },
            {
              id: 347,
              title: '折扣计算器',
              logo: { type: 'svg', name: 'discount' },
              desc: '在线折扣计算器，快速计算打折后的价格和节省的金额',
              url: '/tools/calculation/discount',
              cateId: 3,
              cate: '数据换算',
              isNew: true,
              tags: ['免费', '新品']
            }
          ]
        },
        {
          id: 33,
          title: '其他工具',
          list: [
            {
              id: 332,
              title: '手持弹幕',
              logo: { type: 'svg', name: 'barrage' },
              desc: '持滚动弹幕',
              url: '/tools/barrage',
              cateId: 3,
              cate: '其他工具'
            },
            {
              id: 333,
              title: '色板',
              logo: { type: 'svg', name: 'palettes' },
              desc: '包含纯色、渐变与阶梯色和常用色彩组合',
              url: '/tools/palettes',
              cateId: 3,
              cate: '其他工具'
            },
            {
              id: 334,
              title: 'Color选择器',
              logo: { type: 'svg', name: 'colorPicker' },
              desc: '在线颜色选择工具，支持十六进制、RGB、HSL、CSS等格式转换',
              url: '/tools/colorpicker',
              cateId: 3,
              cate: '其他工具'
            },
            {
              id: 335,
              title: '随机工具推荐',
              logo: { type: 'svg', name: 'random' },
              desc: '随机推荐各种实用工具，发现更多好用的在线工具',
              url: '/tools/random-tools',
              cateId: 3,
              cate: '其他工具'
            },
            {
              id: 336,
              title: '呼吸冥想',
              logo: { type: 'svg', name: 'breathing' },
              desc: '跟随指引进行深呼吸练习，帮助你放松身心，缓解焦虑和压力',
              url: '/tools/daily/breathing',
              cateId: 3,
              cate: '其他工具',
              isNew: true
            },
            {
              id: 337,
              title: '屏幕测试',
              logo: { type: 'svg', name: 'screenTest' },
              desc: '在线屏幕测试工具，提供纯色背景检测屏幕坏点、漏光和色彩表现',
              url: '/tools/daily/screen-test',
              cateId: 3,
              cate: '其他工具',
              isNew: true
            }
          ]
        }
      ]
    }
  ]
}
//工具list
export function toolsList() {
  let list = [] as Tool[]
  let toolsCate = getToolsCate()

  // 递归处理嵌套的工具列表
  const processTools = (tools: any[]) => {
    for (const tool of tools) {
      if (Array.isArray(tool.list)) {
        processTools(tool.list)
      } else {
        list.push(tool)
      }
    }
  }

  // 处理每个分类下的工具
  for (const cate of toolsCate) {
    processTools(cate.list)
  }

  return list
}

//获取工具
export function getTools(data: ToolsReqData) {
  //获取参数
  const { cateId, title } = data
  //获取工具list
  let list = toolsList()
  //标题筛选
  if (title != '') {
    list = list.filter(item => {
      let tmpValue = item.title.toLowerCase()
      let tmpDesc = item.desc.toLowerCase()
      return tmpValue.indexOf(title.toLowerCase()) !== -1 || tmpDesc.indexOf(title.toLowerCase()) !== -1;
    });
  }
  //分类筛选
  if (cateId > 0) {
    list = list.filter(item => {
      return item.cateId == cateId;
    });
  }
  return list
}

/**
 * ====================================
 * 底部推荐工具相关函数 - 2025/1/10新增
 * 用于替代原有的 ToolRecommendations 组件
 *
 * 推荐工具函数说明：
 * 1. getRelatedTools: 智能推荐相关工具（智能推荐）
 *    - 基于当前工具的分类，优先推荐同类工具
 *    - 可以控制同类和其他类的数量
 *
 * 2. getHotTools: 固定的热门工具列表（固定链接）
 *    - 手动配置热门工具列表
 *    - 可以控制返回数量
 *
 * 3. getNewTools: 智能推荐新品工具（智能推荐）
 *    - 从所有工具中随机选择推荐
 *    - 可以控制返回数量
 *
 * 4. getUtilityTools: 智能推荐实用工具（智能推荐）
 *    - 从开发运维类工具中随机选择推荐
 *    - 可以控制返回数量
 * ====================================
 */

//获取相关工具推荐
export function getRelatedTools(currentToolUrl: string, sameLimit: number = 3, otherLimit: number = 2): Tool[] {
  const allTools: Tool[] = []
  const tools = getToolsCate()

  // 收集所有工具
  tools.forEach(category => {
    category.list.forEach(subCategory => {
      allTools.push(...subCategory.list)
    })
  })

  const currentTool = allTools.find(tool => tool.url === currentToolUrl)
  if (!currentTool) return []

  const sameCateTools = allTools.filter(tool =>
    tool.cate === currentTool.cate && tool.url !== currentToolUrl
  )

  const otherCateTools = allTools.filter(tool =>
    tool.cate !== currentTool.cate && tool.url !== currentToolUrl
  )

  const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  return [
    ...shuffleArray(sameCateTools).slice(0, sameLimit),
    ...shuffleArray(otherCateTools).slice(0, otherLimit)
  ]
}

//获取广告工具
export function getHotTools(limit: number = 3): Tool[] {
  // 可自定义热门工具列表
  const tools = [
    {
      id: 1,
      title: "AI学习网站",
      desc: "每天逛一逛",
      url: "https://www.uied.cn/category/aigc/ai",
      logo: "",  // 保留空字段以符合类型要求
      cateId: 0,
      cate: "",
      isExternal: true
    },
    {
      id: 2,
      title: "免费AI生成PPT",
      desc: "AI智能生成PPT",
      url: "https://www.aippt.cn/?utm_type=Navweb&utm_source=bbdh&utm_page=aippt&utm_plan=ppt&utm_unit=AIPPT&utm_keyword=40471047",
      logo: "",
      cateId: 0,
      cate: "",
      isExternal: true
    },
    {
      id: 3,
      title: "AIGC学习网站",
      desc: "UIED技术团队官网",
      url: "https://uied.cn/",
      logo: "",
      cateId: 0,
      cate: "",
      isExternal: true
    },
    {
      id: 4,
      title: "AIGC工具",
      desc: "AI智能工具集合",
      url: "https://universalbus.cn/?s=lPLG02aydo",
      logo: "",
      cateId: 0,
      cate: "",
      isExternal: true
    },
    {
      id: 5,
      title: "Midjourney绘画",
      desc: "AI绘画生成工具",
      url: "https://nf.video/czybtp/?gid=26",
      logo: "",
      cateId: 0,
      cate: "",
      isExternal: true
    },
    {
      id: 7,
      title: "GPT-4.0",
      desc: "最新版GPT-4.0智能对话工具",
      url: "https://nf.video/oemcwv/?gid=18",
      logo: "",
      cateId: 0,
      cate: "",
      isExternal: true
    },
    {
      id: 8,
      title: "ChatExcel表格",
      desc: "AI Excel 数据分析辅助工具",
      url: "https://www.chatexcel.com/#/home?partner_uuid=4227AB911C6531FF898C5E7BB54757E6 ",
      logo: "",
      cateId: 0,
      cate: "",
      isExternal: true
    }
  ]
  return tools.slice(0, limit)
}

//获取新品上线（按发布日期排序）
export function getNewTools(limit: number = 3): Tool[] {
  // 获取所有工具
  const allTools = toolsList()

  // 按发布日期排序，没有日期的排在最后
  const sortedTools = allTools.sort((a, b) => {
    if (!a.releaseDate) return 1
    if (!b.releaseDate) return -1
    return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  })

  // 返回最新的工具
  return sortedTools.slice(0, limit)
}

//获取实用工具（智能推荐）
export function getUtilityTools(limit: number = 3): Tool[] {
  // 获取所有工具
  const allTools = toolsList()

  // 筛选开发运维类工具
  const devTools = allTools.filter(tool => tool.cateId === 2)

  // 打乱数组顺序
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  // 随机选择工具
  return shuffleArray(devTools).slice(0, limit)
}

/**
 * 获取随机工具列表
 * @param limit 限制返回的工具数量
 * @param excludeUrl 需要排除的工具URL，通常是当前页面的工具
 * @returns 随机工具列表
 */
export function getRandomTools(limit: number = 8, excludeUrl?: string): Tool[] {
  // 获取所有工具列表
  const allTools = toolsList()

  // 如果有需要排除的URL，则过滤掉该工具
  const filteredTools = excludeUrl
    ? allTools.filter(tool => tool.url !== excludeUrl)
    : allTools

  // 随机打乱数组
  const shuffled = [...filteredTools].sort(() => Math.random() - 0.5)

  // 返回指定数量的工具
  return shuffled.slice(0, limit)
}

/**
 * ====================================
 * 导出所有工具函数
 * 包含原有函数和新增的底部推荐工具函数
 * ====================================
 */
const ToolsExport = {
  // 原有的工具函数
  getTools,
  getToolsCate,
  toolsList,

  // 2025/1/10新增 - 底部推荐工具函数
  getRelatedTools,
  getHotTools,
  getNewTools,
  getUtilityTools,

  // 2025/1/10新增 - 获取随机工具列表
  getRandomTools,
};

export default ToolsExport;

