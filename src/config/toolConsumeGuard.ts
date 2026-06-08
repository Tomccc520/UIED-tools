/**
 * @file toolConsumeGuard.ts
 * @description 全局工具积分拦截策略配置：统一维护“动作关键词 / 误判白名单 / 手动接入路由清单”
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-31
 */

export interface ToolConsumeManualRouteItem {
  path: string
  module: string
  note: string
}

/**
 * 函数说明：全局拦截的动作关键词，命中后会走登录/积分校验。
 */
export const TOOL_CONSUME_GUARD_ACTION_KEYWORDS: string[] = [
  '开始',
  '生成',
  '压缩',
  '转换',
  '导出',
  '下载',
  '去水印',
  '抠图',
  '提取',
  '合并',
  '裁剪',
  '旋转',
  '重设',
  '录制',
  '封装',
  '开通',
  '购买',
  '支付',
  '处理'
]

/**
 * 函数说明：全局拦截的忽略关键词（交互按钮/导航按钮），命中后直接放行。
 */
export const TOOL_CONSUME_GUARD_IGNORE_KEYWORDS: string[] = [
  '取消',
  '关闭',
  '返回',
  '展开',
  '收起',
  '刷新',
  '清空',
  '重置',
  '选择',
  '上传',
  '复制',
  '粘贴',
  '预览',
  '更多',
  '上一',
  '下一',
  '登录',
  '退出'
]

/**
 * 函数说明：误判动作白名单（命中即放行），用于规避“非消耗型开始动作”的误拦截。
 */
export const TOOL_CONSUME_GUARD_FALSE_POSITIVE_WHITELIST: string[] = [
  '开始试玩',
  '开始游戏',
  '开始计时',
  '开始练习',
  '开始预览',
  '开始浏览',
  '开始查看',
  '开始学习',
  '开始输入',
  '开始编辑',
  '开始测试',
  '开始搜索'
]

/**
 * 函数说明：已手动接入 useToolConsume 的工具页清单；这些页面应跳过全局捕获层，避免重复扣分。
 */
export const TOOL_CONSUME_MANUAL_ROUTE_LIST: ToolConsumeManualRouteItem[] = [
  {
    path: '/tools/photo/background',
    module: 'photo',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/photo/transparent',
    module: 'photo',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/photo/crop',
    module: 'photo',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/photo/layout',
    module: 'photo',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/frame',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/compress',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/convert',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/resolution',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/merge',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/mute',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/gif',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/webcam',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/watermark',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/speed',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/rotate',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/crop',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/trimmer',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/video/to-audio',
    module: 'video',
    note: '页面内已手动接入处理/下载动作积分校验'
  },
  {
    path: '/tools/ai/deepseek-r1',
    module: 'ai',
    note: '会员核心工具：页面内已手动接入对话运行积分校验'
  },
  {
    path: '/tools/ai/deepseek',
    module: 'ai',
    note: '会员核心工具：页面内已手动接入对话运行积分校验'
  },
  {
    path: '/tools/ai/ocr',
    module: 'ai',
    note: '会员核心工具：页面内已手动接入识别运行积分校验'
  },
  {
    path: '/tools/ai/image-enhance',
    module: 'ai',
    note: '会员核心工具：页面内已手动接入图片处理运行积分校验'
  },
  {
    path: '/tools/ai/remove-watermark',
    module: 'ai',
    note: '会员核心工具：页面内已手动接入图片处理运行积分校验'
  },
  {
    path: '/tools/ai/work-summary',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入工作总结/年度总结运行积分校验'
  },
  {
    path: '/tools/ai/office/custom-summary',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入自定义总结运行积分校验'
  },
  {
    path: '/tools/ai/office/resume-creation',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入简历制作运行积分校验'
  },
  {
    path: '/tools/ai/office/meeting-minutes',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入会议纪要运行积分校验'
  },
  {
    path: '/tools/ai/analysis/research-report',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入研究报告运行积分校验'
  },
  {
    path: '/tools/ai/analysis/business-plan',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入商业计划书运行积分校验'
  },
  {
    path: '/tools/ai/article-generator',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入文章生成运行积分校验'
  },
  {
    path: '/tools/ai/xiaohongshu-note',
    module: 'ai-writing',
    note: '会员核心工具：页面内已手动接入小红书笔记运行积分校验'
  }
]

/**
 * 函数说明：仅导出路径数组，供全局守卫快速判断当前路由是否应跳过自动拦截。
 */
export const TOOL_CONSUME_MANUAL_ROUTE_PATHS: string[] = TOOL_CONSUME_MANUAL_ROUTE_LIST.map((item) => item.path)
