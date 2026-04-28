/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const CURRENT_FILE = fileURLToPath(import.meta.url)
const ROOT_DIR = path.resolve(path.dirname(CURRENT_FILE), '../..')
const RUNTIME_DIR = path.join(ROOT_DIR, '.runtime')
const TMP_DIR = path.join(RUNTIME_DIR, 'tmp')
const COMPOSE_ENV_FILE = path.join(RUNTIME_DIR, 'compose.env')
const PORTS_ENV_FILE = path.join(RUNTIME_DIR, 'ports.env')
const BACKEND_COMPOSE_FILE = path.join(ROOT_DIR, 'backend', 'docker-compose.yml')
const TOOLS_SOURCE_FILE = path.join(ROOT_DIR, 'src', 'components', 'Tools', 'tools.ts')
const LEFT_LAYOUT_FILE = path.join(ROOT_DIR, 'src', 'components', 'Layout', 'Left', 'Left.vue')
const TEMP_TOOLS_MODULE_FILE = path.join(TMP_DIR, 'tools.catalog.runtime.mjs')

const DEFAULT_COMPOSE_PROJECT = 'uiedtool_stack'
const DEFAULT_DB_NAME = 'uiedtool'
const DEFAULT_MYSQL_ROOT_PASSWORD = 'root123456'
const SYSTEM_CONFIG_LONGTEXT_SQL =
  "ALTER TABLE `la_system_config` MODIFY COLUMN `value` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '值';"

const DEFAULT_SIDEBAR_RECOMMEND_LINKS = [
  { name: '热门工具', link: '#recommend-hot' },
  { name: '随机推荐', link: '/tools/random-tools' },
  { name: '每日热榜', link: '/tools/hot-ranking' },
  { name: '每日文章', link: 'https://hot.uied.cn/' },
  { name: '实时资讯', link: '/tools/ai-news' },
  { name: 'AI产品榜', link: 'https://hao.uied.cn/' }
]

const DEFAULT_SITE_SLOGAN = '免费在线工具集'
const DEFAULT_SIDEBAR_BRAND_TEXT = 'UIED-Tools'
const DEFAULT_SIDEBAR_RECOMMEND_TITLE = '推荐工具'

const DEFAULT_SIDEBAR_MENU_ICON_MAP = {
  ai: '/icons/sidebar/ai.svg',
  design: '/icons/sidebar/design.svg',
  image: '/icons/sidebar/image.svg',
  office: '/icons/sidebar/office.svg',
  daily: '/icons/sidebar/daily.svg',
  copywriting: '/icons/sidebar/copywriting.svg',
  psychology: '/icons/sidebar/psychology.svg',
  video: '/icons/sidebar/video.svg',
  dev: '/icons/sidebar/dev.svg',
  slacking: '/icons/sidebar/slacking.svg',
  efficiency: '/icons/sidebar/efficiency.svg'
}

const DEFAULT_SIDEBAR_CATEGORY_MENUS = [
  { key: 'ai', title: 'AI工具箱', cateTitle: 'AI工具箱', link: '/tools/ai/toolbox', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.ai },
  { key: 'design', title: '设计工具', cateTitle: '设计工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.design },
  { key: 'image', title: '图片处理', cateTitle: '图片处理', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.image },
  { key: 'office', title: '办公工具', cateTitle: '办公工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.office },
  { key: 'daily', title: '生活常用', cateTitle: '生活常用', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.daily },
  { key: 'copywriting', title: '文案工具', cateTitle: '文案工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.copywriting },
  { key: 'psychology', title: '潜能测试', cateTitle: '潜能测试', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.psychology },
  { key: 'video', title: '剪辑工具', cateTitle: '剪辑工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.video },
  { key: 'dev', title: '开发工具', cateTitle: '开发工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.dev },
  { key: 'slacking', title: '摸鱼工具', cateTitle: '摸鱼工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.slacking },
  { key: 'efficiency', title: '效率工具', cateTitle: '效率工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.efficiency }
]

const DEFAULT_SIDEBAR_BOTTOM_LINKS = [
  { name: '更新记录', link: '/changelog' },
  { name: '意见反馈', link: 'https://uiedtool.com/' },
  { name: '关于我们', link: '/about' }
]

const DEFAULT_AI_TOOLBOX_SIDEBAR_MENUS = [
  { name: 'AI精选工具', link: '#ai-highlight' },
  { name: 'AI分组总览', link: '#ai-groups' }
]

/**
 * 函数说明：批量生成工具主数据预设，减少第三阶段 AI 工具扩展时的重复配置。
 */
const createToolMetadataPresetList = (phaseLabel, startSort, items) => {
  return items.map((item, index) => ({
    matchUrl: item.matchUrl,
    toolKey: item.toolKey,
    consumePoints: item.consumePoints ?? 1,
    memberFree: item.memberFree ?? true,
    status: item.status ?? 1,
    sort: startSort + index * 10,
    remark: `${phaseLabel}：${item.title}`
  }))
}

const FIRST_PHASE_TOOL_METADATA_PRESETS = [
  {
    matchUrl: '/tools/photo/background',
    toolKey: 'photo-background',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 10,
    remark: '第一阶段高频工具主数据迁后台：证件照换底色'
  },
  {
    matchUrl: '/tools/photo/transparent',
    toolKey: 'photo-transparent',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 20,
    remark: '第一阶段高频工具主数据迁后台：证件照免冠处理'
  },
  {
    matchUrl: '/tools/photo/crop',
    toolKey: 'photo-crop',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 30,
    remark: '第一阶段高频工具主数据迁后台：证件照尺寸裁剪'
  },
  {
    matchUrl: '/tools/photo/layout',
    toolKey: 'photo-layout',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 40,
    remark: '第一阶段高频工具主数据迁后台：证件照排版打印'
  },
  {
    matchUrl: '/tools/video/frame',
    toolKey: 'video-frame',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 110,
    remark: '第一阶段高频工具主数据迁后台：视频抽帧'
  },
  {
    matchUrl: '/tools/video/to-audio',
    toolKey: 'video-to-audio',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 120,
    remark: '第一阶段高频工具主数据迁后台：视频提取音频'
  },
  {
    matchUrl: '/tools/video/compress',
    toolKey: 'video-compress',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 130,
    remark: '第一阶段高频工具主数据迁后台：视频压缩'
  },
  {
    matchUrl: '/tools/video/convert',
    toolKey: 'video-format-convert',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 140,
    remark: '第一阶段高频工具主数据迁后台：视频格式转换'
  },
  {
    matchUrl: '/tools/video/merge',
    toolKey: 'video-merge',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 150,
    remark: '第一阶段高频工具主数据迁后台：视频拼接'
  },
  {
    matchUrl: '/tools/video/gif',
    toolKey: 'video-to-gif',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 160,
    remark: '第一阶段高频工具主数据迁后台：视频转 GIF'
  },
  {
    matchUrl: '/tools/video/watermark',
    toolKey: 'video-watermark',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 170,
    remark: '第一阶段高频工具主数据迁后台：视频加水印'
  },
  {
    matchUrl: '/tools/video/speed',
    toolKey: 'video-speed',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 180,
    remark: '第一阶段高频工具主数据迁后台：视频倍速处理'
  },
  {
    matchUrl: '/tools/video/rotate',
    toolKey: 'video-rotate',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 190,
    remark: '第一阶段高频工具主数据迁后台：视频旋转与翻转'
  },
  {
    matchUrl: '/tools/video/crop',
    toolKey: 'video-crop',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 200,
    remark: '第一阶段高频工具主数据迁后台：视频画面裁剪'
  },
  {
    matchUrl: '/tools/video/mute',
    toolKey: 'video-mute',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 210,
    remark: '第一阶段高频工具主数据迁后台：视频静音'
  },
  {
    matchUrl: '/tools/video/trimmer',
    toolKey: 'video-trimmer',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 220,
    remark: '第一阶段高频工具主数据迁后台：视频时长剪辑'
  },
  {
    matchUrl: '/tools/ai/work-summary',
    toolKey: 'ai-work-summary',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 310,
    remark: '第二阶段核心 AI 办公工具：工作总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=annual',
    toolKey: 'ai-work-summary-annual',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 320,
    remark: '第二阶段核心 AI 办公工具：年度工作总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=quarterly',
    toolKey: 'ai-work-summary-quarterly',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 330,
    remark: '第二阶段核心 AI 办公工具：季度工作总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=mid_year',
    toolKey: 'ai-work-summary-mid-year',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 340,
    remark: '第二阶段核心 AI 办公工具：年中工作总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=performance',
    toolKey: 'ai-work-summary-performance',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 350,
    remark: '第二阶段核心 AI 办公工具：工作考核总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=probation',
    toolKey: 'ai-work-summary-probation',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 360,
    remark: '第二阶段核心 AI 办公工具：转正工作总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=promotion',
    toolKey: 'ai-work-summary-promotion',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 370,
    remark: '第二阶段核心 AI 办公工具：晋升工作总结'
  },
  {
    matchUrl: '/tools/ai/work-summary?type=training',
    toolKey: 'ai-work-summary-training',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 380,
    remark: '第二阶段核心 AI 办公工具：工作培训总结'
  },
  {
    matchUrl: '/tools/ai/office/work-plan',
    toolKey: 'ai-office-work-plan',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 390,
    remark: '第二阶段核心 AI 办公工具：工作方案'
  },
  {
    matchUrl: '/tools/ai/office/work-plan?type=department',
    toolKey: 'ai-office-work-plan-department',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 400,
    remark: '第二阶段核心 AI 办公工具：部门计划'
  },
  {
    matchUrl: '/tools/ai/office/work-plan?type=personal',
    toolKey: 'ai-office-work-plan-personal',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 410,
    remark: '第二阶段核心 AI 办公工具：工作计划'
  },
  {
    matchUrl: '/tools/ai/office/work-report',
    toolKey: 'ai-office-work-report',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 420,
    remark: '第二阶段核心 AI 办公工具：工作汇报'
  },
  {
    matchUrl: '/tools/ai/office/work-report?type=daily',
    toolKey: 'ai-office-work-report-daily',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 430,
    remark: '第二阶段核心 AI 办公工具：工作日报'
  },
  {
    matchUrl: '/tools/ai/office/work-report?type=weekly',
    toolKey: 'ai-office-work-report-weekly',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 440,
    remark: '第二阶段核心 AI 办公工具：工作周报'
  },
  {
    matchUrl: '/tools/ai/office/custom-summary',
    toolKey: 'ai-office-custom-summary',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 450,
    remark: '第二阶段核心 AI 办公工具：自定义总结'
  },
  {
    matchUrl: '/tools/ai/debriefing-report',
    toolKey: 'ai-debriefing-report',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 460,
    remark: '第二阶段核心 AI 办公工具：述职报告'
  },
  {
    matchUrl: '/tools/ai/office/resume-creation',
    toolKey: 'ai-office-resume-creation',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 470,
    remark: '第二阶段核心 AI 办公工具：简历制作'
  },
  {
    matchUrl: '/tools/ai/project-proposal',
    toolKey: 'ai-project-proposal',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 480,
    remark: '第二阶段核心 AI 办公工具：项目策划方案'
  },
  {
    matchUrl: '/tools/ai/office/holiday-notice',
    toolKey: 'ai-office-holiday-notice',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 490,
    remark: '第二阶段核心 AI 办公工具：放假通知'
  },
  {
    matchUrl: '/tools/ai/office/notice-writing',
    toolKey: 'ai-office-notice-writing',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 500,
    remark: '第二阶段核心 AI 办公工具：通知撰写'
  },
  {
    matchUrl: '/tools/ai/office/work-reflections',
    toolKey: 'ai-office-work-reflections',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 510,
    remark: '第二阶段核心 AI 办公工具：工作感想'
  },
  {
    matchUrl: '/tools/ai/office/application-report',
    toolKey: 'ai-office-application-report',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 520,
    remark: '第二阶段核心 AI 办公工具：申请报告'
  },
  {
    matchUrl: '/tools/ai/office/resignation-letter',
    toolKey: 'ai-office-resignation-letter',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 530,
    remark: '第二阶段核心 AI 办公工具：辞职报告'
  },
  {
    matchUrl: '/tools/ai/office/training-scheme',
    toolKey: 'ai-office-training-scheme',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 540,
    remark: '第二阶段核心 AI 办公工具：培训方案'
  },
  {
    matchUrl: '/tools/ai/office/contract-template',
    toolKey: 'ai-office-contract-template',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 550,
    remark: '第二阶段核心 AI 办公工具：合同模版'
  },
  {
    matchUrl: '/tools/ai/office/meeting-minutes',
    toolKey: 'ai-office-meeting-minutes',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 560,
    remark: '第二阶段核心 AI 办公工具：润色会议纪要'
  },
  {
    matchUrl: '/tools/ai/article-generator',
    toolKey: 'ai-article-generator',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 610,
    remark: '第二阶段核心 AI 写作工具：AI文章生成'
  },
  {
    matchUrl: '/tools/ai/speech-draft',
    toolKey: 'ai-speech-draft',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 620,
    remark: '第二阶段核心 AI 写作工具：演讲稿'
  },
  {
    matchUrl: '/tools/ai/essay-writing',
    toolKey: 'ai-essay-writing',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 630,
    remark: '第二阶段核心 AI 写作工具：作文一键写作'
  },
  {
    matchUrl: '/tools/ai/xiaohongshu-note',
    toolKey: 'ai-xiaohongshu-note',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 640,
    remark: '第二阶段核心 AI 写作工具：小红书笔记生成'
  },
  {
    matchUrl: '/tools/ai/xiaohongshu-title',
    toolKey: 'ai-xiaohongshu-title',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 650,
    remark: '第二阶段核心 AI 写作工具：小红书爆款标题'
  },
  {
    matchUrl: '/tools/ai/xiaohongshu-rewrite',
    toolKey: 'ai-xiaohongshu-rewrite',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 660,
    remark: '第二阶段核心 AI 写作工具：小红书笔记改写'
  },
  {
    matchUrl: '/tools/ai/speech-script',
    toolKey: 'ai-speech-script',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 670,
    remark: '第二阶段核心 AI 写作工具：讲话稿'
  },
  {
    matchUrl: '/tools/ai/short-video-title',
    toolKey: 'ai-short-video-title',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 680,
    remark: '第二阶段核心 AI 写作工具：短视频标题'
  },
  {
    matchUrl: '/tools/ai/short-video-script',
    toolKey: 'ai-short-video-script',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 690,
    remark: '第二阶段核心 AI 写作工具：短视频剧本'
  },
  {
    matchUrl: '/tools/ai/article-summary',
    toolKey: 'ai-article-summary',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 700,
    remark: '第二阶段核心 AI 写作工具：长文与报告摘要'
  },
  {
    matchUrl: '/tools/ai/article-outline',
    toolKey: 'ai-article-outline',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 710,
    remark: '第二阶段核心 AI 写作工具：长文与报告大纲'
  },
  {
    matchUrl: '/tools/ai/article-polishing',
    toolKey: 'ai-article-polishing',
    consumePoints: 1,
    memberFree: true,
    status: 1,
    sort: 720,
    remark: '第二阶段核心 AI 写作工具：文章降重润色'
  },
  ...createToolMetadataPresetList('第三阶段核心 AI 办公工具', 810, [
    { matchUrl: '/tools/ai/office/competitor-speech', toolKey: 'ai-office-competitor-speech', title: '竞聘演讲稿' },
    { matchUrl: '/tools/ai/office/design-concept', toolKey: 'ai-office-design-concept', title: '设计理念撰写' },
    { matchUrl: '/tools/ai/office/questionnaire-design', toolKey: 'ai-office-questionnaire-design', title: '调查问卷设计' },
    { matchUrl: '/tools/ai/office/tender-writing', toolKey: 'ai-office-tender-writing', title: '标书生成' },
    { matchUrl: '/tools/ai/office/cover-letter', toolKey: 'ai-office-cover-letter', title: '求职信生成' },
    { matchUrl: '/tools/ai/office/interview-outline', toolKey: 'ai-office-interview-outline', title: '访谈提纲' },
    { matchUrl: '/tools/ai/office/okr-generator', toolKey: 'ai-office-okr-generator', title: 'OKR 生成' },
    { matchUrl: '/tools/ai/office/code-generator', toolKey: 'ai-office-code-generator', title: '代码生成' },
    { matchUrl: '/tools/ai/office/job-description', toolKey: 'ai-office-job-description', title: '岗位职责生成' },
    { matchUrl: '/tools/ai/office/lawsuit-document', toolKey: 'ai-office-lawsuit-document', title: '起诉状生成' }
  ]),
  ...createToolMetadataPresetList('第三阶段核心 AI 分析工具', 930, [
    { matchUrl: '/tools/ai/analysis/research-report', toolKey: 'ai-analysis-research-report', title: '调研报告' },
    { matchUrl: '/tools/ai/analysis/analysis-report', toolKey: 'ai-analysis-analysis-report', title: '分析报告' },
    { matchUrl: '/tools/ai/analysis/activity-plan', toolKey: 'ai-analysis-activity-plan', title: '活动策划方案' },
    { matchUrl: '/tools/ai/analysis/business-plan', toolKey: 'ai-analysis-business-plan', title: '商业计划书' },
    { matchUrl: '/tools/ai/analysis/survey-report', toolKey: 'ai-analysis-survey-report', title: '调查报告' },
    { matchUrl: '/tools/ai/analysis/industry-report', toolKey: 'ai-analysis-industry-report', title: '行业报告' },
    { matchUrl: '/tools/ai/analysis/feasibility-study', toolKey: 'ai-analysis-feasibility-study', title: '可行性研究报告' },
    { matchUrl: '/tools/ai/analysis/project-application', toolKey: 'ai-analysis-project-application', title: '项目申报书' },
    { matchUrl: '/tools/ai/analysis/pest', toolKey: 'ai-analysis-pest', title: 'PEST 分析' },
    { matchUrl: '/tools/ai/analysis/swot', toolKey: 'ai-analysis-swot', title: 'SWOT 分析' },
    { matchUrl: '/tools/ai/analysis/transport-plan', toolKey: 'ai-analysis-transport-plan', title: '运输方案' },
    { matchUrl: '/tools/ai/analysis/situation-report', toolKey: 'ai-analysis-situation-report', title: '情况报告' },
    { matchUrl: '/tools/ai/analysis/marketing-4p', toolKey: 'ai-analysis-marketing-4p', title: '4P 营销分析' },
    { matchUrl: '/tools/ai/analysis/industry-consultant', toolKey: 'ai-analysis-industry-consultant', title: '行业顾问分析' },
    { matchUrl: '/tools/ai/analysis/startup-ideas', toolKey: 'ai-analysis-startup-ideas', title: '创业点子生成' }
  ]),
  ...createToolMetadataPresetList('第三阶段核心 AI 学生工具', 1090, [
    { matchUrl: '/tools/ai/intern-summary', toolKey: 'ai-intern-summary', title: '实习总结' },
    { matchUrl: '/tools/ai/practice-report', toolKey: 'ai-practice-report', title: '实践报告' },
    { matchUrl: '/tools/ai/weekly-summary', toolKey: 'ai-weekly-summary', title: '周报总结' },
    { matchUrl: '/tools/ai/opening-report', toolKey: 'ai-opening-report', title: '开题报告' },
    { matchUrl: '/tools/ai/graduation-thesis', toolKey: 'ai-graduation-thesis', title: '毕业论文' },
    { matchUrl: '/tools/ai/student/internship-comments', toolKey: 'ai-student-internship-comments', title: '实习评语' },
    { matchUrl: '/tools/ai/student/research-report', toolKey: 'ai-student-research-report', title: '学生调研报告' },
    { matchUrl: '/tools/ai/student/internship-weekly', toolKey: 'ai-student-internship-weekly', title: '实习周记' },
    { matchUrl: '/tools/ai/student/internship-summary', toolKey: 'ai-student-internship-summary', title: '实习总结' },
    { matchUrl: '/tools/ai/student/social-practice', toolKey: 'ai-student-social-practice', title: '社会实践' },
    { matchUrl: '/tools/ai/student/practice-report', toolKey: 'ai-student-practice-report', title: '学生实践报告' },
    { matchUrl: '/tools/ai/student/analysis-report', toolKey: 'ai-student-analysis-report', title: '学生分析报告' },
    { matchUrl: '/tools/ai/student/interview-guide', toolKey: 'ai-student-interview-guide', title: '访谈指南' },
    { matchUrl: '/tools/ai/student/internship-experience', toolKey: 'ai-student-internship-experience', title: '实习心得' },
    { matchUrl: '/tools/ai/student/internship-report', toolKey: 'ai-student-internship-report', title: '实习报告' },
    { matchUrl: '/tools/ai/student/resume-creation', toolKey: 'ai-student-resume-creation', title: '学生简历制作' },
    { matchUrl: '/tools/ai/student/activity-plan', toolKey: 'ai-student-activity-plan', title: '学生活动策划' }
  ]),
  ...createToolMetadataPresetList('第三阶段核心 AI 写作工具', 1280, [
    { matchUrl: '/tools/ai/book-review', toolKey: 'ai-book-review', title: '读后感生成' },
    { matchUrl: '/tools/ai/literature-review', toolKey: 'ai-literature-review', title: '文献综述' },
    { matchUrl: '/tools/ai/training-experience', toolKey: 'ai-training-experience', title: '培训心得' },
    { matchUrl: '/tools/ai/work-report-ppt', toolKey: 'ai-work-report-ppt', title: '工作汇报 PPT' },
    { matchUrl: '/tools/ai/novel-plot', toolKey: 'ai-novel-plot', title: '小说情节生成' },
    { matchUrl: '/tools/ai/essay-contest', toolKey: 'ai-essay-contest', title: '征文稿生成' },
    { matchUrl: '/tools/ai/spokesperson-speech', toolKey: 'ai-spokesperson-speech', title: '发言人稿件' },
    { matchUrl: '/tools/ai/literature-recommend', toolKey: 'ai-literature-recommend', title: '文献推荐' },
    { matchUrl: '/tools/ai/self-reflection', toolKey: 'ai-self-reflection', title: '自我反思' }
  ]),
  {
    matchUrl: '/tools/unit',
    toolKey: 'unit'
  },
  {
    matchUrl: '/tools/unit?active=length',
    toolKey: 'unit-length'
  },
  {
    matchUrl: '/tools/unit?active=area',
    toolKey: 'unit-area'
  },
  {
    matchUrl: '/tools/unit?active=weight',
    toolKey: 'unit-weight'
  },
  {
    matchUrl: '/tools/unit?active=time',
    toolKey: 'unit-time'
  },
  {
    matchUrl: '/tools/unit?active=temperature',
    toolKey: 'unit-temperature'
  },
  {
    matchUrl: '/tools/unit?active=pressure',
    toolKey: 'unit-pressure'
  },
  {
    matchUrl: '/tools/unit?active=heat',
    toolKey: 'unit-heat'
  },
  {
    matchUrl: '/tools/unit?active=power',
    toolKey: 'unit-power'
  }
]

const DEFAULT_HEADER_LINKS = [
  { name: '个人网站', link: 'https://tomda.top/' }
]

const DEFAULT_SEARCH_QUICK_TOOLS = [
  {
    name: 'DeepSeek R1对话',
    desc: '基于 DeepSeek-R1 推理模型的智能对话',
    link: '/tools/ai/deepseek-r1'
  },
  {
    name: 'DeepSeek AI对话',
    desc: '基础智能对话服务',
    link: '/tools/ai/deepseek'
  },
  {
    name: 'DeepSeek提示词',
    desc: '专业的 Prompt 提示词指南',
    link: '/tools/ai/deepseek-prompt'
  },
  {
    name: 'DeepSeek导航',
    desc: 'DeepSeek 模型与工具导航',
    link: '/tools/ai/deepseek-nav'
  },
  {
    name: 'AI封面设计',
    desc: 'AI智能生成封面图片',
    link: '/tools/ai-design-cover'
  },
  {
    name: 'AI产品榜',
    desc: '跳转至 AI 产品导航站',
    link: 'https://hao.uied.cn/'
  }
]

const DEFAULT_SEARCH_PROVIDER_LABEL = '硅基流动 x 华为云联合 SiliconFlow'
const DEFAULT_SEARCH_PROVIDER_LINK = 'https://cloud.siliconflow.cn/i/AZywGNhl'

const DEFAULT_AI_CHAT_HEADER_LINKS = [
  { name: 'AI学习平台', link: 'https://www.uied.cn/' },
  { name: 'AI免费工具', link: 'https://uiedtool.com' },
  { name: 'AI资讯热榜', link: 'https://hot.uied.cn' },
  { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' },
  { name: 'AI交流群', link: 'https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink' },
  { name: 'AI知识库', link: 'https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink' }
]

const DEFAULT_AI_COMMON_HEADER_LINKS = [
  { name: '每日免费分享最新AI资讯', link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink' },
  { name: 'AI学习平台', link: 'https://www.uied.cn/' },
  { name: 'AI免费工具uiedtool.com', link: 'https://uiedtool.com' },
  { name: 'AI资讯热榜hot.uied.cn', link: 'https://hot.uied.cn' },
  { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' }
]

const DEFAULT_FOOTER_INTRO = '{webName} 是由 UIED技术团队 设计开发的在线工具平台'
const DEFAULT_FOOTER_QUICK_TITLE = '工具快捷入口'
const DEFAULT_FOOTER_FRIEND_TITLE = '友情链接'
const DEFAULT_OFFICIAL_MEDIA_TITLE = '官方媒体'
const DEFAULT_FOOTER_SUPPORT_LABEL = '技术支持'

const DEFAULT_FOOTER_SUPPORT_LINKS = [
  { name: 'Tomda', link: 'https://www.tomda.top/' },
  { name: 'UIED技术团队', link: 'https://fsuied.com' }
]

const DEFAULT_FOOTER_RECORD_LINKS = [
  { name: '粤ICP备2022056875号', link: 'https://beian.miit.gov.cn/' },
  { name: '网站地图', link: '/sitemap.xml' }
]

const DEFAULT_FOOTER_QUICK_SECTIONS = [
  {
    title: '设计',
    items: [
      { name: '色彩对比度', link: '/tools/design/contrast-checker' },
      { name: 'CSS阴影', link: '/tools/design/box-shadow' },
      { name: '黄金比例', link: '/tools/design/golden-ratio' },
      { name: 'Blob生成器', link: '/tools/design/blob-maker' },
      { name: '玻璃拟态', link: '/tools/design/glassmorphism' }
    ]
  },
  {
    title: '图像',
    items: [
      { name: '图片压缩', link: '/tools/image-compress' },
      { name: '二维码生成', link: '/tools/qrcode' },
      { name: '图片切割', link: '/tools/img-cut' },
      { name: '图片处理', link: '/tools/signimage' },
      { name: 'GIF压缩', link: '/tools/gif-compress' }
    ]
  },
  {
    title: 'PDF',
    items: [
      { name: '图片转PDF', link: '/tools/img-to-pdf' },
      { name: 'PDF转图片', link: '/tools/pdf-to-images' },
      { name: 'PDF合并', link: '/tools/pdf-merge' },
      { name: 'PDF分割', link: '/tools/pdf-split' }
    ]
  },
  {
    title: '文本',
    items: [
      { name: '文本对比', link: '/tools/diff' },
      { name: 'Markdown编辑', link: '/tools/markdown' },
      { name: '字数统计', link: '/tools/wordcount' }
    ]
  },
  {
    title: '开发',
    items: [
      { name: 'JSON转换', link: '/tools/json' },
      { name: '正则测试', link: '/tools/reg' },
      { name: '时间戳', link: '/tools/timetran' }
    ]
  },
  {
    title: '文案',
    items: [
      { name: '疯狂星期四', link: '/tools/copywriting/kfc' },
      { name: '今日诗词', link: '/tools/copywriting/daily-poem' },
      { name: '舔狗日记', link: '/tools/copywriting/dog-diary' },
      { name: '朋友圈文案', link: '/tools/copywriting/moments' }
    ]
  }
]

const DEFAULT_FOOTER_FRIEND_SECTIONS = [
  {
    title: 'AI',
    items: [
      { name: 'AI文章', link: 'https://www.uied.cn/category/aigc/ai' },
      { name: 'AI资讯', link: 'https://hot.uied.cn/ai-realtime' },
      { name: 'AI工具', link: 'https://hao.uied.cn/ai' },
      { name: 'AI知识库', link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink' },
      { name: 'AI交流群', link: 'https://www.uied.cn/wechat' }
    ]
  },
  {
    title: '教程',
    items: [
      { name: 'UI文章', link: 'https://www.uied.cn/category/wenzhang/ui-wenzhang' },
      { name: '平面文章', link: 'https://www.uied.cn/category/wenzhang/pingmian-wenzhang' },
      { name: '设计干货', link: 'https://www.uied.cn/category/wenzhang/ganhuo' },
      { name: '效率工具', link: 'https://www.uied.cn/category/wenzhang/tool' },
      { name: 'AI文章', link: 'https://www.uied.cn/category/aigc/ai' },
      { name: '开源项目', link: 'https://www.uied.cn/category/code/kaiyuan' }
    ]
  },
  {
    title: '设计',
    items: [
      { name: '设计文章', link: 'https://www.uied.cn/category/wenzhang/ui-wenzhang' },
      { name: '设计导航', link: 'https://hao.uied.cn/' },
      { name: '设计工具', link: 'https://uiedtool.com/' },
      { name: '设计资讯', link: 'https://hot.uied.cn/' }
    ]
  },
  {
    title: '其他',
    items: [
      { name: 'AIGC学习网站', link: 'https://uied.cn' },
      { name: 'UIED技术团队', link: 'https://fsuied.com' },
      { name: '拜拜导航', link: 'https://www.88sheji.cn/' },
      { name: 'Tomda', link: 'https://www.tomda.top/' },
      { name: '申请友链', link: 'https://fsuied.com/contact.html' }
    ]
  }
]

const DEFAULT_OFFICIAL_MEDIA_LINKS = [
  { name: '知乎', link: 'https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi' },
  { name: '小红书', link: 'https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83' },
  { name: '微博', link: 'https://weibo.com/u/7542146005' },
  { name: 'B站', link: 'https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0' }
]

const DEFAULT_SIDEBAR_BRAND_LOGO = ''

/**
 * 函数说明：输出统一日志，便于终端观察同步进度。
 */
const logInfo = (message) => {
  console.log(`[INFO] ${message}`)
}

/**
 * 函数说明：输出错误日志并以失败状态退出。
 */
const logErrorAndExit = (message) => {
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}

/**
 * 函数说明：解析命令行参数，支持是否强制覆盖已有配置。
 */
const parseArgs = () => {
  const args = new Set(process.argv.slice(2))
  return {
    force: args.has('--force')
  }
}

/**
 * 函数说明：解析 env 文件，兼容简单 KEY=VALUE 结构。
 */
const parseEnvFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .reduce((accumulator, line) => {
        const separatorIndex = line.indexOf('=')
        const key = line.slice(0, separatorIndex).trim()
        const value = line.slice(separatorIndex + 1).trim()
        accumulator[key] = value
        return accumulator
      }, {})
  } catch {
    return {}
  }
}

/**
 * 函数说明：读取当前本地全栈运行配置，未启动时回退到默认库名和 compose 项目名。
 */
const loadRuntimeConfig = async () => {
  const composeEnv = await parseEnvFile(COMPOSE_ENV_FILE)
  const portsEnv = await parseEnvFile(PORTS_ENV_FILE)

  return {
    composeProject: process.env.COMPOSE_PROJECT || composeEnv.COMPOSE_PROJECT || DEFAULT_COMPOSE_PROJECT,
    dbName: process.env.DB_NAME || composeEnv.DB_NAME || portsEnv.DB_NAME || DEFAULT_DB_NAME,
    mysqlRootPassword:
      process.env.MYSQL_ROOT_PASSWORD ||
      composeEnv.MYSQL_ROOT_PASSWORD ||
      portsEnv.MYSQL_ROOT_PASSWORD ||
      DEFAULT_MYSQL_ROOT_PASSWORD
  }
}

/**
 * 函数说明：将前端 tools.ts 转译为可执行模块，并读取完整工具分类树。
 */
const loadFrontendToolCategories = async () => {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const sourceCode = await fs.readFile(TOOLS_SOURCE_FILE, 'utf8')
  const transpiled = ts.transpileModule(sourceCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020
    }
  })

  await fs.writeFile(TEMP_TOOLS_MODULE_FILE, transpiled.outputText, 'utf8')
  const moduleUrl = `${pathToFileURL(TEMP_TOOLS_MODULE_FILE).href}?t=${Date.now()}`
  const toolsModule = await import(moduleUrl)

  if (typeof toolsModule.getToolsCate !== 'function') {
    throw new Error('无法从 tools.ts 读取 getToolsCate 导出')
  }

  const categories = toolsModule.getToolsCate()
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('前端工具分类树为空，无法同步到后台')
  }

  return categories
}

/**
 * 函数说明：标准化工具路径，统一去掉 query/hash 与末尾斜杠，便于按路由匹配高频工具预设。
 */
const normalizeToolRouteMatchKey = (value) => {
  const rawValue = String(value || '').trim().split('#')[0]
  if (!rawValue) {
    return ''
  }
  const [pathName, queryString = ''] = rawValue.split('?')
  const normalizedPath = pathName === '/' ? '/' : pathName.replace(/\/+$/g, '')
  if (!queryString) {
    return normalizedPath
  }
  return `${normalizedPath}?${queryString}`
}

const FIRST_PHASE_TOOL_METADATA_PRESET_MAP = new Map(
  FIRST_PHASE_TOOL_METADATA_PRESETS.map((item) => [normalizeToolRouteMatchKey(item.matchUrl), item])
)

/**
 * 函数说明：标准化工具路径，统一去掉 query/hash 与末尾斜杠，便于其它逻辑按路由主路径处理。
 */
const normalizeToolRoutePath = (value) => {
  const rawPath = String(value || '').trim().split('?')[0].split('#')[0]
  if (!rawPath) {
    return ''
  }
  if (rawPath === '/') {
    return '/'
  }
  return rawPath.replace(/\/+$/g, '')
}

/**
 * 函数说明：将第一阶段高频工具的主数据与策略字段注入分类树，先让后台有可审计的基础数据。
 */
const enrichToolCategoriesWithFirstPhaseMetadata = (categories) => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return categories
  }

  return categories.map((category) => ({
    ...category,
    list: Array.isArray(category?.list)
      ? category.list.map((subCategory) => ({
          ...subCategory,
          list: Array.isArray(subCategory?.list)
            ? subCategory.list.map((tool) => {
                const normalizedUrl = normalizeToolRouteMatchKey(tool?.url)
                const preset = FIRST_PHASE_TOOL_METADATA_PRESET_MAP.get(normalizedUrl)
                if (!preset) {
                  return tool
                }
                return {
                  ...tool,
                  toolKey: String(tool?.toolKey || preset.toolKey).trim(),
                  consumePoints: Number.isFinite(Number(tool?.consumePoints))
                    ? Number(tool.consumePoints)
                    : preset.consumePoints,
                  memberFree:
                    typeof tool?.memberFree === 'boolean' ? tool.memberFree : preset.memberFree,
                  status: Number.isFinite(Number(tool?.status))
                    ? Number(tool.status)
                    : preset.status,
                  sort: Number.isFinite(Number(tool?.sort)) ? Number(tool.sort) : preset.sort,
                  remark: String(tool?.remark || preset.remark).trim()
                }
              })
            : []
        }))
      : []
  }))
}

/**
 * 函数说明：统计当前分类树里已挂上策略字段的高频工具数量，便于同步日志快速确认第一阶段是否生效。
 */
const countFirstPhaseStrategyTools = (categories) => {
  if (!Array.isArray(categories)) {
    return 0
  }
  return categories.reduce((count, category) => {
    const subCategoryList = Array.isArray(category?.list) ? category.list : []
    return (
      count +
      subCategoryList.reduce((subCount, subCategory) => {
        const toolList = Array.isArray(subCategory?.list) ? subCategory.list : []
        return (
          subCount +
          toolList.filter((tool) => {
            return Boolean(String(tool?.toolKey || '').trim()) && Number.isFinite(Number(tool?.status))
          }).length
        )
      }, 0)
    )
  }, 0)
}

/**
 * 函数说明：将 JSON 文本转为 MySQL 可安全写入的十六进制 UTF-8 字符串。
 */
const toMysqlUtf8Hex = (input) => Buffer.from(String(input), 'utf8').toString('hex')

/**
 * 函数说明：生成单个配置项的 upsert SQL，默认只补缺失/空值/乱码，force 模式可直接覆盖。
 */
const buildConfigUpsertSql = (configName, jsonValue, force = false, repairGarbled = false) => {
  const hexValue = toMysqlUtf8Hex(jsonValue)
  const conditions = [
    "TRIM(IFNULL(`value`, '')) = ''",
    "TRIM(`value`) = '[]'"
  ]

  if (repairGarbled) {
    conditions.push("`value` REGEXP '\\\\?{3,}'")
    conditions.push("`value` LIKE '%�%'")
  }

  const updateCondition = force ? '1=1' : conditions.join(' OR ')

  return [
    `UPDATE la_system_config`,
    `SET \`value\` = CONVERT(0x${hexValue} USING utf8mb4), \`update_time\` = @now_ts`,
    `WHERE \`type\` = 'website' AND \`name\` = '${configName}' AND (${updateCondition});`,
    `INSERT INTO la_system_config (\`type\`, \`name\`, \`value\`, \`create_time\`, \`update_time\`)`,
    `SELECT 'website', '${configName}', CONVERT(0x${hexValue} USING utf8mb4), @now_ts, @now_ts`,
    `WHERE NOT EXISTS (`,
    `  SELECT 1 FROM la_system_config WHERE \`type\` = 'website' AND \`name\` = '${configName}'`,
    `);`
  ].join('\n')
}

/**
 * 函数说明：组装本次同步要写入后台的前端菜单与工具分类配置。
 */
const buildSyncPayloads = async () => {
  const rawToolCategories = await loadFrontendToolCategories()
  const toolCategories = enrichToolCategoriesWithFirstPhaseMetadata(rawToolCategories)
  const sidebarBrandLogo = (await loadFrontendDefaultSidebarBrandLogo()) || DEFAULT_SIDEBAR_BRAND_LOGO
  const firstPhaseStrategyToolCount = countFirstPhaseStrategyTools(toolCategories)

  logInfo(
    `第一阶段高频工具主数据已注入 ${firstPhaseStrategyToolCount} 项，开始写入 toolsCategoryTree。`
  )

  return [
    {
      name: 'toolsSiteSlogan',
      json: DEFAULT_SITE_SLOGAN,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarBrandLogo',
      json: sidebarBrandLogo,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarBrandText',
      json: DEFAULT_SIDEBAR_BRAND_TEXT,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarRecommendTitle',
      json: DEFAULT_SIDEBAR_RECOMMEND_TITLE,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarRecommend',
      json: JSON.stringify(DEFAULT_SIDEBAR_RECOMMEND_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsSidebarCategoryMenus',
      json: JSON.stringify(DEFAULT_SIDEBAR_CATEGORY_MENUS),
      repairGarbled: true
    },
    {
      name: 'toolsSidebarMenuBlocks',
      json: JSON.stringify([]),
      repairGarbled: true
    },
    {
      name: 'toolsSidebarBottomLinks',
      json: JSON.stringify(DEFAULT_SIDEBAR_BOTTOM_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsAiToolboxSidebarMenus',
      json: JSON.stringify(DEFAULT_AI_TOOLBOX_SIDEBAR_MENUS),
      repairGarbled: true
    },
    {
      name: 'toolsHeaderLinks',
      json: JSON.stringify(DEFAULT_HEADER_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsSearchQuickTools',
      json: JSON.stringify(DEFAULT_SEARCH_QUICK_TOOLS),
      repairGarbled: true
    },
    {
      name: 'toolsSearchProviderLabel',
      json: DEFAULT_SEARCH_PROVIDER_LABEL,
      repairGarbled: true
    },
    {
      name: 'toolsSearchProviderLink',
      json: DEFAULT_SEARCH_PROVIDER_LINK,
      repairGarbled: true
    },
    {
      name: 'toolsAiChatHeaderLinks',
      json: JSON.stringify(DEFAULT_AI_CHAT_HEADER_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsAiCommonHeaderLinks',
      json: JSON.stringify(DEFAULT_AI_COMMON_HEADER_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsFooterIntro',
      json: DEFAULT_FOOTER_INTRO,
      repairGarbled: true
    },
    {
      name: 'toolsFooterQuickTitle',
      json: DEFAULT_FOOTER_QUICK_TITLE,
      repairGarbled: true
    },
    {
      name: 'toolsFooterFriendTitle',
      json: DEFAULT_FOOTER_FRIEND_TITLE,
      repairGarbled: true
    },
    {
      name: 'toolsOfficialMediaTitle',
      json: DEFAULT_OFFICIAL_MEDIA_TITLE,
      repairGarbled: true
    },
    {
      name: 'toolsFooterSupportLabel',
      json: DEFAULT_FOOTER_SUPPORT_LABEL,
      repairGarbled: true
    },
    {
      name: 'toolsFooterSupportLinks',
      json: JSON.stringify(DEFAULT_FOOTER_SUPPORT_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsFooterRecordLinks',
      json: JSON.stringify(DEFAULT_FOOTER_RECORD_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsFooterQuickSections',
      json: JSON.stringify(DEFAULT_FOOTER_QUICK_SECTIONS),
      repairGarbled: true
    },
    {
      name: 'toolsFooterFriendSections',
      json: JSON.stringify(DEFAULT_FOOTER_FRIEND_SECTIONS),
      repairGarbled: true
    },
    {
      name: 'toolsOfficialMediaLinks',
      json: JSON.stringify(DEFAULT_OFFICIAL_MEDIA_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsCategoryTree',
      json: JSON.stringify(toolCategories),
      repairGarbled: false
    }
  ]
}

/**
 * 函数说明：执行 MySQL 同步脚本，将前端默认配置写入后台配置表。
 */
const runMysqlSync = (runtimeConfig, sql) => {
  const commandArgs = [
    'compose',
    '-p',
    runtimeConfig.composeProject,
    '--env-file',
    COMPOSE_ENV_FILE,
    '-f',
    BACKEND_COMPOSE_FILE,
    'exec',
    '-T',
    '-e',
    `MYSQL_PWD=${runtimeConfig.mysqlRootPassword}`,
    'mysql',
    'mysql',
    '--default-character-set=utf8mb4',
    '-uroot',
    runtimeConfig.dbName
  ]

  return spawnSync('docker', commandArgs, {
    cwd: ROOT_DIR,
    input: sql,
    encoding: 'utf8'
  })
}

/**
 * 函数说明：从前端 Left.vue 提取默认品牌 SVG，确保后台导入的是前端同款 Logo。
 */
const loadFrontendDefaultSidebarBrandLogo = async () => {
  const sourceCode = await fs.readFile(LEFT_LAYOUT_FILE, 'utf8')
  const matched = sourceCode.match(/<svg\s+v-else[\s\S]*?<\/svg>/i)
  if (!matched?.[0]) {
    return ''
  }
  return matched[0].replace(/\s+v-else(?=[\s>])/i, '').trim()
}

/**
 * 函数说明：查询 la_system_config.value 字段类型，必要时自动扩容为 LONGTEXT。
 */
const ensureSystemConfigValueSupportsLargeJson = (runtimeConfig) => {
  const querySql = [
    'SELECT DATA_TYPE',
    'FROM information_schema.COLUMNS',
    `WHERE TABLE_SCHEMA = '${runtimeConfig.dbName}'`,
    "AND TABLE_NAME = 'la_system_config'",
    "AND COLUMN_NAME = 'value';"
  ].join(' ')

  const queryResult = runMysqlSync(runtimeConfig, `${querySql}\n`)
  if (queryResult.status !== 0) {
    logErrorAndExit(queryResult.stderr || queryResult.stdout || '查询 la_system_config.value 字段类型失败')
  }

  const dataType = String(queryResult.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .pop() || ''
  if (dataType === 'longtext') {
    return
  }

  logInfo(`检测到 la_system_config.value 当前为 ${dataType || 'unknown'}，自动扩容为 LONGTEXT...`)
  const alterResult = runMysqlSync(runtimeConfig, `${SYSTEM_CONFIG_LONGTEXT_SQL}\n`)
  if (alterResult.status !== 0) {
    logErrorAndExit(alterResult.stderr || alterResult.stdout || '扩容 la_system_config.value 失败')
  }
}

/**
 * 函数说明：主流程，读取前端默认配置并同步到后台 website 配置。
 */
const main = async () => {
  const { force } = parseArgs()
  const runtimeConfig = await loadRuntimeConfig()
  ensureSystemConfigValueSupportsLargeJson(runtimeConfig)
  const payloads = await buildSyncPayloads()

  let sql = 'SET NAMES utf8mb4;\nSET @now_ts = UNIX_TIMESTAMP();\n'
  payloads.forEach((payload) => {
    sql += `${buildConfigUpsertSql(payload.name, payload.json, force, payload.repairGarbled)}\n`
  })

  logInfo(`准备同步 ${payloads.length} 项前端默认配置到后台（db=${runtimeConfig.dbName}，force=${force ? '1' : '0'}）...`)
  const result = runMysqlSync(runtimeConfig, sql)
  if (result.status !== 0) {
    logErrorAndExit(result.stderr || result.stdout || '同步前端菜单配置失败')
  }

  logInfo('前端默认菜单、头部、页脚与工具分类树已同步到后台 website 配置。')
  payloads.forEach((payload) => {
    logInfo(`已处理配置项：${payload.name}`)
  })
}

main().catch((error) => {
  logErrorAndExit(error instanceof Error ? error.message : String(error))
})
