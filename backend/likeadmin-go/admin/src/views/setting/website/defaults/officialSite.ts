/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

export const OFFICIAL_SITE_DEFAULT_SIDEBAR_BRAND_LOGO = `<svg width="60" height="30" viewBox="0 0 204 96" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="logo-svg"><title>logo-3</title><defs><polygon id="path-9z3bcfbp2n-1" points="4.24080877e-17 0 51 0 51 49 4.24080877e-17 49"></polygon></defs><g id="page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="logo-3"><rect id="background-rect" x="0" y="0" width="204" height="96" rx="48"></rect><g id="logo-copy" transform="translate(19, 24)"><path d="M118,0 L115.645416,11.671646 L89.1332623,11.6686726 L87.7228145,17.840708 L112.989339,17.840708 C113.408529,18.1263717 113.114499,18.8863009 113.032836,19.3722478 C112.438806,22.9040708 111.360981,26.3980885 110.730064,29.9260885 L85.5115139,29.9743009 C84.8626866,30.1945487 84.4307036,35.0482832 83.8848614,35.8938053 L110.750533,35.8938053 L108.191898,48 L68,48 L78.1279318,0 L118,0 Z" class="svg-elem"></path><g id="group"><mask id="mask-9z3bcfbp2n-2" fill="white"><use xlink:href="#path-9z3bcfbp2n-1"></use></mask><g id="Clip-4"></g><path d="M44.5484942,30.672481 C43.6369216,34.1601855 42.3502837,37.0948777 40.1324788,39.9385435 C28.0481786,55.4312424 -2.16172007,50.8094556 0.122748964,27.9765993 L5.84733956,0 L18.8393787,0 L13.1475876,27.5812233 C12.2451734,40.7777001 30.3841898,38.4394988 31.9817846,27.4591408 L37.5819924,0 L51,0" class="svg-elem" mask="url(#mask-9z3bcfbp2n-2)"></path></g><path d="M120.705221,11.6887342 L123.39497,0 L145.56178,0.00424573989 C177.801018,2.69604483 171.345066,47.5474041 141.724125,48 L119,47.8847282 L129.665791,35.9981425 C135.974363,35.4867431 142.366969,37.0738007 147.947383,33.3899845 C154.358119,29.1580432 155.653618,18.4243882 148.929352,13.8476929 C147.754359,13.0480078 144.776461,11.6887342 143.420175,11.6887342 L120.705221,11.6887342 Z" class="svg-elem"></path><polygon points="70 0 59.7432432 48 47 48 56.9459459 0" class="svg-elem"></polygon><polygon points="133 18 130.359061 29.1389362 113 48 119.628981 18" class="svg-elem"></polygon></g></g></g></svg>`

export const OFFICIAL_SITE_DEFAULT_SIDEBAR = {
    siteSlogan: '免费在线工具集',
    brandText: 'UIED-Tools',
    recommendTitle: '推荐工具',
    recommendLinks: [
        { name: '热门工具', link: '#recommend-hot' },
        { name: '随机推荐', link: '/tools/random-tools' },
        { name: '每日热榜', link: '/tools/hot-ranking' },
        { name: '每日文章', link: 'https://hot.uied.cn/' },
        { name: '实时资讯', link: '/tools/ai-news' },
        { name: 'AI产品榜', link: 'https://hao.uied.cn/' }
    ],
    categoryMenus: [
        {
            key: 'ai',
            title: 'AI工具箱',
            cateTitle: 'AI工具箱',
            link: '/tools/ai/toolbox',
            icon: '/icons/sidebar/ai.svg'
        },
        {
            key: 'design',
            title: '设计工具',
            cateTitle: '设计工具',
            link: '',
            icon: '/icons/sidebar/design.svg'
        },
        {
            key: 'image',
            title: '图片处理',
            cateTitle: '图片处理',
            link: '',
            icon: '/icons/sidebar/image.svg'
        },
        {
            key: 'office',
            title: '办公工具',
            cateTitle: '办公工具',
            link: '',
            icon: '/icons/sidebar/office.svg'
        },
        {
            key: 'daily',
            title: '生活常用',
            cateTitle: '生活常用',
            link: '',
            icon: '/icons/sidebar/daily.svg'
        },
        {
            key: 'copywriting',
            title: '文案工具',
            cateTitle: '文案工具',
            link: '',
            icon: '/icons/sidebar/copywriting.svg'
        },
        {
            key: 'psychology',
            title: '潜能测试',
            cateTitle: '潜能测试',
            link: '',
            icon: '/icons/sidebar/psychology.svg'
        },
        {
            key: 'video',
            title: '剪辑工具',
            cateTitle: '剪辑工具',
            link: '',
            icon: '/icons/sidebar/video.svg'
        },
        {
            key: 'dev',
            title: '开发工具',
            cateTitle: '开发工具',
            link: '',
            icon: '/icons/sidebar/dev.svg'
        },
        {
            key: 'slacking',
            title: '摸鱼工具',
            cateTitle: '摸鱼工具',
            link: '',
            icon: '/icons/sidebar/slacking.svg'
        },
        {
            key: 'efficiency',
            title: '效率工具',
            cateTitle: '效率工具',
            link: '',
            icon: '/icons/sidebar/efficiency.svg'
        }
    ],
    bottomLinks: [
        { name: '更新记录', link: '/changelog' },
        { name: '意见反馈', link: 'https://uiedtool.com/' },
        { name: '关于我们', link: '/about' }
    ],
    aiToolboxSidebarMenus: [
        { name: 'AI精选工具', link: '#ai-highlight' },
        { name: 'AI分组总览', link: '#ai-groups' }
    ]
}

export const OFFICIAL_SITE_DEFAULT_HEADER = {
    headerLinks: [{ name: '个人网站', link: 'https://tomda.top/' }],
    searchQuickTools: [
        {
            name: 'DeepSeek R1对话',
            desc: '基于 DeepSeek-R1 推理模型的智能对话',
            link: '/tools/ai/deepseek-r1'
        },
        { name: 'DeepSeek AI对话', desc: '基础智能对话服务', link: '/tools/ai/deepseek' },
        {
            name: 'DeepSeek提示词',
            desc: '专业的 Prompt 提示词指南',
            link: '/tools/ai/deepseek-prompt'
        },
        { name: 'DeepSeek导航', desc: 'DeepSeek 模型与工具导航', link: '/tools/ai/deepseek-nav' },
        { name: 'AI封面设计', desc: 'AI智能生成封面图片', link: '/tools/ai-design-cover' },
        { name: 'AI产品榜', desc: '跳转至 AI 产品导航站', link: 'https://hao.uied.cn/' }
    ],
    searchProviderLabel: '硅基流动 x 华为云联合 SiliconFlow',
    searchProviderLink: 'https://cloud.siliconflow.cn/i/AZywGNhl',
    aiChatHeaderLinks: [
        { name: 'AI学习平台', link: 'https://www.uied.cn/' },
        { name: 'AI免费工具', link: 'https://uiedtool.com' },
        { name: 'AI资讯热榜', link: 'https://hot.uied.cn' },
        { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' },
        {
            name: 'AI交流群',
            link: 'https://ai.feishu.cn/wiki/CUuaw5ooxiHAkckgtRkcn6rnnVQ?from=from_copylink'
        },
        {
            name: 'AI知识库',
            link: 'https://ai.feishu.cn/wiki/ZjddwTFpWivK6ukwBoDc5DoHnVt?from=from_copylink'
        }
    ],
    aiCommonHeaderLinks: [
        {
            name: '每日免费分享最新AI资讯',
            link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink'
        },
        { name: 'AI学习平台', link: 'https://www.uied.cn/' },
        { name: 'AI免费工具uiedtool.com', link: 'https://uiedtool.com' },
        { name: 'AI资讯热榜hot.uied.cn', link: 'https://hot.uied.cn' },
        { name: 'AI工具导航', link: 'https://hao.uied.cn/ai' }
    ]
}

export const OFFICIAL_SITE_DEFAULT_FOOTER = {
    intro: '{webName} 是由 UIED技术团队 设计开发的在线工具平台',
    quickTitle: '工具快捷入口',
    friendTitle: '友情链接',
    officialMediaTitle: '官方媒体',
    supportLabel: '技术支持',
    supportLinks: [
        { name: 'Tomda', link: 'https://www.tomda.top/' },
        { name: 'UIED技术团队', link: 'https://fsuied.com' }
    ],
    recordLinks: [
        { name: '粤ICP备2022056875号', link: 'https://beian.miit.gov.cn/' },
        { name: '网站地图', link: '/sitemap.xml' }
    ],
    quickSections: [
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
    ],
    friendSections: [
        {
            title: 'AI',
            items: [
                { name: 'AI文章', link: 'https://www.uied.cn/category/aigc/ai' },
                { name: 'AI资讯', link: 'https://hot.uied.cn/ai-realtime' },
                { name: 'AI工具', link: 'https://hao.uied.cn/ai' },
                {
                    name: 'AI知识库',
                    link: 'https://ai.feishu.cn/wiki/CIktwhQHni3FLwkllYac6Bm2ndb?from=from_copylink'
                },
                { name: 'AI交流群', link: 'https://www.uied.cn/wechat' }
            ]
        },
        {
            title: '教程',
            items: [
                { name: 'UI文章', link: 'https://www.uied.cn/category/wenzhang/ui-wenzhang' },
                {
                    name: '平面文章',
                    link: 'https://www.uied.cn/category/wenzhang/pingmian-wenzhang'
                },
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
    ],
    officialMediaLinks: [
        { name: '知乎', link: 'https://www.zhihu.com/org/uiedyong-hu-ti-yan-jiao-liu-xue-xi' },
        {
            name: '小红书',
            link: 'https://www.xiaohongshu.com/user/profile/5dc2ccb0000000000100ba83'
        },
        { name: '微博', link: 'https://weibo.com/u/7542146005' },
        {
            name: 'B站',
            link: 'https://space.bilibili.com/3493135908866790?spm_id_from=333.1007.0.0'
        }
    ]
}

export const OFFICIAL_SITE_DEFAULT_SEO = {
    defaultTitle: '',
    defaultKeywords:
        '免费在线工具,UIED,UIED-Tools,免费AI工具箱,AI工具,AI工具箱,AI工具大全,AI工具网站,AI工具网站大全,AI工具网站推荐,AI工具网站排行榜',
    defaultDescription: 'UIED免费在线工具大全',
    defaultImage: '/favicon.ico',
    pages: [
        {
            path: '/',
            title: '首页',
            keywords:
                'tools-web,在线工具,开发人员工具,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
            description:
                'tools-web,在线工具,在线工具大全,开发人员工具,日常生活工具,办公助手,时间戳转换,加密,解密,md5,进制转换,二维码,正则表达式,json格式化,照片处理,字数统计',
            image: '/favicon.ico'
        },
        {
            path: '/changelog',
            title: '更新日志',
            keywords: 'UIED-Tools更新日志,版本历史,功能更新',
            description: 'UIED-Tools的更新日志，记录了所有版本的功能更新和变更信息',
            image: '/favicon.ico'
        },
        {
            path: '/user/login',
            title: '用户登录',
            keywords: '用户登录,QQ登录,微信登录,个人中心',
            description:
                'UIED Tools 用户登录页，支持登录后进入个人中心，管理账号资料与QQ邮箱绑定。',
            image: '/favicon.ico'
        },
        {
            path: '/user/center',
            title: '个人中心',
            keywords: '个人中心,QQ邮箱绑定,用户资料',
            description: 'UIED Tools 个人中心，支持维护昵称与QQ邮箱绑定信息。',
            image: '/favicon.ico'
        },
        {
            path: '/tools/ai/toolbox',
            title: 'AI工具箱',
            keywords: 'AI工具箱,AI工具导航,AI工具合集,免费AI工具',
            description:
                'UIED Tools AI工具箱聚合页，按分类整合对话、写作、图像、办公等高频 AI 工具。',
            image: '/favicon.ico'
        }
    ]
}
