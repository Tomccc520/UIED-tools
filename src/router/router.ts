import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import DesignIcon from '@/components/Tools/Design/DesignIcon.vue'
import DesignImageSvg from '@/components/Tools/Design/DesignImageSvg.vue'
import XunfeiSpark from '@/components/Tools/AI/XunfeiSpark.vue'
import XiaoHongShu from '@/components/Tools/AI/XiaoHongShu.vue'
import AIPromptEditor from '@/components/Tools/AI/AIPromptEditor.vue'
import AIDesignCover from '@/components/Tools/AI/AIDesignCover.vue'
import AIOutsourceQuote from '@/components/Tools/AI/AIOutsourceQuote.vue'
import AIRanking from '@/components/Tools/AI/AIRanking.vue'
// import webinfo_ip_analysis from '../components/Tools/IPAnalysis/IPAnalysis.vue'
// import webinfo_ip_batch from '../components/Tools/IPBatch/IPBatch.vue'
// import webinfo_ip_gps from '../components/Tools/IPGPS/IPGps.vue'
import BackendTest from '../components/Tools/BackendTest/BackendTest.vue'

// 根据环境变量判断使用的 base 路径
const base = import.meta.env.PROD ? '/' : '/'

export const constantRoute = [
  //首页
  {
    path: '/',
    component: () => import('../components/Home/Home.vue'),
    name: 'home',
    meta: {
      keywords: 'tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
      description: 'tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
    }
  },
  // 更新日志
  {
    path: '/changelog',
    component: () => import('@/components/Home/Changelog.vue'),
    name: 'changelog',
    meta: {
      title: "更新日志",
      keywords: 'UIED-Tools更新日志,版本历史,功能更新',
      description: 'UIED-Tools的更新日志，记录了所有版本的功能更新和变更信息',
    }
  },
  // 图片处理工具
  {
    path: '/tools/qrcode',
    component: () => import('@/components/Tools/Qrcode/Qrcode.vue'),
    name: 'qrcode',
    meta: {
      title: "二维码生成",
      keywords: '二维码,qrcode,二维码制作,二维码生成,微信二维码',
      description: '在线生成二维码,logo二维码',
    }
  },
  {
    path: '/tools/favicon-maker',
    component: () => import('@/components/Tools/FaviconMaker/FaviconMaker.vue'),
    name: 'faviconmaker',
    meta: {
      title: "Favicon制作",
      keywords: 'favicon制作,网站图标制作,favicon.ico生成',
      description: '在线制作网站图标，支持多种尺寸和格式，可以裁剪、编辑图片并生成favicon',
    }
  },
  {
    path: '/tools/signimage',
    component: () => import('@/components/Tools/SignImage/SignImage.vue'),
    name: 'signimage',
    meta: {
      title: "在线图片处理",
      keywords: '在线图片裁剪，图片标注，图片滤镜，图片画笔、图片旋转、图片文字',
      description: '在线图片裁剪，图片标注，图片滤镜，图片画笔、图片旋转、图片文字等操作',
    }
  },
  {
    path: '/tools/texttoimg',
    component: () => import('@/components/Tools/TextToImg/TextToImg.vue'),
    name: 'textToImg',
    meta: {
      title: "文本转图片",
      keywords: '文本生成图片，文本生成长图，推广长图',
      description: '把文本转换成图片，生成长图，具有超多个性文字排版',
    }
  },
  {
    path: '/tools/image-compress',
    component: () => import('@/components/Tools/ImageCompress/ImageCompress.vue'),
    name: 'imageCompress',
    meta: {
      title: "图片压缩",
      keywords: '图片压缩,jpg压缩,png压缩',
      description: '支持JPG、PNG、GIF等格式图片压缩，最大支持10MB',
    }
  },
  {
    path: '/tools/image-crop',
    component: () => import('@/components/Tools/ImageCrop/ImageCrop.vue'),
    name: 'imageCrop',
    meta: {
      title: "图片裁剪",
      keywords: '图片裁剪,图片剪裁,图片缩放',
      description: '支持自定义尺寸裁剪图片，支持等比例缩放',
    }
  },
  {
    path: '/tools/ai/remove-watermark',
    component: () => import('@/components/Tools/AI/RemoveWatermark.vue'),
    name: 'aiRemoveWatermark',
    meta: {
      title: "AI智能去水印",
      keywords: '去水印,AI去水印,在线去水印,图片去水印,免费去水印',
      description: '免费在线AI智能去水印工具，自动识别并移除图片水印，支持JPG/PNG等格式',
    }
  },
  {
    path: '/tools/image-to-webp',
    component: () => import('@/components/Tools/ImageToWebp/ImageToWebp.vue'),
    name: 'imageToWebp',
    meta: {
      title: "图片格式转换工具",
      keywords: '图片格式转换,JPG转PNG,PNG转WebP,WebP转JPG,图片互转,图片批量转换',
      description: '免费在线图片格式转换工具，支持JPG、PNG、WebP等多种格式互相转换，批量处理高效便捷',
    }
  },
  {
    path: '/tools/gif-compress',
    component: () => import('@/components/Tools/GifCompress/GifCompress.vue'),
    name: 'gifCompress',
    meta: {
      title: "GIF压缩",
      keywords: 'gif压缩,gif动图压缩,gif体积压缩',
      description: '在线GIF动图压缩工具，支持批量压缩、调整尺寸，快速实现GIF体积压缩',
    }
  },
  {
    path: '/tools/img-cut',
    component: () => import('@/components/Tools/ImgCut/ImgCut.vue'),
    name: 'imgCut',
    meta: {
      title: "免费九宫格切图",
      keywords: '图片分割,图片切割,九宫格切图,朋友圈切图,微博切图',
      description: '专业的在线图片切割工具，支持自定义行列数的九宫格切图，支持朋友圈、微博等社交媒体配图制作',
    }
  },
  {
    path: '/tools/image-joiner',
    component: () => import('@/components/Tools/ImageJoiner/ImageJoiner.vue'),
    name: 'imageJoiner',
    meta: {
      title: "免费在线图片拼接",
      keywords: '图片拼接,长图制作,拼图工具,多图拼接',
      description: '支持多张图片横向或纵向拼接，自定义间距和背景色，制作长图神器',
    }
  },
  {
    path: '/tools/image-to-gif',
    component: () => import('@/components/Tools/ImageToGif/ImageToGif.vue'),
    name: 'imageToGif',
    meta: {
      title: "免费图片合成GIF",
      keywords: '图片转GIF,GIF合成,多图转GIF,GIF制作',
      description: '在线将多张图片合成为动态GIF，支持自定义延迟、尺寸和循环播放',
    }
  },
  {
    path: '/tools/img-watermark',
    component: () => import('@/components/Tools/ImgWatermark/ImgWatermark.vue'),
    name: 'imgWatermark',
    meta: {
      title: "批量添加图片水印",
      keywords: '图片水印,图片加水印,图片添加水印',
      description: '在线图片水印工具，支持图片添加水印',
    }
  },
  {
    path: '/tools/img-format',
    component: () => import('@/components/Tools/ImgFormat/ImgFormat.vue'),
    name: 'imgFormat',
    meta: {
      title: "图片格式转换",
      keywords: '图片格式转换,PNG转JPG,JPG转PNG',
      description: '在线图片格式转换工具，支持多种格式互转',
    }
  },
  {
    path: '/tools/img-to-pdf',
    component: () => import('@/components/Tools/ImageToPdf/ImageToPdf.vue'),
    name: 'imageToPdf',
    meta: {
      title: "图片转PDF",
      keywords: '图片转PDF,JPG转PDF,PNG转PDF',
      description: '在线图片转PDF工具，支持多张图片合并成PDF',
    }
  },
  {
    path: '/tools/pdf-to-images',
    component: () => import('@/components/Tools/PdfToImages/index.vue'),
    name: 'pdfToImages',
    meta: {
      title: "PDF转图片",
      keywords: 'PDF转图片,PDF转JPG,PDF转PNG,PDF批量导出图片',
      description: '在线PDF转图片工具，支持批量转换PDF页面为高质量图片，可自定义输出设置',
    }
  },
  {
    path: '/tools/pdf-merge',
    component: () => import('@/components/Tools/PdfMerge/index.vue'),
    name: 'pdfMerge',
    meta: {
      title: "免费在线PDF合并工具",
      keywords: 'PDF合并,PDF合并工具,在线PDF合并,免费PDF合并',
      description: '免费在线PDF合并工具，支持多个PDF文件合并，无需上传至云端，本地处理更安全。'
    }
  },
  {
    path: '/tools/pdf-split',
    component: () => import('@/components/Tools/PdfSplit/index.vue'),
    meta: {
      title: '免费在线PDF分割工具',
      keywords: 'PDF分割,PDF拆分,PDF分页,在线PDF分割,免费PDF分割',
      description: '免费在线PDF分割工具，支持将PDF拆分为单页，批量处理多个文件，本地处理更安全。'
    }
  },
  {
    path: '/tools/pdf-rotate',
    component: () => import('@/components/Tools/PdfRotate/index.vue'),
    name: 'pdfRotate',
    meta: {
      title: "PDF页面旋转",
      keywords: 'PDF旋转,PDF页面旋转,PDF文档旋转,在线PDF旋转',
      description: '在线PDF页面旋转工具，支持批量旋转、单独旋转页面，同时可调整页面顺序',
    }
  },
  {
    path: '/tools/pdf-delete',
    component: () => import('@/components/Tools/PdfDelete/index.vue'),
    name: 'pdfDelete',
    meta: {
      title: "PDF页面删除",
      keywords: 'PDF删除页面,PDF页面删除,PDF文档编辑,在线PDF删除',
      description: '在线PDF页面删除工具，支持删除指定页面，同时可调整页面顺序和旋转页面',
    }
  },
  {
    path: '/tools/pdf-compress',
    component: () => import('@/components/Tools/PdfCompress/index.vue'),
    name: 'pdfCompress',
    meta: {
      title: "免费PDF压缩工具",
      keywords: 'PDF压缩,PDF文件压缩,在线PDF压缩,免费PDF压缩',
      description: '在线压缩PDF文件大小，支持批量处理，本地压缩更安全，适合邮件发送和文件上传',
    }
  },
  //工具
  {
    path: '/tools/timetran',
    component: () => import('@/components/Tools/TimeTran/TimeTran.vue'),
    name: 'timetran',
    meta: {
      title: "时间戳转换",
      keywords: '时间,日期转换时间戳,Unix时间戳',
      description: 'Unix时间戳转换可以把Unix时间转成北京时间。',
    }
  },
  {
    path: '/tools/md5',
    component: () => import('@/components/Tools/MD5/MD5.vue'),
    name: 'md5',
    meta: {
      title: "MD5在线加密",
      keywords: 'md5加，md5在线加密，md5',
      description: '在线md5加密，一键生成md5加密字符串，可生成16位或32位md5加密字符串，md5双重加密',
    }
  },
  {
    path: '/tools/json',
    component: () => import('@/components/Tools/JsonTran/JsonTran.vue'),
    name: 'json',
    meta: {
      title: "Json在线转换",
      keywords: 'json编辑器，json格式化,json压缩,json转义,json去转义',
      description: '提供实时编辑和预览JSON数据，语法高亮、校验、格式化、转义，去转义、功能，可以提高阅读修改的效率和准确性',
    }
  },
  {
    path: '/tools/reg',
    component: () => import('@/components/Tools/RegTest/RegTest.vue'),
    name: 'reg',
    meta: {
      title: "正则表达式测试",
      keywords: '正则表达式测试工具,常用正则表达式,在线正则表达式',
      description: '正则表达式测试工具,常用正则表达式,在线正则表达式',
    }
  },
  {
    path: '/tools/unicode',
    component: () => import('@/components/Tools/Unicode/Unicode.vue'),
    name: 'unicode',
    meta: {
      title: "Unicode转中文",
      keywords: '在线Unicode编码转换，中文转Unicode，Unicode转中文',
      description: '在线Unicode编码转换，中文转Unicode，Unicode转中文，在文本框里输入要转换的内容，然后点击要转换的类型按钮，转换完成后即可看到对应的内容。..',
    }
  },
  {
    path: '/tools/wordcount',
    component: () => import('@/components/Tools/WordCount/WordCount.vue'),
    name: 'wordcount',
    meta: {
      title: "在线字数统计",
      keywords: '在线字数计算器,计算字数,在线字数统计器,字数计数器',
      description: '在线字数计数器,主要是方便计算字数，以控制文字数量的小工具(小说作者、论文、文档、文字编辑必备工具)。',
    }
  },
  {
    path: '/tools/ip',
    component: () => import('@/components/Tools/Ip/Ip.vue'),
    name: 'ip',
    meta: {
      title: "IP查询",
      keywords: 'ip,ip查询,ip地址查询,ip138,查ip,我的ip,公网ip,ip归属地查询',
      description: '公网ip地址归属地查询',
    }
  },
  {
    path: '/tools/scaletran',
    component: () => import('@/components/Tools/ScaleTran/ScaleTran.vue'),
    name: 'scaletran',
    meta: {
      title: "常用进制转换",
      keywords: '进制转换,进制转换工具,10进制转2进制,2进制转10进制,10进制转62进制,62进制转10制',
      description: '常用进制转换工具，支持32进制以上进制转换',
    }
  },
  {
    path: '/tools/randompassword',
    component: () => import('@/components/Tools/RandomPassword/RandomPassword.vue'),
    name: 'randompassword',
    meta: {
      title: "随机密码生成",
      keywords: '在线生成随机密码，批量生成随机密码，密码生成',
      description: '在线随机密码生成',
    }
  },
  {
    path: '/tools/urlencode',
    component: () => import('@/components/Tools/UrlEncode/UrlEncode.vue'),
    name: 'urlencode',
    meta: {
      title: "URL编码/解码",
      keywords: 'URL编码,URL解码,UrlEncode,UrlDecode',
      description: 'URL在线编码解码工具，支持UrlEncode编码和UrlDecode解码',
    }
  },
  {
    path: '/tools/ascii',
    component: () => import('@/components/Tools/ASCII/ASCII.vue'),
    name: 'ascii',
    meta: {
      title: "ASCII码表",
      keywords: 'ascii，ascii码,ascii对照表，ascii控制符，ascii打印字符，ascii扩展',
      description: 'ascii全面对照表，包含制字符，打印字符，扩展码',
    }
  },
  {
    path: '/tools/uuid',
    component: () => import('@/components/Tools/UUID/UUID.vue'),
    name: 'uuid',
    meta: {
      title: "UUID生成器",
      keywords: 'UUID生成,UUID生成器,GUID生成器',
      description: '在线UUID生成工具，支持批量生成UUID',
    }
  },
  {
    path: '/tools/barrage',
    component: () => import('@/components/Tools/Barrage/Barrage.vue'),
    name: 'barrage',
    meta: {
      title: "手持弹幕",
      keywords: '手持弹幕，弹幕工具',
      description: '手持弹幕是一种新型的互动沟通工具，可以方便地为各种户外活动、演出嘉年华等活动增加趣味性和互动性。手持弹幕具有轻便、易携带、易操作等优点，可以让每个参与者都变成活动的一部分。同时，手持弹幕还可以通过预先编写的文本、表情等形式，表达参与者的情感和想法，实现沟通互动。社交媒时,持弹幕的使用也带了更广泛的社交效应增加了活动的互动性和传播度。无论是举办方还是与者，手持弹幕都是一个非常有价值的互动工具。',
    }
  },
  {
    path: '/tools/palettes',
    component: () => import('@/components/Tools/Palettes/Palettes.vue'),
    name: 'palettes',
    meta: {
      title: "色板",
      keywords: '色板，颜色板',
      description: '在线复制颜色，好看的颜色组合色板',
    }
  },
  {
    path: '/tools/unit',
    component: () => import('@/components/Tools/Unit/Unit.vue'),
    name: 'unit',
    meta: {
      title: "单位转换",
      keywords: '在线单位换算,长度单位换算,面积单位换算,时间单位换算,重量单位换算,温度单位换算,压力单位换算,热量单位换算,功率单位换算。',
      description: '在线单位换算,长度单位换算,面积单位换算,时间单位换算,重量单位换算,温度单位换算,压力单位换算,热量单位换算,功率单位换算。',
    }
  },
  {
    path: '/tools/decision',
    component: () => import('@/components/Tools/Decision/Decision.vue'),
    name: 'decision',
    meta: {
      title: "帮我决定",
      keywords: '选择困难，难以决定，今天吃什么，现在做什么，自定义选项都给你安排的明明白白',
      description: '选择困难症，自定义选择内容',
    }
  },
  {
    path: '/tools/random',
    component: () => import('@/components/Tools/Random/Random.vue'),
    name: 'random',
    meta: {
      title: "生成随机数",
      keywords: '随机数生成,随机数',
      description: '可定制范围内进行随机数字，可用于抽奖、点名等用途',
    }
  },
  {
    path: '/tools/coin',
    component: () => import('@/components/Tools/Coin/Coin.vue'),
    name: 'coin',
    meta: {
      title: "抛硬币",
      keywords: '抛硬币,硬币',
      description: '在线抛硬币，选择困难那么交给硬币来帮你选择吧',
    }
  },
  {
    path: '/tools/dice',
    component: () => import('@/components/Tools/Dice/Dice.vue'),
    name: 'dice',
    meta: {
      title: "投骰子",
      keywords: '投骰子,骰子,自定义骰子',
      description: '在线投骰子，可自定义骰子数量，简单好用的骰子工具',
    }
  },
  {
    path: '/tools/avatar/random',
    component: () => import('@/components/Tools/Avatar/RandomAvatar.vue'),
    name: 'randomAvatar',
    meta: {
      title: "随机头像",
      keywords: '随机头像,头像生成,在线头像生成,头像工具',
      description: '在线随机头像生成工具，每次都能获取一个独特的头像，支持一键下载',
    }
  },
  {
    path: '/tools/textremoveduplicate',
    component: () => import('@/components/Tools/TextRemoveDuplicate/TextRemoveDuplicate.vue'),
    name: 'textremoveduplicate',
    meta: {
      title: "文本去重",
      keywords: '文本去重,文本排重，文本去除重复',
      description: '可以删除或去除文本或字符串重复行',
    }
  },
  {
    path: '/tools/httpstatuscode',
    component: () => import('@/components/Tools/HttpStatusCode/HttpStatusCode.vue'),
    name: 'httpstatuscode',
    meta: {
      title: "HTTP状态码",
      keywords: 'http状态码',
      description: '所有http状态对应的名称和含义解释',
    }
  },
  {
    path: '/tools/jwt',
    component: () => import('@/components/Tools/JWT/JWT.vue'),
    name: 'jwt',
    meta: {
      title: "JWT解析",
      keywords: 'jwt解析,jwt解码，JSON Web Token解析',
      description: '解析和解码JSON Web Token（jwt）',
    }
  },
  {
    path: '/tools/htmlentity',
    component: () => import('@/components/Tools/HtmlEntity/HtmlEntity.vue'),
    name: 'htmlentity',
    meta: {
      title: "html实体转义",
      keywords: 'html实体转义',
      description: 'html实体转义，实体转义成html',
    }
  },
  {
    path: '/tools/colorpicker',
    component: () => import('@/components/Tools/ColorPicker/ColorPicker.vue'),
    name: 'colorpicker',
    meta: {
      title: "颜色选择器",
      keywords: '颜色选择器,Color选择器',
      description: '颜色选择、在各种颜色空如十六进制、rgb、hsl、css等等之间转换颜色',
    }
  },
  {
    path: '/tools/asciiwordpic',
    component: () => import('@/components/Tools/ASCIIWordPic/ASCIIWordPic.vue'),
    name: 'asciiwordpic',
    meta: {
      title: "ASCII字形生成器",
      keywords: 'ASCII画,字形画,字形生成器',
      description: '在线生成字形ASCII画',
    }
  },
  {
    path: '/tools/htmlformat',
    component: () => import('@/components/Tools/HtmlFormat/HtmlFormat.vue'),
    name: 'htmlformat',
    meta: {
      title: "html代码格式化",
      keywords: 'html格式化,xml格式化',
      description: '提供在线html、xml格式化',
    }
  },
  {
    path: '/tools/cssformat',
    component: () => import('@/components/Tools/CssFormat/CssFormat.vue'),
    name: 'cssformat',
    meta: {
      title: "css代码格式化/压缩",
      keywords: 'css格式化,css压缩',
      description: '提供在线css格式化,在线css压缩工具',
    }
  },
  {
    path: '/tools/textedit',
    component: () => import('@/components/Tools/TextEdit/TextEdit.vue'),
    name: 'textedit',
    meta: {
      title: "在线文本编辑/HTML获取",
      keywords: '文本编辑，富文本预览，在线编辑文本，文本编辑获取html',
      description: '在线富文本编辑, html实时预览，在线编辑文本，文本编辑获取html',
    }
  },
  {
    path: '/tools/bar',
    component: () => import('@/components/Tools/Chart/Bar/Bar.vue'),
    name: 'bar',
    meta: {
      title: "柱状图生成器",
      keywords: '柱状图生成,柱状图制作,数据可视化',
      description: '在线柱状图生成工具，支持自定义样式和数据导入',
    }
  },
  {
    path: '/tools/line',
    component: () => import('@/components/Tools/Chart/Line/Line.vue'),
    name: 'line',
    meta: {
      title: "折线图生成器",
      keywords: '折线图生成,折线图制作,数据可视化',
      description: '在线折线图生成工具，支持自定义样式和数据导入',
    }
  },
  {
    path: '/tools/pie',
    component: () => import('@/components/Tools/Chart/Pie/Pie.vue'),
    name: 'pie',
    meta: {
      title: "饼图生成器",
      keywords: '饼图生成,饼图制作,数据可视化',
      description: '在线饼图生成工具，支持自定义样式和数据导入',
    }
  },
  {
    path: '/tools/scatter',
    component: () => import('@/components/Tools/Chart/Scatter/Scatter.vue'),
    name: 'scatter',
    meta: {
      title: "散点图生成器",
      keywords: '散点图生成,散点图制作,数据可视化',
      description: '在线散点图生成工具，支持自定义样式和数据导入',
    }
  },
  {
    path: '/tools/diff',
    component: () => import('@/components/Tools/Diff/Diff.vue'),
    name: 'diff',
    meta: {
      title: "文本差异对比",
      keywords: '文本对比,代码对比,差异对比',
      description: '在线文本差异对比工具，支持代码对比和文本对比',
    }
  },
  {
    path: '/tools/markdown',
    component: () => import('@/components/Tools/Markdown/Markdown.vue'),
    name: 'markdown',
    meta: {
      title: "Markdown编辑器",
      keywords: 'Markdown编辑器,Markdown预览,Markdown转换',
      description: '在线Markdown编辑器，支持实时预览和导出',
    }
  },
  // 潜能测试路由
  {
    path: '/tools/psychology/mbti',
    component: () => import('@/components/Tools/Psychology/MBTI.vue'),
    name: 'mbti',
    meta: {
      title: "MBTI职业性格测试（简洁版）",
      keywords: 'MBTI,性格测试,职业规划,16型人格',
      description: 'MBTI职业性格测试简洁版，快速了解你的性格类型和职业倾向',
    }
  },
  {
    path: '/tools/psychology/enneagram',
    component: () => import('@/components/Tools/Psychology/Enneagram.vue'),
    name: 'enneagram',
    meta: {
      title: "九型人格测试（简洁版）",
      keywords: '九型人格,性格分析,心理测试',
      description: '九型人格测试简洁版，探索你的核心性格型号',
    }
  },
  {
    path: '/tools/psychology/big-five',
    component: () => import('@/components/Tools/Psychology/BigFive.vue'),
    name: 'bigfive',
    meta: {
      title: "大五人格测试（简洁版）",
      keywords: '大五人格,OCEAN,性格维度,心理评估',
      description: '大五人格测试简洁版，从五个维度全面分析你的性格特征',
    }
  },
  {
    path: '/tools/psychology/abo',
    component: () => import('@/components/Tools/Psychology/ABO.vue'),
    name: 'abo',
    meta: {
      title: "ABO心理性别测试",
      keywords: 'ABO测试,心理性别,趣味测试',
      description: '趣味ABO心理性别测试，看看你是Alpha、Beta还是Omega',
    }
  },
  {
    path: '/tools/psychology/programmer-test',
    component: () => import('@/components/Tools/Psychology/ProgrammerTest.vue'),
    name: 'programmerTest',
    meta: {
      title: "程序员vs设计师潜能测试",
      keywords: '程序员测试,设计师测试,职业潜能,左右脑测试',
      description: '测试你的思维更偏向逻辑严密的程序员，还是感性创意的设计师',
    }
  },
  {
    path: '/tools/psychology/left-right-brain',
    component: () => import('@/components/Tools/Psychology/LeftRightBrain.vue'),
    name: 'leftRightBrain',
    meta: {
      title: "左右脑优势测试",
      keywords: '左右脑测试,大脑优势,思维偏好,心理测试',
      description: '测试你的大脑优势区域，是左脑逻辑型还是右脑创造型',
    }
  },
  {
    path: '/tools/psychology/eq-test',
    component: () => import('@/components/Tools/Psychology/EQTest.vue'),
    name: 'eqTest',
    meta: {
      title: "EQ情商测试（简洁版）",
      keywords: 'EQ测试,情商测试,情绪智力,心理测试',
      description: '测试你的情商水平，了解你的情绪管理和人际交往能力',
    }
  },
  {
    path: '/tools/psychology/eq-test',
    component: () => import('@/components/Tools/Psychology/EQTest.vue'),
    name: 'eqTest',
    meta: {
      title: "国际标准情商(EQ)测试",
      keywords: 'EQ测试,情商测试,情绪管理,社交能力',
      description: '评估你的情绪感知、控制和社交能力，了解你的情商水平',
    }
  },
  {
    path: '/tools/psychology/left-right-brain',
    component: () => import('@/components/Tools/Psychology/LeftRightBrain.vue'),
    name: 'leftRightBrain',
    meta: {
      title: "左右脑优势测试",
      keywords: '左右脑测试,大脑优势,思维偏好,逻辑与直觉',
      description: '了解你是理性逻辑的左脑型，还是感性创意的右脑型',
    }
  },
  {
    path: '/tools/morse',
    component: () => import('@/components/Tools/Morse/Morse.vue'),
    name: 'morse',
    meta: {
      title: "摩斯密码转换",
      keywords: '摩斯密码,摩斯电码,摩斯密码转换',
      description: '在线摩斯密码转换工具，支持中英文转换',
    }
  },
  {
    path: '/tools/numbertochinese',
    component: () => import('@/components/Tools/NumberToChinese/NumberToChinese.vue'),
    name: 'numbertochinese',
    meta: {
      title: "数字转中文",
      keywords: '数字转中文,中文数字转换,大写数字',
      description: '在线数字转中文工具，支持金额大写转换',
    }
  },
  // 文案工具
  {
    path: '/tools/copywriting/design-quotes',
    component: () => import('@/components/Tools/Copywriting/DesignQuotes.vue'),
    name: 'designQuotes',
    meta: {
      title: "设计一言",
      keywords: '设计一言,设计语录,设计名言,设计思维',
      description: '随机生成富有启发性的设计名言和语录',
    }
  },
  {
    path: '/tools/copywriting/love-apartment',
    component: () => import('@/components/Tools/Copywriting/LoveApartment.vue'),
    name: 'loveApartment',
    meta: {
      title: "爱情公寓一言",
      keywords: '爱情公寓台词,爱情公寓经典台词,爱情公寓语录,爱情公寓名言',
      description: '每次都能获取一条爱情公寓经典台词，重温青春记忆',
    }
  },
  {
    path: '/tools/copywriting/kfc',
    component: () => import('@/components/Tools/Copywriting/kfc.vue'),
    name: 'copywritingKFC',
    meta: {
      title: "肯德基疯狂星期四文案",
      keywords: 'KFC文案,疯狂星期四,肯德基文案',
      description: '随机生成肯德基疯狂星期四文案',
    }
  },
  {
    path: '/tools/copywriting/funny',
    component: () => import('@/components/Tools/Copywriting/Funny.vue'),
    name: 'copywritingFunny',
    meta: {
      title: "随机搞笑文案",
      keywords: '搞笑文案,段子,趣味文案',
      description: '随机生成搞笑段子和趣味文案',
    }
  },
  {
    path: '/tools/copywriting/dog-diary',
    component: () => import('@/components/Tools/Copywriting/DogDiary.vue'),
    name: 'dogDiary',
    meta: {
      title: "舔狗日记",
      keywords: '舔狗日记,舔狗语录,舔狗文案,随机舔狗日记',
      description: '每次都能获取一篇有趣的舔狗日记，让你的生活充满欢乐',
    }
  },
  {
    path: '/tools/copywriting/emotional-quotes',
    component: () => import('@/components/Tools/Copywriting/EmotionalQuotes.vue'),
    name: 'emotionalQuotes',
    meta: {
      title: "随机一言",
      keywords: '随机一言,随机语录,随机语录',
      description: '每天为你送上一句随机语录',
    }
  },
  {
    path: '/tools/copywriting/daily-poem',
    component: () => import('@/components/Tools/Copywriting/DailyPoem.vue'),
    name: 'dailyPoem',
    meta: {
      title: "今日诗词",
      keywords: '今日诗词,古诗词,诗词欣赏,每日诗词',
      description: '每天为你送上一首精选古诗词，感受传统文化的魅力',
    }
  },
  {
    path: '/tools/copywriting/moments',
    component: () => import('@/components/Tools/Copywriting/MomentsQuotes.vue'),
    name: 'momentsQuotes',
    meta: {
      title: "朋友圈一言",
      keywords: '朋友圈文案,朋友圈一言,朋友圈文字,朋友圈说说',
      description: '每次都能获取一条走心的朋友圈文案，让你的朋友圈更有趣',
    }
  },
  {
    path: '/tools/copywriting/inspiring',
    component: () => import('@/components/Tools/Copywriting/InspiringQuotes.vue'),
    name: 'inspiringQuotes',
    meta: {
      title: "励志一言",
      keywords: '励志一言,励志语录,励志文案,正能量语录',
      description: '每次都能获取一句激励人心的话语，让你充满正能量',
    }
  },
  {
    path: '/tools/copywriting/cloud-music',
    component: () => import('@/components/Tools/Copywriting/CloudMusicComments.vue'),
    meta: {
      title: '网易云热评生成器',
      keywords: '网易云热评,音乐热评,网易云音乐,热门评论',
      description: '每次都能获取一条走心的网易云热评，感受音乐中的共鸣。'
    }
  },
  {
    path: '/tools/copywriting/comfort',
    component: () => import('@/components/Tools/Copywriting/ComfortQuotes.vue'),
    name: 'comfortQuotes',
    meta: {
      title: "暖心安慰",
      keywords: '暖心文案,安慰文案,心灵鸡汤,治愈文案',
      description: '每次都能获取一句暖心的安慰话语，给你温暖的力量',
    }
  },
  {
    path: '/tools/copywriting/poison-soup',
    component: () => import('@/components/Tools/Copywriting/PoisonSoup.vue'),
    name: 'poisonSoup',
    meta: {
      title: "毒鸡汤",
      keywords: '毒鸡汤,扎心语录,社会语录,心灵毒鸡汤',
      description: '每次都能获取一句扎心的毒鸡汤，让你笑中带泪',
    }
  },
  {
    path: '/tools/copywriting/newyear',
    component: () => import('@/components/Tools/Copywriting/NewYear.vue'),
    meta: {
      title: '新年朋友圈文案生成器',
      keywords: '新年文案,新年祝福,朋友圈文案,新年快乐,AI文案',
      description: '使用 DeepSeek AI 生成走心的新年朋友圈文案，让你的新年祝福与众不同。'
    }
  },
  {
    path: '/tools/ai/prompt-reverse',
    component: () => import('@/components/Tools/AI/PromptReverse.vue'),
    name: 'promptReverse',
    meta: {
      title: "免费图片提示词反推",
      keywords: '提示词反推,图片转提示词,AI提示词生成,Flux提示词,Midjourney提示词',
      description: '上传图片智能反推提示词，支持Flux、Stable Diffusion、Midjourney等多种模型，一键生成精准提示词',
    }
  },
  {
    path: '/tools/ai/text-to-speech',
    component: () => import('@/components/Tools/AI/TextToSpeech.vue'),
    name: 'textToSpeech',
    meta: {
      title: "免费在线文本配音",
      keywords: '文本转语音,在线配音,AI配音,文字转语音,免费配音工具',
      description: '免费在线文本转语音工具，支持多种角色和情感风格，一键生成自然流畅的语音配音',
    }
  },
  // 关于
  {
    path: '/about',
    component: () => import('@/components/Home/About.vue'),
    name: 'about',
    meta: {
      title: "关于",
      keywords: '关于ranblogs,关于工具站',
      description: '',
    }
  },
  //其他路由
  {
    path: '/404',
    component: () => import('@/components/404/404.vue'),
    name: '404',
    meta: {
      title: "404"
    }
  },
  {
    //重定向
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'Any'
  },
  {
    path: '/tools/random-tools',
    component: () => import('@/components/Tools/RandomTools/RandomTools.vue'),
    name: 'randomTools',
    meta: {
      title: '随机工具推荐',
      keywords: '随机工具,工具推荐,在线工具'
    }
  },
  // 头像工具路由
  {
    path: '/tools/avatar/anime',
    component: () => import('@/components/Tools/Avatar/AnimeAvatar.vue'),
    name: 'animeAvatar',
    meta: {
      title: "动漫头像转换",
      keywords: '动漫头像,AI转换,头像生成,动漫风格',
      description: 'AI将您的照片转换为动漫风格头像，支持一键转换和下载',
    }
  },
  {
    path: '/tools/avatar/rua',
    component: () => import('@/components/Tools/Avatar/RuaAvatar.vue'),
    name: 'ruaAvatar',
    meta: {
      title: '摸头GIF生成器',
      keywords: '摸头GIF,头像生成,动图制作,QQ头像',
      description: '上传头像或输入QQ号，一键生成可爱的摸头GIF图片，支持JPG/PNG格式',
    }
  },
  {
    path: '/tools/avatar/national-day',
    component: () => import('@/components/Tools/Avatar/NationalDayAvatar.vue'),
    name: 'nationalDayAvatar',
    meta: {
      title: '国庆专属头像',
      keywords: '国庆头像,国庆专属头像,头像生成,国庆装饰,节日头像',
      description: '为您的头像添加国庆元素，支持多种国庆帽子和装饰，生成专属国庆头像',
    }
  },
  // 设计工具路由
  {
    path: '/tools/design/DesignQuote',
    component: () => import('@/components/Tools/Design/DesignQuote.vue'),
    name: 'designQuote',
    meta: {
      title: "设计报价单生成器",
      keywords: '设计报价,报价单生成,设计报价单,在线报价',
      description: '快速生成专业的设计报价单，支持多种模板和自定义选项',
    }
  },
  {
    path: '/tools/design/color',
    component: () => import('@/components/Tools/Design/Color.vue'),
    name: 'colorPalette',
    meta: {
      title: "配色方案生成器",
      keywords: '配色方案,色彩搭配,配色生成,设计配色',
      description: '智能生成配色方案，支持多种配色风格和场景',
    }
  },
  {
    path: '/tools/design/font',
    component: () => import('@/components/Tools/Design/Font.vue'),
    name: 'fontMatch',
    meta: {
      title: "字体搭配助手",
      keywords: '字体搭配,字体推荐,中英文字体,字体预览',
      description: '智能推荐中英文字体搭配方案，提供字体预览',
    }
  },
  {
    path: '/tools/design/ui-spec',
    component: () => import('@/components/Tools/Design/UiSpec.vue'),
    name: 'uiSpec',
    meta: {
      title: "屏幕尺寸大全",
      keywords: '手机屏幕尺寸,iPhone屏幕参数,Android屏幕尺寸,设备分辨率,PPI,屏幕密度,UI设计规范,设备适配',
      description: '提供全面的手机屏幕尺寸参数查询',
    }
  },
  {
    path: '/tools/design/logo-spec',
    component: () => import('@/components/Tools/Design/LogoSpec.vue'),
    name: 'logoSpec',
    meta: {
      title: "Logo设计规范生成器",
      keywords: 'Logo设计规范,品牌Logo规范,Logo使用指南,Logo设计指南',
      description: '在线生成专业的Logo设计规范说明书，包含使用场景和注意事项，帮助品牌建立统一的视觉形象。',
    }
  },
  {
    path: '/tools/design/brand-spec',
    component: () => import('@/components/Tools/Design/BrandSpec.vue'),
    name: 'brandSpec',
    meta: {
      title: "品牌设计规范生成器",
      keywords: '品牌设计规范,VI设计规范,品牌视觉规范,品牌识别系统',
      description: '在线生成完整的品牌设计规范手册，包含VI系统和应用场景，帮助企业建立专业的品牌形象。',
    }
  },
  /* 未开发功能-设计合同生成器
  {
    path: '/tools/design/contract',
    component: () => import('@/components/Tools/Design/DesignContract/index.vue'),
    name: 'designContract',
    meta: {
      title: "设计合同生成器",
      keywords: '设计合同,合同生成,设计协议,合同模板',
      description: '快速生成设计项目合同，包含条款和版权说明',
    }
  },
  */
  {
    path: '/tools/design/spec',
    name: 'DesignSpec',
    component: () => import('@/components/Tools/Design/DesignSpec.vue'),
    meta: {
      title: '设计尺寸规范 - iOS/Android 设计规范查询工具',
      keywords: 'iOS设计规范,Android设计规范,移动端设计规范,UI设计规范,设计尺寸,字体规范,图标规范',
      description: '提供 iOS 和 Android 平台的设计规范参考，包括字体、图标、分辨率等详细参数。帮助设计师和开发者快速了解不同平台的设计要求。'
    }
  },
  {
    path: '/tools/design/grid',
    name: 'grid',
    component: () => import('@/components/Tools/Design/Grid.vue'),
    meta: {
      title: '栅格计算器',
      keywords: '栅格计算,网格系统,栅格布局,响应式布局,网页布局',
      description: '在线栅格计算工具，帮助设计师和开发者快速计算和预览网页栅格布局系统，支持自定义列数、间距等参数。'
    }
  },
  {
    path: '/tools/design/icon',
    component: DesignIcon,
    name: 'designIcon',
    meta: {
      title: '免费图标下载-设计师图标工具，提供常用设计图标下载',
      keywords: '图标下载,免费图标,svg图标,ui图标,设计图标,矢量图标,图标素材,图标库',
      description: '免费提供上千个高质量的设计图标资源，包括UI设计、网页设计等多种风格图标，支持SVG矢量格式下载',
    }
  },
  {
    path: '/tools/design/image-svg',
    component: DesignImageSvg,
    name: 'designImageSvg',
    meta: {
      title: '免费图片转SVG工具-快速将JPG/PNG转换为矢量图形',
      keywords: '免费图片转SVG,JPG转SVG,PNG转SVG,免费转换工具,在线SVG生成,位图转矢量图,矢量图转换器',
      description: '完全免费的在线图片转SVG工具，轻松将JPG、PNG、GIF等图片转换为SVG矢量图形，提供多种参数调整，生成高质量SVG图像，无需安装软件',
    }
  },
  {
    path: '/tools/design/icon-generator',
    name: 'IconGenerator',
    component: () => import('@/components/Tools/Design/IconGenerator.vue'),
    meta: {
      title: '应用图标生成器 - 一键生成所有尺寸的应用图标',
      keywords: '应用图标生成器,App图标,iOS图标,Android图标,Web App图标,图标生成工具',
      description: '一键生成 iOS、Android 和 Web App 所需的各种尺寸应用图标。支持自定义圆角、实时预览，并进行图标优化。'
    }
  },
  {
    path: '/tools/wallpaper/anime',
    component: () => import('@/components/Tools/Wallpaper/AnimeWallpaper.vue'),
    name: 'animeWallpaper',
    meta: {
      title: "随机动漫壁纸",
      keywords: '随机动漫壁纸,二次元壁纸,动漫图片,高清壁纸',
      description: '在线获取高质量随机动漫壁纸，支持多种分辨率，每次刷新都能获取新的壁纸',
    }
  },
  {
    path: '/tools/emoji/cheshire',
    component: () => import('@/components/Tools/Emoji/CheshireEmoji.vue'),
    name: 'cheshireEmoji',
    meta: {
      title: '随机柴郡表情包',
      keywords: '随机柴郡表情包,柴郡猫表情包,可爱表情包,聊天表情',
      description: '随机获取可爱的柴郡猫表情包，适合日常聊天使用，支持一键下载和收藏'
    }
  },
  {
    path: '/tools/emoji/random',
    component: () => import('@/components/Tools/Emoji/RandomEmoji.vue'),
    name: 'randomEmoji',
    meta: {
      title: "随机表情包",
      keywords: '随机表情包,表情包下载,热门表情包',
      description: '在线随机获取热门表情包，支持一键下载，永不重复',
    }
  },
  {
    path: '/tools/emoji-maker',
    component: () => import('@/components/Tools/Emoji/EmojiMaker.vue'),
    name: 'emojiMaker',
    meta: {
      title: "表情包制作",
      keywords: '表情包制作,表情包生成,表情包编辑,在线制作表情包',
      description: '在线表情包制作工具，支持添加文字、调整样式，一键导出',
    }
  },
  {
    path: '/tools/hot-ranking',
    name: 'HotRanking',
    component: () => import('@/components/Tools/HotRanking/HotRanking.vue'),
    meta: {
      title: '每日热榜',
      keywords: '热榜,热搜,热点,实时热榜,今日热榜',
      description: '汇聚全网热点，实时更新各大平台热榜内容',
      hideToolsRecommend: true  // 禁用工具推荐
    }
  },
  {
    path: '/tools/horoscope',
    component: () => import('@/components/Tools/Horoscope/Horoscope.vue'),
    name: 'horoscope',
    meta: {
      title: "星座运势",
      keywords: '星座运势,十二星座,每日运势,星座运程,星座占卜',
      description: '查看十二星座每日运势，包含爱情、事业、财运等信息，让你的每一天都充满希望',
    }
  },
  {
    path: '/tools/photo/background',
    component: () => import('@/components/Tools/Photo/PhotoBackground.vue'),
    name: 'photoBackground',
    meta: {
      title: "免费证件照换底色工具",
      keywords: '证件照换底色,证件照制作,证件照在线处理,证件照背景颜色,证件照换色',
      description: '一键智能更换证件照背景颜色，支持白底、红底、蓝底等多种规格，本地处理更安全。',
    }
  },
  {
    path: '/tools/photo/transparent',
    component: () => import('@/components/Tools/Photo/PhotoTransparent.vue'),
    name: 'photoTransparent',
    meta: {
      title: "证件照免冠处理工具",
      keywords: '证件照免冠,证件照抠图,证件照透明背景,证件照PNG,证件照处理',
      description: '智能生成标准PNG透明证件照，支持多种证件类型，本地处理更安全。',
    }
  },
  {
    path: '/tools/photo/crop',
    component: () => import('@/components/Tools/Photo/PhotoCrop.vue'),
    name: 'photoCrop',
    meta: {
      title: "证件照尺寸裁剪工具",
      keywords: '证件照裁剪,证件照尺寸,证件照规格,证件照在线裁剪,证件照调整',
      description: '一键裁剪生成各种规格的证件照，支持护照、签证、身份证等多种标准。',
    }
  },
  {
    path: '/tools/photo/layout',
    component: () => import('@/components/Tools/Photo/PhotoLayout.vue'),
    name: 'photoLayout',
    meta: {
      title: "证件照排版打印工具",
      keywords: '证件照排版,证件照打印,证件照组合,证件照拼版,证件照节省',
      description: '在线证件照排版工具，支持多种尺寸组合排版，一键打印节省相纸。',
    }
  },
  {
    path: '/tools/ai/deepseek',
    component: () => import('@/components/Tools/AI/DeepSeek.vue'),
    name: 'deepseek',
    meta: {
      title: "DeepSeek AI对话",
      keywords: 'DeepSeek对话,AI对话助手,智能对话,AI助手,DeepSeek Chat',
      description: '基于最新DeepSeekChat API的智能对话工具，支持上下文记忆，让AI对话更智能、更流畅',
    }
  },
  {
    path: '/tools/ai/image-enhance',
    name: 'ImageEnhance',
    component: () => import('@/components/Tools/AI/ImageEnhance.vue'),
    meta: {
      title: 'AI图片变清晰 - 在线图片清晰度提升工具'
    }
  },
  {
    path: '/tools/ai/stable-diffusion',
    component: () => import('@/components/Tools/AI/StableDiffusion.vue'),
    name: 'stableDiffusion',
    meta: {
      title: 'StableDiffusion AI绘画 - AI文生图工具',
      keywords: 'StableDiffusion,AI绘画,AI作图,文生图,AI艺术创作',
      description: '使用StableDiffusion AI技术，将文字描述转换为精美图片，支持多种尺寸和风格。'
    }
  },
  {
    path: '/tools/ai/qrcode',
    component: () => import('@/components/Tools/AI/AIQRCode.vue'),
    name: 'aiQrcode',
    meta: {
      title: 'AI艺术二维码生成 - 在线二维码美化工具',
      keywords: 'AI二维码,艺术二维码,二维码美化,二维码生成,AI艺术',
      description: '使用AI技术将普通二维码转换为艺术作品，支持多种场景和风格，生成可靠美观的二维码。'
    }
  },
  {
    path: '/tools/ai/ocr',
    component: () => import('@/components/Tools/AI/OCRRecognition.vue'),
    name: 'ocrRecognition',
    meta: {
      title: "OCR图像文字识别",
      keywords: 'OCR识别,图片文字识别,文字提取,多语言识别,在线OCR',
      description: '在线OCR图像文字识别工具，支持多语言文字识别，快速提取图片中的文字内容。本地处理更安全，适用于文档扫描、证件识别等场景。',
    }
  },
  {
    path: '/tools/ai/deepseek-r1',
    component: () => import('@/components/Tools/AI/DeepSeekR1.vue'),
    name: 'deepseekR1',
    meta: {
      title: "DeepSeek R1 对话",
      keywords: 'AI对话,DeepSeek R1,智能助手,AI助手,人工智能对话',
      description: '基于硅基流动大模型平台的 DeepSeek-R1 模型，支持上下文记忆，最大输出长度8192 tokens',
    }
  },
  {
    path: '/tools/ai/xunfei-spark',
    name: 'xunfeiSpark',
    component: () => import('@/components/Tools/AI/XunfeiSpark.vue'),
    meta: {
      title: '讯飞星火 Lite1.5 AI对话',
      keywords: '讯飞星火,AI对话,智能助手,自然语言处理,多轮对话',
      description: '基于讯飞星火认知大模型的智能对话工具，支持多轮对话，提供自然流畅的对话体验。'
    }
  },
  {
    path: '/tools/ai/icon-generator',
    component: () => import('@/components/Tools/AI/AIIconGenerator.vue'),
    name: 'aiIconGenerator',
    meta: {
      title: 'AI矢量图标生成器',
      keywords: 'AI图标,矢量图标,SVG图标,图标生成,AI设计',
      description: '使用DeepSeek AI生成高质量的矢量图标，支持多种风格和格式，快速创建专业图标。'
    }
  },
  {
    path: '/tools/xiaohongshu',
    component: () => import('@/components/Tools/AI/XiaoHongShu.vue'),
    name: 'xiaohongshu',
    meta: {
      title: "小红书风格图片生成",
      keywords: '小红书图片,笔记图片生成,图文排版,自动生成图片',
      description: '一键生成小红书风格的图片，支持自定义内容和样式，快速美化你的图文笔记',
    }
  },
  {
    path: '/tools/ai/chat',
    component: () => import('@/components/Tools/AI/AIChat.vue'),
    name: 'aiChat',
    meta: {
      title: "免费AI聚合聊天 - 多模型智能对话助手",
      keywords: 'AI聊天,免费AI,聚合聊天,DeepSeek,GPT,智能对话,AI助手',
      description: '免费在线AI聚合聊天工具，支持DeepSeek、GPT等多种大模型，提供智能对话、代码编写、创意写作等功能。基于Ant Design X风格设计。',
    }
  },
  {
    path: '/tools/ai/prompt-editor',
    component: AIPromptEditor,
    name: 'aiPromptEditor',
    meta: {
      title: "AIGC提示词编辑器",
      keywords: 'AIGC提示词,AI绘画提示词,Prompt编辑器,AI绘画工具',
      description: '专业的 AI 绘图提示词编辑工具，支持可视化编辑、智能优化、模板库等功能，让AI绘画创作更简单。',
    }
  },
  {
    path: '/tools/ai-design-cover',
    component: () => import('@/components/Tools/AI/AIDesignCover.vue'),
    name: 'aiDesignCover',
    meta: {
      title: "免费AI生成设计封面",
      keywords: 'AI设计封面,封面生成,智能封面设计,在线封面制作',
      description: '使用AI技术智能生成精美的设计封面，支持多种风格和布局，一键生成专业级封面设计。',
    }
  },
  {
    path: '/tools/ai-outsource-quote',
    component: AIOutsourceQuote,
    name: 'aiOutsourceQuote',
    meta: {
      title: "AI外包报价生成器",
      keywords: 'AI报价,外包报价,项目报价,程序开发报价,设计报价,短视频报价',
      description: '智能生成专业的外包项目报价单，支持程序开发、短视频制作、设计等多种项目类型，AI智能分析项目需求并生成合理报价',
    }
  },
  {
    path: '/tools/ai-ranking',
    component: () => import('@/components/Tools/AI/AIRanking.vue'),
    name: 'airanking',
    meta: {
      title: "AI网站排行榜",
      keywords: 'AI工具,AI产品榜,AI应用,人工智能工具,AI热门工具',
      description: '实时追踪AI工具热度，发现优质AI应用，包括AI聊天助手、AI图像创作、AI办公助手等多个分类的热门工具',
    }
  },
  {
    path: '/tools/ai/deepseek-prompt',
    component: () => import('@/components/Tools/AI/DeepSeekPrompt.vue'),
    name: 'deepseekPrompt',
    meta: {
      title: "DeepSeek应用指令库",
      keywords: 'DeepSeek提示词,AI提示词,Prompt指令,DeepSeek应用场景,AI对话指令',
      description: '收录精选的DeepSeek提示词和应用场景指令，帮助您更好地使用DeepSeek AI进行创作和工作。',
    }
  },
  {
    path: '/tools/ai/deepseek-nav',
    component: () => import('@/components/Tools/AI/DeepSeekNav.vue'),
    name: 'deepseekNav',
    meta: {
      title: "DeepSeek导航",
      keywords: 'DeepSeek导航,AI模型导航,免费好用的DeepSeek模型,DeepSeek工具集合',
      description: '发现免费好用的DeepSeek模型服务，包含多轮对话、清晰的速度标识、在线状态等信息，让您快速找到合适的AI工具。',
    }
  },
  {
    path: '/galaxy-motion',
    component: () => import('@/components/Tools/GalaxyMotion/GalaxyMotion.vue'),
    name: 'galaxyMotion',
    meta: {
      title: "星系运动查看",
      keywords: '星系运动查看,宇宙模拟,星系运动模拟,摸鱼工具',
      description: '一个可视化的星系运动查看工具，模拟宇宙中星系运动的轨迹和状态，提供沉浸式的宇宙体验。',
    }
  },
  {
    path: '/tools/ai-news',
    name: 'AINews',
    component: () => import('@/components/Tools/AI/AINews.vue'),
    meta: {
      title: 'AI实时快讯 - UIED-Tools',
      keywords: 'AI新闻,科技资讯,AI快讯,人工智能新闻',
      description: '实时展示最新AI科技资讯，及时了解人工智能领域的最新动态和发展趋势。'
    }
  },
  /* 暂时隐藏后端API测试工具路由
  {
    path: '/backend-test',
    name: 'backend-test',
    component: BackendTest,
    meta: {
      title: '后端API测试工具 - Tools Web',
      keywords: '后端API测试, API测试, 接口测试, RESTful API测试',
      description: '用于测试后端API接口的工具，支持GET、POST、PUT、DELETE等请求方式的测试。',
      footer: true,
      auth: false
    }
  }
  */
  // UI设计规范工具
  {
    path: '/tools/mobile-ui-spec',
    component: () => import('@/components/Tools/Design/MobileUISpec.vue'),
    name: 'mobileUISpec',
    meta: {
      title: "移动端UI设计规范",
      keywords: 'UI设计规范,iOS设计规范,Android设计规范,移动端设计尺寸,UI设计指南,UI组件尺寸,设计准则',
      description: '提供iOS和Android平台的UI设计规范，包含界面设计尺寸、组件规范、设计原则等专业参考资料',
    }
  },
  {
    path: '/tools/fish-calendar',
    component: () => import('@/components/Tools/FishCalendar/FishCalendar.vue'),
    name: 'fishCalendar',
    meta: {
      title: "摸鱼日历",
      keywords: '摸鱼日历,假期倒计时,节假日查询,工作日历',
      description: '在线查看摸鱼日历，了解距离各种假期的剩余时间，支持历史日期查询',
    }
  },
  // AI简历生成器
  {
    path: '/tools/ai/resume',
    component: () => import('@/components/Tools/AI/AIResume.vue'),
    name: 'aiResume',
    meta: {
      title: "AI简历生成器",
      keywords: 'AI简历,简历生成器,在线简历制作,简历模板,PDF简历',
      description: '使用AI技术，一键生成专业简历，支持多种模板和导出为PDF，让求职更加高效',
    }
  },
  {
    path: '/tools/radar',
    component: () => import('@/components/Tools/Chart/Radar/Radar.vue'),
    name: 'radar',
    meta: {
      title: "在线雷达图制作",
      keywords: '雷达图,雷达图制作,在线图表,数据可视化,多维数据分析',
      description: '在线制作雷达图，适用于多维数据对比分析，支持导出静态或动态图表',
    }
  },
  {
    path: '/tools/funnel',
    component: () => import('@/components/Tools/Chart/Funnel/Funnel.vue'),
    name: 'funnel',
    meta: {
      title: "在线漏斗图制作",
      keywords: '漏斗图,漏斗图制作,在线图表,数据可视化,转化率分析',
      description: '在线制作漏斗图，适用于转化率分析，支持导出静态或动态图表',
    }
  },
  {
    path: '/tools/gauge',
    component: () => import('@/components/Tools/Chart/Gauge/Gauge.vue'),
    name: 'gauge',
    meta: {
      title: "在线仪表盘制作",
      keywords: '仪表盘,仪表盘制作,在线图表,数据可视化,进度展示',
      description: '在线制作仪表盘，适用于进度展示、完成率分析，支持导出静态或动态图表',
    }
  },
  // 数据换算工具
  {
    path: '/tools/calculation/mortgage-rate',
    component: () => import('@/components/Tools/Calculation/MortgageRate.vue'),
    name: 'mortgageRate',
    meta: {
      title: "房贷利率调整计算器",
      keywords: '房贷利率计算器,存量房贷利率调整,房贷计算,LPR利率',
      description: '在线计算房贷利率调整后的月供变化，支持LPR利率调整计算，帮助您快速了解房贷调整方案。',
    }
  },
  {
    path: '/tools/calculation/investment',
    component: () => import('@/components/Tools/Calculation/Investment.vue'),
    name: 'investment',
    meta: {
      title: "投资收益计算器",
      keywords: '投资计算器,复利计算器,理财计算,定投计算',
      description: '在线投资收益计算器，支持复利计算、定投计算，帮助您规划理财方案，预估投资回报。',
    }
  },
  {
    path: '/tools/calculation/social-insurance',
    component: () => import('@/components/Tools/Calculation/SocialInsurance.vue'),
    name: 'socialInsurance',
    meta: {
      title: "五险一金计算器",
      keywords: '五险一金计算器,社保计算器,公积金计算,工资计算器,税后工资',
      description: '2025最新五险一金计算器，支持全国各城市社保公积金计算，快速计算个人应缴和实发工资。',
    }
  },
  {
    path: '/tools/calculation/temperature',
    component: () => import('@/components/Tools/Calculation/Temperature.vue'),
    name: 'temperature',
    meta: {
      title: "温度转换器",
      keywords: '温度转换,摄氏度转换,华氏度转换,开尔文转换,温度单位换算',
      description: '在线温度单位转换工具，支持摄氏度、华氏度、开尔文之间的快速互转，提供换算公式参考。',
    }
  },
  {
    path: '/tools/calculation/mortgage',
    component: () => import('@/components/Tools/Calculation/Mortgage.vue'),
    name: 'mortgage',
    meta: {
      title: "房贷计算器",
      keywords: '房贷计算器,商业贷款计算,公积金贷款计算,组合贷款计算,月供计算',
      description: '专业的房贷计算器，支持等额本息和等额本金两种还款方式，快速计算月供、利息和还款总额。',
    }
  },
]

const router = createRouter({
  history: createWebHistory(base),
  routes: constantRoute,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router
