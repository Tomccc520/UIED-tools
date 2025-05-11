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
          id: 2,
          title: 'AI对话助手',
          list: [
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
              title: '图片切割',
              logo: { type: 'svg', name: 'imgCut' },
              desc: '九宫格切图工具',
              url: '/tools/img-cut',
              cate: '图片工具'
            },
            {
              id: 519,
              title: '批量添加图片水印',
              logo: { type: 'svg', name: 'imgWatermark' },
              desc: '批量给图片添加文字或图片水印',
              url: '/tools/img-watermark',
              cate: '图片工具'
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
          id: 33,
          title: '其他工具',
          list: [
            {
              id: 331,
              title: '数字转金额大写',
              logo: { type: 'svg', name: 'numberToChinese' },
              desc: '在线数字转换成人民币大写金额',
              url: '/tools/numbertochinese',
              cateId: 3,
              cate: '其他工具'
            },
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

