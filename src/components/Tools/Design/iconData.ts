/**
 * @file iconData.ts
 * @description 图标数据文件，收集整理自各大开源图标库
 */

// 定义图标类型
export interface IconItem {
  id: number
  name: string
  english: string
  category: string
  source: string
  tags: string[]
  svg: string
}

// 定义分类
export const categories = [
  { value: 'all', label: '全部图标' },      // 所有图标
  { value: 'basic', label: '基础图标' },      // 常用的基础图标
  { value: 'direction', label: '方向图标' },  // 箭头、导航相关
  { value: 'file', label: '文件图标' },      // 文件、文件夹相关
  { value: 'edit', label: '编辑图标' },      // 编辑、修改相关
  { value: 'media', label: '媒体图标' },     // 音视频、图片相关
  { value: 'device', label: '设备图标' },    // 手机、电脑等设备
  { value: 'time', label: '时间图标' },      // 时钟、日历等
  { value: 'action', label: '操作图标' },    // 下载、上传、分享等
  { value: 'communication', label: '通讯图标' }, // 消息、通知、电话等
  { value: 'tool', label: '工具图标' },      // 工具、设置等
  { value: 'chart', label: '图表图标' },     // 图表、数据可视化
  { value: 'weather', label: '天气图标' },   // 天气相关
  { value: 'social', label: '社交图标' },    // 社交媒体相关
  { value: 'payment', label: '支付图标' },   // 支付、金融相关
  { value: 'emoji', label: '表情图标' }      // 表情、情感相关
]

// 定义来源
export const sources = [
  {
    value: 'Feather Icons',
    label: 'Feather Icons',
    url: 'https://feathericons.com/',
    github: 'https://github.com/feathericons/feather',
    license: 'MIT'
  },
  {
    value: 'Remix Icons',
    label: 'Remix Icons',
    url: 'https://remixicon.com/',
    github: 'https://github.com/Remix-Design/RemixIcon',
    license: 'Apache License Version 2.0'
  }
]

// Feather Icons 图标
const featherIcons: IconItem[] = [
  {
    id: 2001,
    name: '主页',
    english: 'Home',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['home', 'house', 'main', '主页', '首页', '房子'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },
  {
    id: 2002,
    name: '搜索',
    english: 'Search',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['search', 'find', 'magnifier', '搜索', '查找', '放大镜'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
  },
  {
    id: 2003,
    name: '设置',
    english: 'Settings',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['settings', 'gear', 'preferences', '设置', '齿轮', '偏好'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2h.09A1.65 1.65 0 0 0 14.6 9a1.65 1.65 0 0 0-.33 1.82l.06.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  },
  {
    id: 2004,
    name: '用户',
    english: 'User',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['user', 'person', 'profile', '用户', '个人', '档案'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  },
  {
    id: 2005,
    name: '菜单',
    english: 'Menu',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['menu', 'list', 'navigation', '菜单', '列表', '导航'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
  },
  {
    id: 2006,
    name: '向右箭头',
    english: 'Arrow Right',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['chevron', 'right', 'arrow', '箭头', '向右', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>'
  },
  {
    id: 2007,
    name: '向左箭头',
    english: 'Arrow Left',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['chevron', 'left', 'arrow', '箭头', '向左', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>'
  },
  {
    id: 2008,
    name: '向上箭头',
    english: 'Arrow Up',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['chevron', 'up', 'arrow', '箭头', '向上', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>'
  },
  {
    id: 2009,
    name: '向下箭头',
    english: 'Arrow Down',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['chevron', 'down', 'arrow', '箭头', '向下', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>'
  },
  {
    id: 2010,
    name: '播放',
    english: 'Play',
    category: 'media',
    source: 'Feather Icons',
    tags: ['play', 'media', 'video', '播放', '媒体', '视频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>'
  },
  {
    id: 2011,
    name: '图片',
    english: 'Image',
    category: 'media',
    source: 'Feather Icons',
    tags: ['image', 'photos', 'picture', '图片', '照片', '图像'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
  },
  {
    id: 2012,
    name: '下载',
    english: 'Download',
    category: 'action',
    source: 'Feather Icons',
    tags: ['download', 'save', '下载', '保存'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
  },
  {
    id: 2013,
    name: '分享',
    english: 'Share',
    category: 'action',
    source: 'Feather Icons',
    tags: ['share', 'forward', '分享', '转发'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
  },
  {
    id: 2014,
    name: '设备',
    english: 'Device',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['device', 'phone', 'smartphone', '设备', '手机', '智能手机'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
  },
  {
    id: 2015,
    name: '云端',
    english: 'Cloud',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['cloud', 'storage', '云', '存储'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>'
  },
  {
    id: 2016,
    name: '链接',
    english: 'Link',
    category: 'file',
    source: 'Feather Icons',
    tags: ['link', 'url', '链接', '网址'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
  },
  {
    id: 2017,
    name: '日历',
    english: 'Calendar',
    category: 'time',
    source: 'Feather Icons',
    tags: ['calendar', 'date', '日历', '日期'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  },
  {
    id: 2018,
    name: '钟表',
    english: 'Clock',
    category: 'time',
    source: 'Feather Icons',
    tags: ['clock', 'time', '时钟', '时间'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
  },
  {
    id: 2019,
    name: '笔记本',
    english: 'Laptop',
    category: 'device',
    source: 'Feather Icons',
    tags: ['laptop', 'computer', '笔记本', '电脑'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2z"/><line x1="2" y1="20" x2="22" y2="20"/></svg>'
  },
  {
    id: 2020,
    name: '手机',
    english: 'Mobile',
    category: 'device',
    source: 'Feather Icons',
    tags: ['mobile', 'phone', 'smartphone', '手机', '电话'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
  },
  {
    id: 2021,
    name: '耳机',
    english: 'Headphones',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['headphones', 'audio', '耳机', '音频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>'
  },
  {
    id: 2022,
    name: '打印机',
    english: 'Printer',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['printer', 'print', '打印机', '打印'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>'
  },
  {
    id: 2023,
    name: '摄像头',
    english: 'Camera',
    category: 'media',
    source: 'Feather Icons',
    tags: ['camera', 'photo', '摄像头', '相机'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'
  },
  {
    id: 2024,
    name: '麦克风',
    english: 'Microphone',
    category: 'media',
    source: 'Feather Icons',
    tags: ['microphone', 'mic', '麦克风', '话筒'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
  },
  {
    id: 2025,
    name: '耳机',
    english: 'Headphones',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['headphones', 'audio', '耳机', '音频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>'
  },
  {
    id: 2026,
    name: '箭头向右',
    english: 'Arrow Right',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['arrow', 'right', 'direction', '箭头', '向右', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>'
  },
  {
    id: 2027,
    name: '箭头向左',
    english: 'Arrow Left',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['arrow', 'left', 'direction', '箭头', '向左', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>'
  },
  {
    id: 2028,
    name: '箭头向上',
    english: 'Arrow Up',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['arrow', 'up', 'direction', '箭头', '向上', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="19 12 12 19 5 12"/></svg>'
  },
  {
    id: 2029,
    name: '箭头向下',
    english: 'Arrow Down',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['arrow', 'down', 'direction', '箭头', '向下', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
  },
  {
    id: 2030,
    name: '菜单',
    english: 'Menu',
    category: 'direction',
    source: 'Feather Icons',
    tags: ['menu', 'list', 'navigation', '菜单', '列表', '导航'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
  },
  {
    id: 2031,
    name: '刷新',
    english: 'Refresh',
    category: 'basic',
    source: 'Feather Icons',
    tags: ['refresh', 'reload', 'sync', '刷新', '重新加载', '同步'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>'
  },
  {
    id: 2032,
    name: '复制',
    english: 'Copy',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['copy', 'duplicate', 'clone', '复制', '副本', '克隆'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
  },
  {
    id: 2033,
    name: '粘贴',
    english: 'Paste',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['paste', 'clipboard', 'copy', '粘贴', '剪贴板', '复制'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>'
  },
  {
    id: 2034,
    name: '剪切',
    english: 'Cut',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['cut', 'scissors', 'clip', '剪切', '剪刀', '裁剪'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>'
  },
  {
    id: 2035,
    name: '保存',
    english: 'Save',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['save', 'store', 'keep', '保存', '存储', '保管'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>'
  },
  {
    id: 2036,
    name: '导出',
    english: 'Export',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['export', 'download', 'save', '导出', '下载', '保存'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
  },
  {
    id: 2037,
    name: '导入',
    english: 'Import',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['import', 'upload', 'load', '导入', '上传', '加载'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>'
  },
  {
    id: 2038,
    name: '打印',
    english: 'Print',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['print', 'printer', 'paper', '打印', '打印机', '纸张'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>'
  },
  {
    id: 2039,
    name: '预览',
    english: 'Preview',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['preview', 'view', 'show', '预览', '查看', '显示'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
  },
  {
    id: 2040,
    name: '撤销',
    english: 'Undo',
    category: 'edit',
    source: 'Feather Icons',
    tags: ['undo', 'revert', 'back', '撤销', '返回', '后退'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>'
  }
]

// Remix Icons 图标
const remixIcons: IconItem[] = [
  {
    id: 3001,
    name: '通知',
    english: 'Notification',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['notification', 'bell', 'alert', '通知', '铃铛', '提醒'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 18h14v-6.969C19 7.148 15.866 4 12 4s-7 3.148-7 7.031V18zm7-16c4.97 0 9 4.043 9 9.031V20H3v-8.969C3 6.043 7.03 2 12 2zM9.5 21h5a2.5 2.5 0 1 1-5 0z" fill="currentColor"/></svg>'
  },
  {
    id: 3002,
    name: '文件夹',
    english: 'Folder',
    category: 'file',
    source: 'Remix Icons',
    tags: ['folder', 'directory', 'file', '文件夹', '目录', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v15a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V4zm2 2v13a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6H5zm2 2h10v2H7V8z" fill="currentColor"/></svg>'
  },
  {
    id: 3003,
    name: '编辑',
    english: 'Edit',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['edit', 'pencil', 'write', '编辑', '铅笔', '写作'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" fill="currentColor"/></svg>'
  },
  {
    id: 3004,
    name: '删除',
    english: 'Delete',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['delete', 'trash', 'remove', '删除', '垃圾桶', '移除'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" fill="currentColor"/></svg>'
  },
  {
    id: 3005,
    name: '智能手机',
    english: 'Smartphone',
    category: 'device',
    source: 'Remix Icons',
    tags: ['smartphone', 'mobile', 'phone', '智能手机', '手机', '电话'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4v16h10V4H7zM6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zm6 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3006,
    name: '天气',
    english: 'Weather',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['weather', 'forecast', 'climate', '天气', '预报', '气候'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 7a8.003 8.003 0 0 0-7.493 5.19l1.874.703A6.002 6.002 0 0 1 23 15a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6c0-3.314 2.686-6 6-6 .36 0 .712.032 1.054.094a8.001 8.001 0 0 1 7.938-7.093V3h-1v2h3V2h-1v3a8.001 8.001 0 0 1 7.938 7.093C20.288 12.032 20.64 12 21 12c3.314 0 6 2.686 6 6a6 6 0 0 1-6 6h-1v-2h1a4 4 0 1 0 0-8c-1.157 0-2.157.49-2.854 1.257a8.044 8.044 0 0 0-3.091-.471A4 4 0 0 0 6 21a4 4 0 1 0 0-8c1.157 0 2.157.49 2.854 1.257a8.044 8.044 0 0 0 3.091-.471A4 4 0 0 0 17 9a4 4 0 1 0 0 8h-1v2h1a6 6 0 0 0 6-6 6 6 0 0 0-6-6z" fill="currentColor"/></svg>'
  },
  {
    id: 3007,
    name: '音乐',
    english: 'Music',
    category: 'media',
    source: 'Remix Icons',
    tags: ['music', 'audio', 'sound', '音乐', '音频', '声音'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 13.535V3h8v2h-6v12a4 4 0 1 1-2-3.465zM10 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3008,
    name: '购物',
    english: 'Shopping',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['shopping', 'cart', 'buy', '购物', '购物车', '买'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>'
  },
  {
    id: 3009,
    name: '礼物',
    english: 'Gift',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['gift', 'present', 'box', '礼物', '礼品', '盒子'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15 2a4 4 0 0 1 3.464 6.001L23 8v2h-2v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10H1V8l4.536.001A4 4 0 0 1 12 3.355 3.983 3.983 0 0 1 15 2zm-4 8H5v9h6v-9zm8 0h-6v9h6v-9zM9 4a2 2 0 0 0-.15 3.995L9 8h2V6a2 2 0 0 0-1.697-1.977l-.154-.018L9 4zm6 0a2 2 0 0 0-1.995 1.85L13 6v2h2a2 2 0 0 0 1.995-1.85L17 6a2 2 0 0 0-2-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3010,
    name: '相机',
    english: 'Camera',
    category: 'media',
    source: 'Remix Icons',
    tags: ['camera', 'photo', 'image', '相机', '照片', '图像'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.828 5l-2 2H4v12h16V7h-3.828l-2-2H9.828zM9 3h6l2 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg>'
  },
  {
    id: 3011,
    name: 'PDF文档',
    english: 'PDF Document',
    category: 'file',
    source: 'Remix Icons',
    tags: ['pdf', 'document', 'file', 'PDF', '文档', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 16H8V8h4a4 4 0 1 1 0 8zm-2-6v4h2a2 2 0 1 0 0-4h-2zm5-6H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992z" fill="currentColor"/></svg>'
  },
  {
    id: 3012,
    name: '图片',
    english: 'Image',
    category: 'file',
    source: 'Remix Icons',
    tags: ['image', 'picture', 'photo', '图片', '图像', '照片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3013,
    name: '音频',
    english: 'Audio',
    category: 'file',
    source: 'Remix Icons',
    tags: ['audio', 'sound', 'music', '音频', '声音', '音乐'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM4 5v14h16V5H4zm8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3014,
    name: '视频',
    english: 'Video',
    category: 'file',
    source: 'Remix Icons',
    tags: ['video', 'movie', 'film', '视频', '电影', '影片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8.5 11v-4l5 2-5 2z"/></svg>'
  },
  {
    id: 3015,
    name: '压缩文件',
    english: 'Zip',
    category: 'file',
    source: 'Remix Icons',
    tags: ['zip', 'archive', 'compress', '压缩', '压缩包', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zm-5-8v5h-4v-3h2v-2h2zm-2-8h2v2h-2V4zm0 3h2v2h-2V7zm0 3h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3016,
    name: '文件',
    english: 'File',
    category: 'file',
    source: 'Remix Icons',
    tags: ['file', 'document', 'paper', '文件', '文档', '纸张'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 8l6.003-6h10.995C20.55 2 21 2.455 21 2.992v18.016a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 20.993V8zm7-4.5L4.5 9H10V3.5z" fill="currentColor"/></svg>'
  },
  {
    id: 3017,
    name: '设置',
    english: 'Settings',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['settings', 'gear', 'preferences', '设置', '齿轮', '偏好'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3018,
    name: '主页',
    english: 'Home',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['home', 'house', 'main', '主页', '首页', '房子'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 21H5a1 1 0 0 1-1-1v-9H1l10.327-9.388a1 1 0 0 1 1.346 0L23 11h-3v9a1 1 0 0 1-1 1zM6 19h12V9.157l-6-5.454-6 5.454V19z" fill="currentColor"/></svg>'
  },
  {
    id: 3019,
    name: '通知',
    english: 'Notification',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['notification', 'bell', 'alert', '通知', '铃铛', '提醒'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 18h14v-6.969C19 7.148 15.866 4 12 4s-7 3.148-7 7.031V18zm7-16c4.97 0 9 4.043 9 9.031V20H3v-8.969C3 6.043 7.03 2 12 2zM9.5 21h5a2.5 2.5 0 1 1-5 0z" fill="currentColor"/></svg>'
  },
  {
    id: 3020,
    name: '搜索',
    english: 'Search',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['search', 'find', 'magnifier', '搜索', '查找', '放大镜'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" fill="currentColor"/></svg>'
  },
  {
    id: 3024,
    name: '日历',
    english: 'Calendar',
    category: 'time',
    source: 'Remix Icons',
    tags: ['calendar', 'date', 'schedule', '日历', '日期', '计划'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z" fill="currentColor"/></svg>'
  },
  {
    id: 3025,
    name: '位置',
    english: 'Location',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['location', 'map', 'pin', '位置', '地图', '定位'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 0 0 8zm0-10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3026,
    name: '图表',
    english: 'Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['chart', 'graph', 'analytics', '图表', '统计', '分析'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 12h4v9H3v-9zm14-4h4v13h-4V8zm-7-6h4v19h-4V2z" fill="currentColor"/></svg>'
  },
  {
    id: 3027,
    name: '饼图',
    english: 'Pie Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['pie', 'chart', 'analytics', '饼图', '图表', '分析'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h10v2H7v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3028,
    name: '晴天',
    english: 'Sunny',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['sun', 'weather', 'sunny', '太阳', '天气', '晴天'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" fill="currentColor"/></svg>'
  },
  {
    id: 3029,
    name: '微信',
    english: 'WeChat',
    category: 'social',
    source: 'Remix Icons',
    tags: ['wechat', 'social', 'chat', '微信', '社交', '聊天'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5753 13.7114C19.0742 13.7114 19.4733 13.2873 19.4733 12.8134C19.4733 12.3145 19.0742 11.9155 18.5753 11.9155C18.0765 11.9155 17.6774 12.3145 17.6774 12.8134C17.6774 13.3123 18.0765 13.7114 18.5753 13.7114ZM14.1497 13.7114C14.6485 13.7114 15.0476 13.2873 15.0476 12.8134C15.0476 12.3145 14.6485 11.9155 14.1497 11.9155C13.6508 11.9155 13.2517 12.3145 13.2517 12.8134C13.2517 13.3123 13.6508 13.7114 14.1497 13.7114ZM20.717 18.7516C20.5942 18.8253 20.5205 18.9482 20.5451 19.1202C20.5451 19.1693 20.5451 19.2185 20.5696 19.2676C20.6679 19.6854 20.8643 20.349 20.8643 20.3736C20.8643 20.4473 20.8889 20.4964 20.8889 20.5456C20.8889 20.6685 20.7907 20.7668 20.6679 20.7668C20.6187 20.7668 20.5942 20.7422 20.5451 20.7176L19.0961 19.882C18.9978 19.8329 18.875 19.7837 18.7522 19.7837C18.6786 19.7837 18.6049 19.7837 18.5558 19.8083C17.8681 20.0049 17.1559 20.1032 16.3946 20.1032C12.7352 20.1032 9.78815 17.6456 9.78815 14.5983C9.78815 11.5509 12.7352 9.09329 16.3946 9.09329C20.0539 9.09329 23.001 11.5509 23.001 14.5983C23.001 16.2448 22.1168 17.7439 20.717 18.7516ZM16.6737 8.09757C16.581 8.09473 16.488 8.09329 16.3946 8.09329C12.2199 8.09329 8.78815 10.9536 8.78815 14.5983C8.78815 15.1519 8.86733 15.6874 9.01626 16.1975H8.92711C8.04096 16.1975 7.15481 16.0503 6.3425 15.8296C6.26866 15.805 6.19481 15.805 6.12097 15.805C5.97327 15.805 5.82558 15.8541 5.7025 15.9277L3.95482 16.9334C3.90559 16.958 3.85635 16.9825 3.80712 16.9825C3.65943 16.9825 3.53636 16.8599 3.53636 16.7127C3.53636 16.6391 3.56097 16.59 3.58559 16.5164C3.6102 16.4919 3.83174 15.6824 3.95482 15.1918C3.95482 15.1427 3.97943 15.0691 3.97943 15.0201C3.97943 14.8238 3.88097 14.6766 3.75789 14.5785C2.05944 13.3765 1.00098 11.5858 1.00098 9.59876C1.00098 5.94369 4.5702 3 8.95173 3C12.7157 3 15.8802 5.16856 16.6737 8.09757ZM11.5199 8.51604C12.0927 8.51604 12.5462 8.03871 12.5462 7.4898C12.5462 6.91701 12.0927 6.46356 11.5199 6.46356C10.9471 6.46356 10.4937 6.91701 10.4937 7.4898C10.4937 8.06258 10.9471 8.51604 11.5199 8.51604ZM6.26045 8.51604C6.83324 8.51604 7.28669 8.03871 7.28669 7.4898C7.28669 6.91701 6.83324 6.46356 6.26045 6.46356C5.68767 6.46356 5.23421 6.91701 5.23421 7.4898C5.23421 8.06258 5.68767 8.51604 6.26045 8.51604Z"></path></svg>'
  },
  {
    id: 3030,
    name: '支付宝',
    english: 'Alipay',
    category: 'payment',
    source: 'Remix Icons',
    tags: ['alipay', 'payment', 'finance', '支付宝', '支付', '金融'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M21.422 15.358c-3.83-1.153-6.055-1.84-6.678-2.062a12.41 12.41 0 0 0 1.32-3.32H12.8V8.872h4v-.68h-4V6.344h-1.536v1.848H7.242 21.422zM12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" fill="currentColor"/></svg>'
  },
  {
    id: 3031,
    name: '笑脸',
    english: 'Smile',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['smile', 'happy', 'emoji', '笑脸', '开心', '表情'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-5-7h10v2H7v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3032,
    name: '折线图',
    english: 'Line Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['line', 'chart', 'graph', '折线图', '图表', '统计'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 12h4v9H3v-9zm14-4h4v13h-4V8zm-7-6h4v19h-4V2z" fill="currentColor"/></svg>'
  },
  {
    id: 3033,
    name: '雨天',
    english: 'Rainy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['rain', 'weather', 'cloud', '下雨', '天气', '云'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 18v-2h1a4 4 0 1 0-2.157-7.37A6 6 0 1 0 8 15.917v2.022A8.001 8.001 0 0 1 9 2a7.998 7.998 0 0 1 6.98 4.087A6 6 0 1 1 17 18h-1zm-5.768.732L12 16.964l1.768 1.768a2.5 2.5 0 1 1-3.536 0z" fill="currentColor"/></svg>'
  },
  {
    id: 3034,
    name: '多云',
    english: 'Cloudy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['cloud', 'weather', 'cloudy', '多云', '天气', '云'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.5 6a6.5 6.5 0 0 0 0 13h7a4.5 4.5 0 1 0-.957-8.898A6.502 6.502 0 0 0 9.5 6zm7 15h-7a8.5 8.5 0 1 1 7.215-13.024 6.5 6.5 0 0 1 .785 13.024z" fill="currentColor"/></svg>'
  },
  {
    id: 3035,
    name: 'QQ',
    english: 'QQ',
    category: 'social',
    source: 'Remix Icons',
    tags: ['qq', 'social', 'chat', 'QQ', '社交', '聊天'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5359 12.5144L16.8402 10.7175C16.8408 10.6968 16.8494 10.3429 16.8494 10.1604C16.8494 7.08792 15.448 4.0003 12.0012 4C8.55459 4.0003 7.15292 7.08792 7.15292 10.1604C7.15292 10.3429 7.16151 10.6968 7.16209 10.7175L6.4667 12.5144C6.27608 13.0285 6.08776 13.564 5.94988 14.0232C5.29262 16.2126 5.50559 17.1186 5.66783 17.139C6.01581 17.1823 7.02221 15.4908 7.02221 15.4908C7.02221 16.4704 7.5095 17.7487 8.56405 18.6719C8.16963 18.7976 7.68635 18.9911 7.37564 19.2284C7.09645 19.442 7.13142 19.6594 7.18158 19.7473C7.40258 20.1329 10.9713 19.9935 12.0017 19.8733C13.0319 19.9935 16.6009 20.1329 16.8216 19.7473C16.872 19.6594 16.9067 19.442 16.6275 19.2284C16.3168 18.9911 15.8333 18.7976 15.4386 18.6716C16.4928 17.7487 16.9801 16.4704 16.9801 15.4908C16.9801 15.4908 17.9868 17.1823 18.3348 17.139C18.4967 17.1186 18.7131 16.2108 18.0524 14.0232C17.9125 13.56 17.7265 13.0285 17.5359 12.5144ZM18.5574 20.7407C18.1843 21.3926 17.7237 21.6334 17.1187 21.7981C16.8792 21.8633 16.621 21.9056 16.325 21.936C15.8844 21.9814 15.3392 22.001 14.712 22C13.786 21.9985 12.693 21.9491 12.0017 21.884C11.3103 21.9491 10.2173 21.9985 9.29129 22C8.66414 22.001 8.11889 21.9814 7.67832 21.936C7.38236 21.9056 7.12409 21.8633 6.88467 21.7981C6.27994 21.6335 5.81954 21.393 5.44496 20.7393C5.15165 20.2258 5.07747 19.6406 5.20612 19.0866C4.61376 18.9546 4.20483 18.6045 3.92733 18.1757C3.77911 17.9466 3.68408 17.7127 3.61845 17.4663C3.53001 17.1344 3.49486 16.7666 3.50184 16.3601C3.51532 15.5749 3.68902 14.5984 4.03435 13.4481C4.17427 12.9821 4.3614 12.4396 4.6015 11.7926L5.15467 10.3632C5.1536 10.287 5.15292 10.2154 5.15292 10.1604C5.15292 5.6047 7.58875 2.00038 12.0013 2C16.4138 2.00038 18.8494 5.60454 18.8494 10.1604C18.8494 10.2154 18.8487 10.2869 18.8477 10.3631L19.401 11.7923L19.4112 11.8191C19.636 12.4254 19.8242 12.9722 19.967 13.445C20.3145 14.5956 20.4889 15.5735 20.5018 16.361C20.5085 16.768 20.4728 17.1365 20.3837 17.4689C20.3178 17.7148 20.2226 17.9483 20.0746 18.1768C19.7976 18.6041 19.3905 18.9532 18.7974 19.0862C18.9266 19.6411 18.8523 20.2274 18.5574 20.7407Z"></path></svg>'
  },
  {
    id: 3036,
    name: '微博',
    english: 'Weibo',
    category: 'social',
    source: 'Remix Icons',
    tags: ['weibo', 'social', 'blog', '微博', '社交', '博客'],
    svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.1945 14.1973C20.1945 17.5586 15.6658 20.6206 10.2693 20.6206C5.31907 20.6206 1.00098 18.1885 1.00098 14.5338C1.00098 12.5873 2.1808 10.447 4.24042 8.44571C7.0727 5.69957 10.4695 4.41277 12.0994 5.99781C12.5966 6.48041 12.8225 7.11988 12.8178 7.85577C14.7934 7.28031 16.4689 7.45174 17.3006 8.60768C17.7497 9.2307 17.8332 9.98744 17.6268 10.8152C19.1382 11.4259 20.1945 12.5847 20.1945 14.1973ZM15.755 12.1279C15.3691 11.7166 15.3549 11.2078 15.5572 10.7169C15.7655 10.2087 15.7701 9.90467 15.6776 9.77646C15.4134 9.40925 14.1443 9.41428 12.4833 10.0883C12.4306 10.1106 12.3609 10.1367 12.2765 10.1623C12.1789 10.1917 12.0794 10.2147 11.9744 10.2286C11.6296 10.274 11.3028 10.2293 10.9913 9.96287C10.572 9.60419 10.5175 9.10776 10.6694 8.64655C10.8835 7.97702 10.8482 7.57054 10.7057 7.43232C10.5197 7.25137 9.92883 7.24087 9.04745 7.57477C7.97823 7.97981 6.74875 8.79941 5.63339 9.88084C3.92586 11.54 3.00098 13.2178 3.00098 14.5338C3.00098 16.7755 6.27688 18.6206 10.2693 18.6206C14.6892 18.6206 18.1945 16.2506 18.1945 14.1973C18.1945 13.4588 17.558 12.8585 16.5218 12.5446C16.1276 12.4316 15.9855 12.3736 15.755 12.1279ZM22.8091 10.5099C22.6705 11.0445 22.1247 11.3655 21.5901 11.2268C21.0555 11.0882 20.7345 10.5424 20.8732 10.0078C20.9577 9.68188 21.001 9.34424 21.001 9C21.001 6.79086 19.2101 5 17.001 5C16.7223 5 16.448 5.02834 16.1806 5.08401C15.6399 5.19657 15.1103 4.84949 14.9977 4.3088C14.8852 3.76811 15.2323 3.23854 15.773 3.12599C16.1743 3.04244 16.5852 3 17.001 3C20.3147 3 23.001 5.68629 23.001 9C23.001 9.514 22.9361 10.0203 22.8091 10.5099Z"></path></svg>'
  },
  {
    id: 3037,
    name: '银行卡',
    english: 'Bank Card',
    category: 'payment',
    source: 'Remix Icons',
    tags: ['card', 'credit', 'payment', '银行卡', '信用卡', '支付'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 8H4v8h16v-8zm0-2V5H4v4h16zm-6 6h4v2h-4v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3038,
    name: '现金',
    english: 'Cash',
    category: 'payment',
    source: 'Remix Icons',
    tags: ['cash', 'money', 'payment', '现金', '钱', '支付'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 9h19a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V9zm1-6h15v4H2V4a1 1 0 0 1 1-1zm12 11v2h3v-2h-3z" fill="currentColor"/></svg>'
  },
  {
    id: 3039,
    name: '哭脸',
    english: 'Cry',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['cry', 'sad', 'emoji', '哭脸', '伤心', '表情'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-4 8h8v2H8v-2zm0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3040,
    name: '生气',
    english: 'Angry',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['angry', 'mad', 'emoji', '生气', '愤怒', '表情'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-4-5h8v2H8v-2zm1-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3041,
    name: '柱状图',
    english: 'Bar Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['bar', 'chart', 'graph', '柱状图', '图表', '统计'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 12h4v9H3v-9zm14-4h4v13h-4V8zm-7-6h4v19h-4V2z" fill="currentColor"/></svg>'
  },
  {
    id: 3042,
    name: '雷达图',
    english: 'Radar Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['radar', 'chart', 'graph', '雷达图', '图表', '统计'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2l9.3 4.8v10.4L12 22l-9.3-4.8V6.8L12 2zm0 2.308L4.6 8.154v7.692L12 19.692l7.4-3.846V8.154L12 4.308z" fill="currentColor"/></svg>'
  },
  {
    id: 3043,
    name: '抖音',
    english: 'TikTok',
    category: 'social',
    source: 'Remix Icons',
    tags: ['tiktok', 'social', 'video', '抖音', '社交', '视频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" fill="currentColor"/></svg>'
  },
  {
    id: 3044,
    name: 'B站',
    english: 'Bilibili',
    category: 'social',
    source: 'Remix Icons',
    tags: ['bilibili', 'social', 'video', 'B站', '社交', '视频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7.172 2.757L10.414 6h3.171l3.243-3.242a1 1 0 0 1 1.415 1.415L16.414 6H18.5A3.5 3.5 0 0 1 22 9.5v8a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 2 17.5v-8A3.5 3.5 0 0 1 5.5 6h2.085L5.757 4.171a1 1 0 0 1 1.415-1.415zM18.5 8h-13a1.5 1.5 0 0 0-1.493 1.356L4 9.5v8a1.5 1.5 0 0 0 1.356 1.493L5.5 19h13a1.5 1.5 0 0 0 1.493-1.356L20 17.5v-8A1.5 1.5 0 0 0 18.5 8zM8 11a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zm8 0a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3045,
    name: '知乎',
    english: 'Zhihu',
    category: 'social',
    source: 'Remix Icons',
    tags: ['zhihu', 'social', 'qa', '知乎', '社交', '问答'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13.3735 18.8965L14.8258 18.8969L15.3039 20.5335L17.9085 18.8969H20.9792V5.39468H13.3735V18.8965ZM14.9191 6.8605H19.4338V17.4311H17.7018L15.9722 18.5181L15.6573 17.4337L14.9193 17.4313V6.8607L14.9191 6.8605ZM12.0895 11.5728H8.84563C8.95376 9.89106 8.98193 8.37101 8.98193 7.01344H12.1538C12.1538 7.01344 12.2758 5.61316 11.622 5.62905H6.13529C6.35155 4.81471 6.62335 3.97414 6.94873 3.10498C6.94873 3.10498 5.45617 3.10498 4.94787 4.44368C4.73756 4.99585 4.12887 7.12109 3.04481 9.29202C3.40987 9.25229 4.61753 9.21853 5.32879 7.91359C5.45974 7.54813 5.48454 7.50046 5.64723 7.01185H7.43679C7.43679 7.66333 7.36259 11.163 7.33244 11.5702H4.09237C3.36424 11.5702 3.12755 13.036 3.12755 13.036H7.19336C6.92056 16.1307 5.45637 18.7386 2.80078 20.8003C4.07114 21.1634 5.33713 20.7427 5.96268 20.1858C5.96268 20.1858 7.38759 18.8888 8.16889 15.8876L11.5145 19.9184C11.5145 19.9184 12.0052 18.2496 11.4375 17.4365C10.9673 16.8827 9.69796 15.3847 9.15672 14.8417L8.25004 15.5621C8.52045 14.6945 8.68314 13.8519 8.7381 13.0376H12.5601C12.5601 13.0376 12.5547 11.5718 12.0895 11.5718V11.5728Z"></path></svg>'
  },
  {
    id: 3046,
    name: '雪天',
    english: 'Snowy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['snow', 'weather', 'winter', '雪', '天气', '冬天'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 16.268l1.964-1.134 1 1.732L14 18l1.964 1.134-1 1.732L13 19.732V22h-2v-2.268l-1.964 1.134-1-1.732L10 18l-1.964-1.134 1-1.732L11 16.268V14h2v2.268zM17 18v-2h.5a3.5 3.5 0 1 0-2.5-5.95V10a6 6 0 1 0-8 5.659v2.089a8 8 0 1 1 9.458-10.65A5.5 5.5 0 1 1 17.5 18l-.5.001z" fill="currentColor"/></svg>'
  },
  {
    id: 3047,
    name: '阴天',
    english: 'Cloudy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['cloud', 'weather', 'overcast', '阴天', '天气', '多云'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.5 6a6.5 6.5 0 0 0 0 13h7a4.5 4.5 0 1 0-.957-8.898A6.502 6.502 0 0 0 9.5 6zm7 15h-7a8.5 8.5 0 1 1 7.215-13.024 6.5 6.5 0 0 1 .785 13.024z" fill="currentColor"/></svg>'
  },
  {
    id: 3048,
    name: '闪电',
    english: 'Lightning',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['lightning', 'thunder', 'storm', '闪电', '雷电', '暴风雨'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 9h9l-5 7h4l-8 8 2-8h-4l2-7zm-2 15L7 19h-4l6-7H2l5-7h9L9 15h4l-2 9z" fill="currentColor"/></svg>'
  },
  {
    id: 3049,
    name: '大笑',
    english: 'Laugh',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['laugh', 'happy', 'joy', '大笑', '开心', '快乐'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-4 6h2v2H8v-2zm8 0h2v2h-2v-2zm-5 6h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3050,
    name: '惊讶',
    english: 'Surprised',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['surprised', 'shocked', 'wow', '惊讶', '震惊', '吃惊'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-4-7h8v2H8v-2zm0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3051,
    name: '热力图',
    english: 'Heat Map',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['heat', 'map', 'chart', '热力图', '图表', '统计'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 3h20v18H2V3zm2 2v14h16V5H4zm1 2h14v10H5V7zm2 2v6h10V9H7z" fill="currentColor"/></svg>'
  },
  {
    id: 3052,
    name: '散点图',
    english: 'Scatter Plot',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['scatter', 'plot', 'chart', '散点图', '图表', '统计'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h2v2H7V7zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3053,
    name: '小红书',
    english: 'Xiaohongshu',
    category: 'social',
    source: 'Remix Icons',
    tags: ['xiaohongshu', 'social', 'blog', '小红书', '社交', '博客'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-2-9.5l3 3 5-5L17 9.5l-4 4-3-3L8 12.5z" fill="currentColor"/></svg>'
  },
  {
    id: 3054,
    name: '大风',
    english: 'Windy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['wind', 'weather', 'windy', '大风', '天气', '风'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10.5 17H4v-2h6.5a3.5 3.5 0 1 1-3.5 3.5H5a5.5 5.5 0 1 0 5.5-5.5H4V11h6.5a3.5 3.5 0 1 1-3.5 3.5H5a5.5 5.5 0 1 0 5.5-5.5H4V7h6.5a3.5 3.5 0 1 1-3.5 3.5H5a5.5 5.5 0 1 0 5.5-5.5H4V3h6.5a3.5 3.5 0 1 1-3.5 3.5" fill="currentColor"/></svg>'
  },
  {
    id: 3055,
    name: '沙尘暴',
    english: 'Sandstorm',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['sandstorm', 'weather', 'dust', '沙尘暴', '天气', '沙尘'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M14 18v-3h7v3h-7zm-1 1h9v-5h-9v5zM4 14v-3h7v3H4zm-1 1h9v-5H3v5zm10-9v3h7V6h-7zm-1-1h9V0h-9v5zM4 2v3h7V2H4zM3 1h9V-4H3v5z" fill="currentColor"/></svg>'
  },
  {
    id: 3056,
    name: '疑惑',
    english: 'Confused',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['confused', 'question', 'emoji', '疑惑', '困惑', '表情'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 13.355z" fill="currentColor"/></svg>'
  },
  {
    id: 3057,
    name: '睡觉',
    english: 'Sleep',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['sleep', 'tired', 'emoji', '睡觉', '疲惫', '表情'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-4-7h8v2H8v-2zm0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm8 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3058,
    name: '漏斗图',
    english: 'Funnel Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['funnel', 'chart', 'analytics', '漏斗图', '图表', '分析'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 20L4 20 10 12 4 4 20 4 14 12z" fill="currentColor"/></svg>'
  },
  {
    id: 3059,
    name: '树形图',
    english: 'Tree Chart',
    category: 'chart',
    source: 'Remix Icons',
    tags: ['tree', 'chart', 'hierarchy', '树形图', '图表', '层级'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M10 2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H8v2h5V9a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1H8v6h5v-1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-1H7a1 1 0 0 1-1-1V8H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6zm9 16h-4v2h4v-2zm0-8h-4v2h4v-2zM9 4H5v2h4V4z" fill="currentColor"/></svg>'
  },
  {
    id: 3060,
    name: 'Word文档',
    english: 'Word',
    category: 'file',
    source: 'Remix Icons',
    tags: ['word', 'document', 'file', 'Word', '文档', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-2 6v4.989L12 11l-1.99 2L10 8H8v8h2l2-2 2 2h2V8h-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3061,
    name: 'Excel表格',
    english: 'Excel',
    category: 'file',
    source: 'Remix Icons',
    tags: ['excel', 'spreadsheet', 'file', 'Excel', '表格', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-4 6.667H8V10h4V8.667zm0 6.666H8v1.334h4v-1.334zM20 19v-1.333h-4V19h4zm0-4v-1.334h-4v1.334h4z" fill="currentColor"/></svg>'
  },
  {
    id: 3062,
    name: 'PPT演示',
    english: 'PowerPoint',
    category: 'file',
    source: 'Remix Icons',
    tags: ['powerpoint', 'presentation', 'file', 'PPT', '演示', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-4 9H8v2h4v-2zm0 4H8v2h4v-2zm0-8H8v2h4V7z" fill="currentColor"/></svg>'
  },
  {
    id: 3006,
    name: '文档',
    english: 'Document',
    category: 'file',
    source: 'Remix Icons',
    tags: ['document', 'file', 'paper', '文档', '文件', '纸张'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM8 7h8v2H8V7zm0 4h8v2H8v-2zm0 4h8v2H8v-2zm0 4h8v2H8v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3007,
    name: '设置',
    english: 'Settings',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['settings', 'gear', 'options', '设置', '齿轮', '选项'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3008,
    name: '用户',
    english: 'User',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['user', 'person', 'profile', '用户', '人物', '档案'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3009,
    name: '团队',
    english: 'Team',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['team', 'group', 'users', '团队', '群组', '用户组'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 11a5 5 0 0 1 5 5v6h-2v-6a3 3 0 0 0-2.824-2.995L12 13a3 3 0 0 0-2.995 2.824L9 16v6H7v-6a5 5 0 0 1 5-5zm-6.5 3c.279 0 .55.033.81.094a5.947 5.947 0 0 0-.301 1.575L6 16v.086a1.492 1.492 0 0 0-.356-.08L5.5 16a1.5 1.5 0 0 0-1.493 1.356L4 17.5V22H2v-4.5A3.5 3.5 0 0 1 5.5 14zm13 0a3.5 3.5 0 0 1 3.5 3.5V22h-2v-4.5a1.5 1.5 0 0 0-1.356-1.493L18.5 16c-.175 0-.343.03-.5.085V16c0-.666-.108-1.306-.309-1.904.259-.063.53-.096.809-.096zm-13-6a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm13 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-13 2a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zm13 0a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zM12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill="currentColor"/></svg>'
  },
  {
    id: 3010,
    name: '搜索',
    english: 'Search',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['search', 'find', 'magnifier', '搜索', '查找', '放大镜'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" fill="currentColor"/></svg>'
  },
  {
    id: 3011,
    name: '收藏',
    english: 'Star',
    category: 'basic',
    source: 'Remix Icons',
    tags: ['star', 'favorite', 'bookmark', '收藏', '星标', '书签'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 18.26l-7.053 3.948 1.575-7.928L.587 8.792l8.027-.952L12 .5l3.386 7.34 8.027.952-5.935 5.488 1.575 7.928L12 18.26zm0-2.292l4.247 2.377-.949-4.773 3.573-3.305-4.833-.573L12 5.275l-2.038 4.42-4.833.572 3.573 3.305-.949 4.773L12 15.968z" fill="currentColor"/></svg>'
  },
  {
    id: 3012,
    name: '消息',
    english: 'Message',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['message', 'chat', 'comment', '消息', '聊天', '评论'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6.455 19L2 22.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.455zM4 18.385L5.763 17H20V5H4v13.385z" fill="currentColor"/></svg>'
  },
  {
    id: 3013,
    name: '邮件',
    english: 'Mail',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['mail', 'email', 'envelope', '邮件', '电子邮件', '信封'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z" fill="currentColor"/></svg>'
  },
  {
    id: 3014,
    name: '电话',
    english: 'Phone',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['phone', 'call', 'telephone', '电话', '呼叫', '通话'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M21 16.42v3.536a1 1 0 0 1-.93.998c-.437.03-.794.046-1.07.046-8.837 0-16-7.163-16-16 0-.276.015-.633.046-1.07A1 1 0 0 1 4.044 3H7.58a.5.5 0 0 1 .498.45c.023.23.044.413.064.552A13.901 13.901 0 0 0 9.35 8.003c.095.2.033.439-.147.567l-2.158 1.542a13.047 13.047 0 0 0 6.844 6.844l1.54-2.154a.462.462 0 0 1 .573-.149 13.901 13.901 0 0 0 4 1.205c.139.02.322.042.55.064a.5.5 0 0 1 .449.498z" fill="currentColor"/></svg>'
  },
  {
    id: 3015,
    name: '视频',
    english: 'Video',
    category: 'media',
    source: 'Remix Icons',
    tags: ['video', 'movie', 'film', '视频', '电影', '影片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 20.007V3.993zM5 5v14h14V5H5zm5.622 3.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z" fill="currentColor"/></svg>'
  },
  {
    id: 3063,
    name: '文本文件',
    english: 'Text File',
    category: 'file',
    source: 'Remix Icons',
    tags: ['text', 'file', 'document', '文本', '文件', '文档'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M21 8v12.993A1 1 0 0 1 20.007 22H3.993A.993.993 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2h11.58L21 8zm-2 1h-5V4H5v16h14V9zM8 7h3v2H8V7zm0 4h8v2H8v-2zm0 4h8v2H8v-2zm0 4h8v2H8v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3064,
    name: '音频文件',
    english: 'Audio File',
    category: 'file',
    source: 'Remix Icons',
    tags: ['audio', 'file', 'music', '音频', '文件', '音乐'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-5 10.05a2.5 2.5 0 1 0 2 2.45V10h3V8h-5v4.05z" fill="currentColor"/></svg>'
  },
  {
    id: 3065,
    name: '视频文件',
    english: 'Video File',
    category: 'file',
    source: 'Remix Icons',
    tags: ['video', 'file', 'movie', '视频', '文件', '电影'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-3 10v-4h-2v4H8l4 4 4-4h-3z" fill="currentColor"/></svg>'
  },
  {
    id: 3066,
    name: '图片文件',
    english: 'Image File',
    category: 'file',
    source: 'Remix Icons',
    tags: ['image', 'file', 'picture', '图片', '文件', '照片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-1 2H5v16h14V8h-4V4zm-3 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="currentColor"/></svg>'
  },
  {
    id: 3067,
    name: '代码文件',
    english: 'Code File',
    category: 'file',
    source: 'Remix Icons',
    tags: ['code', 'file', 'program', '代码', '文件', '程序'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 2l5 5v14.008a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 21.008V2.992C3 2.444 3.445 2 3.993 2H16zm-2.471 9.907L16 15.374l-2.471 3.467-1.48-1.058L13.764 15l-1.715-2.783 1.48-1.058zm-5.058 0l2.471 3.467-2.471 3.467-1.48-1.058L8.706 15l-1.715-2.783 1.48-1.058z" fill="currentColor"/></svg>'
  },
  {
    id: 3068,
    name: '播放',
    english: 'Play',
    category: 'media',
    source: 'Remix Icons',
    tags: ['play', 'start', 'media', '播放', '开始', '媒体'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.376 12.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z" fill="currentColor"/></svg>'
  },
  {
    id: 3069,
    name: '暂停',
    english: 'Pause',
    category: 'media',
    source: 'Remix Icons',
    tags: ['pause', 'stop', 'media', '暂停', '停止', '媒体'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 5h2v14H6V5zm10 0h2v14h-2V5z" fill="currentColor"/></svg>'
  },
  {
    id: 3070,
    name: '停止',
    english: 'Stop',
    category: 'media',
    source: 'Remix Icons',
    tags: ['stop', 'media', 'square', '停止', '媒体', '方块'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 5h12v14H6V5z" fill="currentColor"/></svg>'
  },
  {
    id: 3071,
    name: '快进',
    english: 'Fast Forward',
    category: 'media',
    source: 'Remix Icons',
    tags: ['forward', 'fast', 'media', '快进', '前进', '媒体'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12.5 3.937l8.5 6.063-8.5 6.063V3.937zM3 3.937l8.5 6.063-8.5 6.063V3.937z" fill="currentColor"/></svg>'
  },
  {
    id: 3072,
    name: '快退',
    english: 'Fast Backward',
    category: 'media',
    source: 'Remix Icons',
    tags: ['backward', 'fast', 'media', '快退', '后退', '媒体'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M11.5 3.937v12.126L3 10.063l8.5-6.126zm8.5 0v12.126L11.5 10.063l8.5-6.126z" fill="currentColor"/></svg>'
  },
  {
    id: 3073,
    name: '音量',
    english: 'Volume',
    category: 'media',
    source: 'Remix Icons',
    tags: ['volume', 'sound', 'speaker', '音量', '声音', '扬声器'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M8.889 16H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L8.89 16zm9.974.591l-1.422-1.422A3.993 3.993 0 0 0 19 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 21 12c0 1.842-.83 3.49-2.137 4.591z" fill="currentColor"/></svg>'
  },
  {
    id: 3074,
    name: '静音',
    english: 'Mute',
    category: 'media',
    source: 'Remix Icons',
    tags: ['mute', 'volume', 'speaker', '静音', '音量', '扬声器'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm14.525-4l3.536 3.536-1.414 1.414L19 13.414l-3.536 3.536-1.414-1.414L17.586 12 14.05 8.464l1.414-1.414L19 10.586l3.536-3.536 1.414 1.414L20.414 12z" fill="currentColor"/></svg>'
  },
  {
    id: 3075,
    name: '全屏',
    english: 'Fullscreen',
    category: 'media',
    source: 'Remix Icons',
    tags: ['fullscreen', 'expand', 'maximize', '全屏', '扩展', '最大化'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 3h6v6h-2V5h-4V3zM2 3h6v2H4v4H2V3zm18 16v-4h2v6h-6v-2h4zM4 19h4v2H2v-6h2v4z" fill="currentColor"/></svg>'
  },
  {
    id: 3076,
    name: '退出全屏',
    english: 'Exit Fullscreen',
    category: 'media',
    source: 'Remix Icons',
    tags: ['fullscreen', 'minimize', 'exit', '退出全屏', '最小化', '退出'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18 7h4v2h-6V3h2v4zM8 9H2V7h4V3h2v6zm10 8v4h-2v-6h6v2h-4zM8 15v6H6v-4H2v-2h6z" fill="currentColor"/></svg>'
  },
  {
    id: 3077,
    name: '循环',
    english: 'Loop',
    category: 'media',
    source: 'Remix Icons',
    tags: ['loop', 'repeat', 'cycle', '循环', '重复', '周期'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="currentColor"/></svg>'
  },
  {
    id: 3078,
    name: '随机',
    english: 'Random',
    category: 'media',
    source: 'Remix Icons',
    tags: ['random', 'shuffle', 'mix', '随机', '洗牌', '混合'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18 17.883V16l5 3-5 3v-2.09a9 9 0 0 1-6.997-5.365L11 14.54l-.003.006A9 9 0 0 1 2.725 20H2v-2h.725a7 7 0 0 0 6.434-4.243L9.912 12l-.753-1.757A7 7 0 0 0 2.725 6H2V4h.725a9 9 0 0 1 8.272 5.455L11 9.46l.003-.006A9 9 0 0 1 18 4.09V2l5 3-5 3V6.117a7 7 0 0 0-5.159 4.126L12.088 12l.753 1.757A7 7 0 0 0 18 17.883z" fill="currentColor"/></svg>'
  },
  {
    id: 3079,
    name: '画笔',
    english: 'Brush',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['brush', 'paint', 'draw', '画笔', '绘画', '绘制'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15.456 9.678l-.142-.142a5.475 5.475 0 0 0-2.39-1.349c-2.907-.778-5.699.869-6.492 3.83-.043.16-.066.34-.104.791-.154 1.87-.594 3.265-1.8 4.68 2.26.888 4.938 1.514 6.974 1.514a5.505 5.505 0 0 0 5.31-4.078 5.497 5.497 0 0 0-1.356-5.246zM13.29 6.216l4.939-4.939a1 1 0 0 1 1.414 1.414l-4.939 4.939a7.072 7.072 0 0 0-1.414-1.414z" fill="currentColor"/></svg>'
  },
  {
    id: 3080,
    name: '橡皮擦',
    english: 'Eraser',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['eraser', 'delete', 'remove', '橡皮擦', '删除', '移除'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M14 19h7v2h-9l-3.998.002-6.487-6.487a1 1 0 0 1 0-1.414L12.12 2.494a1 1 0 0 1 1.415 0l7.778 7.778a1 1 0 0 1 0 1.414L14 19zm1.657-4.485l3.535-3.536-6.364-6.364-3.535 3.536 6.364 6.364z" fill="currentColor"/></svg>'
  },
  {
    id: 3081,
    name: '图层',
    english: 'Layer',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['layer', 'stack', 'level', '图层', '堆叠', '层级'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2l8.5 4.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3082,
    name: '滤镜',
    english: 'Filter',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['filter', 'funnel', 'sort', '滤镜', '过滤', '排序'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M21 4v2h-1l-5 7.5V22H9v-8.5L4 6H3V4h18zM6.404 6L11 12.894V20h2v-7.106L17.596 6H6.404z" fill="currentColor"/></svg>'
  },
  {
    id: 3083,
    name: '裁剪',
    english: 'Crop',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['crop', 'cut', 'resize', '裁剪', '剪切', '调整大小'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15 17v2H6a1 1 0 0 1-1-1V7H3V5h2V3h2v2h11v11h2v2h-2v2h-2zm-1-7H8v7h6v-7z" fill="currentColor"/></svg>'
  },
  {
    id: 3084,
    name: '旋转',
    english: 'Rotate',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['rotate', 'turn', 'spin', '旋转', '转动', '旋转'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 3a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7V3z" fill="currentColor"/></svg>'
  },
  {
    id: 3085,
    name: '翻转',
    english: 'Flip',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['flip', 'mirror', 'reverse', '翻转', '镜像', '反转'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 10v4h14v-4H5zm0 11h14v-4H5v4zM5 3v4h14V3H5z" fill="currentColor"/></svg>'
  },
  {
    id: 3086,
    name: '对齐',
    english: 'Align',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['align', 'arrangement', 'order', '对齐', '排列', '顺序'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 15h14v2H3v-2zm0-5h18v2H3v-2zm0-5h14v2H3V9z" fill="currentColor"/></svg>'
  },
  {
    id: 3087,
    name: '缩放',
    english: 'Zoom',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['zoom', 'scale', 'resize', '缩放', '比例', '调整大小'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" fill="currentColor"/></svg>'
  },
  {
    id: 3088,
    name: '聊天',
    english: 'Chat',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['chat', 'message', 'talk', '聊天', '消息', '对话'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6.455 19L2 22.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.455zM4 18.385L5.763 17H20V5H4v13.385z" fill="currentColor"/></svg>'
  },
  {
    id: 3089,
    name: '评论',
    english: 'Comment',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['comment', 'feedback', 'review', '评论', '反馈', '评价'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-4 13a6 6 0 1 1 8 0h-8zm-1-8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/></svg>'
  },
  {
    id: 3090,
    name: '分享',
    english: 'Share',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['share', 'send', 'social', '分享', '发送', '社交'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.12 17.023l-4.199-2.29a4 4 0 1 1 0-5.465l4.2-2.29a4 4 0 1 1 .959 1.755l-4.2 2.29a4 4 0 1 1-.959 1.755zM6 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm11-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3091,
    name: '群组',
    english: 'Group',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['group', 'team', 'users', '群组', '团队', '用户组'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3092,
    name: '联系人',
    english: 'Contact',
    category: 'communication',
    source: 'Remix Icons',
    tags: ['contact', 'person', 'user', '联系人', '个人', '用户'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 22H4v-2a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v2zm-8-9a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="currentColor"/></svg>'
  },
  {
    id: 3093,
    name: '电脑',
    english: 'Computer',
    category: 'device',
    source: 'Remix Icons',
    tags: ['computer', 'laptop', 'pc', '电脑', '笔记本', '个人电脑'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 16h16V5H4v11zm9 2v2h4v2H7v-2h4v-2H2.992A.998.998 0 0 1 2 16.993V4.007C2 3.451 2.455 3 2.992 3h18.016c.548 0 .992.449.992 1.007v12.986c0 .556-.455 1.007-.992 1.007H13z" fill="currentColor"/></svg>'
  },
  {
    id: 3094,
    name: '手机',
    english: 'Mobile',
    category: 'device',
    source: 'Remix Icons',
    tags: ['mobile', 'phone', 'smartphone', '手机', '电话', '智能手机'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4v16h10V4H7zM6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zm6 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3095,
    name: '平板',
    english: 'Tablet',
    category: 'device',
    source: 'Remix Icons',
    tags: ['tablet', 'ipad', 'device', '平板', '平板电脑', '设备'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 4v16h12V4H6zM5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm7 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3096,
    name: '打印机',
    english: 'Printer',
    category: 'device',
    source: 'Remix Icons',
    tags: ['printer', 'print', 'device', '打印机', '打印', '设备'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 17h10v-4H7v4zm12 3v-2h-1v-5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v5H5v2h14zM7 4v5h10V4H7zM6 2h12a1 1 0 0 1 1 1v3H5V3a1 1 0 0 1 1-1zm1 11h10v1H7v-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3097,
    name: '相机',
    english: 'Camera',
    category: 'device',
    source: 'Remix Icons',
    tags: ['camera', 'photo', 'picture', '相机', '照片', '图片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.828 5l-2 2H4v12h16V7h-3.828l-2-2H9.828zM9 3h6l2 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm3 15a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="currentColor"/></svg>'
  },
  {
    id: 3098,
    name: '计算器',
    english: 'Calculator',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['calculator', 'math', 'tool', '计算器', '数学', '工具'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 2h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm1 2v16h14V4H5zm2 2h10v4H7V6zm0 6h2v2H7v-2zm4 0h2v2h-2V7zm4 0h2v2h-2V7zM7 11h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 15h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3099,
    name: '日历',
    english: 'Calendar',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['calendar', 'date', 'schedule', '日历', '日期', '日程'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z" fill="currentColor"/></svg>'
  },
  {
    id: 3100,
    name: '闹钟',
    english: 'Alarm',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['alarm', 'clock', 'time', '闹钟', '时钟', '时间'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22a9 9 0 1 1 0-18 9 9 0 0 1 0 18zm0-2a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm1-7h3v2h-5V8h2v5zM1.747 6.282l3.535-3.535 1.415 1.414L3.16 7.697 1.747 6.282zm16.97-3.535l3.536 3.535-1.414 1.415-3.536-3.536 1.415-1.414z" fill="currentColor"/></svg>'
  },
  {
    id: 3101,
    name: '定位',
    english: 'Location',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['location', 'map', 'position', '定位', '地图', '位置'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 20.9l4.95-4.95a7 7 0 1 0-9.9 0L12 20.9zm0 2.828l-6.364-6.364a9 9 0 1 1 12.728 0L12 23.728zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 2a4 4 0 1 1 0-8 4 4 0 0 0 0 8zm0-10a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3102,
    name: '指南针',
    english: 'Compass',
    category: 'tool',
    source: 'Remix Icons',
    tags: ['compass', 'direction', 'navigation', '指南针', '方向', '导航'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.5-11.5l-2 5-5 2 2-5 5-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3103,
    name: '文件夹',
    english: 'Folder',
    category: 'file',
    source: 'Remix Icons',
    tags: ['folder', 'directory', 'file', '文件夹', '目录', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 5v14h16V7h-8.414l-2-2H4zm8.414 0H21a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm-2 2h14v-14H5v14zm2-2h10v-2H7v2zm0 4h10v2H7v-2zm0-8h10v2H7v-2zm0 4h10v2H7v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3104,
    name: '压缩包',
    english: 'ZIP',
    category: 'file',
    source: 'Remix Icons',
    tags: ['zip', 'archive', 'compress', '压缩包', '压缩文件', '归档'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zm-5-8v5h-4v-3h2v-2h2zm-2-8h2v2h-2V4zm0 3h2v2h-2V7zm0 3h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3105,
    name: 'PDF',
    english: 'PDF',
    category: 'file',
    source: 'Remix Icons',
    tags: ['pdf', 'document', 'file', 'pdf', '文档', '文件'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 16H8V8h4a4 4 0 1 1 0 8zm-2-6v4h2a2 2 0 1 0 0-4h-2zm5-6H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0 1 20.007 22H3.993A1 1 0 0 1 3 21.008V2.992z" fill="currentColor"/></svg>'
  },
  {
    id: 3106,
    name: '音乐',
    english: 'Music',
    category: 'media',
    source: 'Remix Icons',
    tags: ['music', 'audio', 'song', '音乐', '音频', '歌曲'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 13.535V3h8v2h-6v12a4 4 0 1 1-2-3.465zM10 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3107,
    name: '图片',
    english: 'Image',
    category: 'media',
    source: 'Remix Icons',
    tags: ['image', 'picture', 'photo', '图片', '照片', '相片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.828 21l-.02.02-.021-.02H2.992A.993.993 0 0 1 2 20.007V3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H4.828zM20 15V5H4v14L14 9l6 6zm0 2.828l-6-6L6.828 19H20v-1.172zM8 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3108,
    name: '视频',
    english: 'Video',
    category: 'media',
    source: 'Remix Icons',
    tags: ['video', 'movie', 'film', '视频', '电影', '影片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 20.007V3.993zM5 5v14h14V5H5zm5.622 3.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z" fill="currentColor"/></svg>'
  },
  {
    id: 3109,
    name: '麦克风',
    english: 'Microphone',
    category: 'media',
    source: 'Remix Icons',
    tags: ['microphone', 'mic', 'audio', '麦克风', '话筒', '音频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm0-2a5 5 0 0 1 5 5v4a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5zM3.055 11H5.07a7.002 7.002 0 0 0 13.858 0h2.016A9.004 9.004 0 0 1 13 18.945V23h-2v-4.055A9.004 9.004 0 0 1 3.055 11z" fill="currentColor"/></svg>'
  },
  {
    id: 3110,
    name: '耳机',
    english: 'Headphone',
    category: 'media',
    source: 'Remix Icons',
    tags: ['headphone', 'headset', 'audio', '耳机', '听筒', '音频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 4a8 8 0 0 0-8 8h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7C2 6.477 6.477 2 12 2s10 4.477 10 10v7a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h3a8 8 0 0 0-8-8zM4 14v5h3v-5H4zm13 0v5h3v-5h-3z" fill="currentColor"/></svg>'
  },
  {
    id: 3111,
    name: '扬声器',
    english: 'Speaker',
    category: 'media',
    source: 'Remix Icons',
    tags: ['speaker', 'audio', 'sound', '扬声器', '音响', '声音'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 4v16h14V4H5zM4 2h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm8 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm0 2a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-10.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/></svg>'
  },
  {
    id: 3112,
    name: '相册',
    english: 'Album',
    category: 'media',
    source: 'Remix Icons',
    tags: ['album', 'gallery', 'photos', '相册', '图库', '照片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h16zm-1 2H5v14h14V5zm-7 12l-3-3-2 2-3-3v4h16v-1l-3-3-5 4zm8-12h-2v2h2V5zm0 4h-2v2h2V9z" fill="currentColor"/></svg>'
  },
  {
    id: 3113,
    name: '微信2',
    english: 'WeChat',
    category: 'social',
    source: 'Remix Icons',
    tags: ['wechat', 'social', 'chat', '微信', '社交', '聊天'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.0014 14.6757C10.0011 14.6551 10.001 14.6345 10.001 14.6138C10.001 12.1055 12.0175 9.99564 14.7539 9.38092C14.3904 7.07873 11.9602 5.19995 8.90098 5.19995C5.58037 5.19995 3.00098 7.41344 3.00098 9.9793C3.00098 10.9487 3.36131 11.88 4.04082 12.6781C4.0728 12.7157 4.12443 12.7717 4.19342 12.8427C4.78537 13.4517 5.13709 14.2457 5.19546 15.0805C5.90857 14.6683 6.74285 14.5123 7.55832 14.6392C7.72416 14.665 7.85986 14.6847 7.96345 14.6982C8.27111 14.7383 8.58419 14.7586 8.90098 14.7586C9.27825 14.7586 9.64595 14.7301 10.0014 14.6757ZM10.4581 16.627C9.95467 16.7133 9.43399 16.7586 8.90098 16.7586C8.49441 16.7586 8.09502 16.7323 7.70499 16.6815C7.58312 16.6656 7.4317 16.6436 7.25073 16.6154C6.87693 16.5572 6.49436 16.6321 6.1713 16.8268L4.26653 17.9745C4.12052 18.0646 3.94891 18.1057 3.77733 18.0916C3.33814 18.0554 3.01178 17.6744 3.04837 17.2405L3.19859 15.4596C3.23664 15.0086 3.07664 14.5632 2.75931 14.2367C2.66182 14.1364 2.5814 14.0491 2.51802 13.9747C1.56406 12.8542 1.00098 11.4732 1.00098 9.9793C1.00098 6.23517 4.53793 3.19995 8.90098 3.19995C12.9601 3.19995 16.3041 5.82699 16.7504 9.20788C20.1225 9.36136 22.801 11.723 22.801 14.6138C22.801 15.8068 22.3448 16.9097 21.572 17.8044C21.5206 17.8639 21.4555 17.9336 21.3765 18.0137C21.1194 18.2744 20.9898 18.6301 21.0206 18.9903L21.1423 20.4125C21.172 20.759 20.9076 21.0632 20.5518 21.0921C20.4128 21.1034 20.2738 21.0706 20.1555 20.9986L18.6124 20.0821C18.3506 19.9266 18.0407 19.8668 17.7379 19.9133C17.5913 19.9358 17.4686 19.9533 17.3699 19.966C17.0539 20.0066 16.7303 20.0277 16.401 20.0277C13.7074 20.0277 11.4025 18.6201 10.4581 16.627ZM17.4346 17.9364C18.0019 17.8494 18.5793 17.911 19.1105 18.1111C19.2492 17.5503 19.5373 17.0304 19.9524 16.6094C20.0027 16.5585 20.0388 16.5198 20.0584 16.4971C20.5467 15.9318 20.801 15.2839 20.801 14.6138C20.801 12.8095 18.8983 11.2 16.401 11.2C13.9037 11.2 12.001 12.8095 12.001 14.6138C12.001 16.4181 13.9037 18.0277 16.401 18.0277C16.6424 18.0277 16.8809 18.0124 17.115 17.9823C17.1957 17.972 17.3029 17.9566 17.4346 17.9364Z"></path></svg>'
  },
  {
    id: 3114,
    name: 'QQ2',
    english: 'QQ',
    category: 'social',
    source: 'Remix Icons',
    tags: ['qq', 'social', 'chat', 'qq', '社交', '聊天'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.9139 14.529C19.7336 13.955 19.4877 13.2856 19.2385 12.643L18.3288 10.3969C18.3295 10.371 18.3408 9.92858 18.3408 9.70053C18.3408 5.8599 16.5082 2.00037 12.0009 2C7.49403 2.00037 5.66113 5.8599 5.66113 9.70053C5.66113 9.92858 5.67237 10.371 5.67312 10.3969L4.76379 12.643C4.51453 13.2856 4.26827 13.955 4.08798 14.529C3.2285 17.2657 3.507 18.3982 3.71915 18.4238C4.17419 18.4779 5.49021 16.3635 5.49021 16.3635C5.49021 17.5879 6.12741 19.1858 7.5064 20.3398C6.99064 20.4971 6.35868 20.7388 5.95237 21.0355C5.58729 21.3025 5.63302 21.5743 5.69861 21.6841C5.9876 22.1661 10.6542 21.9918 12.0017 21.8417C13.3488 21.9918 18.0158 22.1661 18.3044 21.6841C18.3704 21.5743 18.4157 21.3025 18.0507 21.0355C17.6443 20.7388 17.012 20.4971 16.4959 20.3395C17.8745 19.1858 18.5117 17.5879 18.5117 16.3635C18.5117 16.3635 19.8281 18.4779 20.2831 18.4238C20.4949 18.3982 20.7734 17.2657 19.9139 14.529Z"></path></svg>'
  },
  {
    id: 3115,
    name: '微博2',
    english: 'Weibo',
    category: 'social',
    source: 'Remix Icons',
    tags: ['weibo', 'social', 'blog', '微博', '社交', '博客'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M4.27799 8.59201C7.05085 5.8217 10.282 4.55876 11.4966 5.77587C12.0338 6.31312 12.0848 7.23996 11.741 8.34757C11.5628 8.9052 12.2655 8.5971 12.2655 8.5971C14.5062 7.66008 16.4618 7.60407 17.1747 8.62511C17.5541 9.16746 17.5184 9.93133 17.1671 10.8149C17.0041 11.2223 17.2154 11.2859 17.5261 11.3776C18.789 11.7697 20.1945 12.7144 20.1945 14.3822C20.1945 17.1448 16.2148 20.6205 10.2311 20.6205C5.66569 20.6205 1.00098 18.4078 1.00098 14.7692C1.00098 12.8671 2.20535 10.6672 4.27799 8.59201ZM16.4108 14.3338C16.174 11.9429 13.0294 10.2954 9.38829 10.657C5.74717 11.016 2.9845 13.2465 3.2213 15.6375C3.4581 18.0309 6.60271 19.6758 10.2438 19.3168C13.885 18.9552 16.6451 16.7247 16.4108 14.3338ZM6.16221 14.4382C6.91589 12.9104 8.87395 12.0473 10.6079 12.4979C12.4005 12.9614 13.3146 14.6521 12.5838 16.2969C11.8403 17.98 9.70148 18.8763 7.88856 18.2906C6.13674 17.7254 5.39579 15.9965 6.16221 14.4382ZM8.8765 15.0162C8.31378 14.7794 7.58556 15.0238 7.23672 15.5687C6.88279 16.1162 7.0483 16.7705 7.60847 17.0252C8.17628 17.2823 8.93252 17.0379 9.2839 16.4752C9.63019 15.9074 9.44686 15.2581 8.8765 15.0162ZM10.2642 14.4382C10.0478 14.3542 9.77787 14.456 9.65056 14.6699C9.52834 14.8838 9.59709 15.1282 9.81352 15.2173C10.0325 15.309 10.3151 15.2046 10.4424 14.9856C10.5647 14.7666 10.4857 14.5197 10.2642 14.4382ZM15.9576 2.92408C17.9258 2.50649 20.0545 3.12017 21.5008 4.71918C22.947 6.31822 23.3341 8.50034 22.7204 10.4228C22.5796 10.8639 22.1036 11.1075 21.6612 10.9626C21.2181 10.8174 20.9762 10.3438 21.1188 9.90078C21.5568 8.54108 21.2806 6.98652 20.2531 5.84971C19.2244 4.71154 17.712 4.27613 16.3115 4.57404C15.8558 4.67099 15.41 4.37994 15.3109 3.92475C15.2115 3.46897 15.5018 3.02078 15.9576 2.92408ZM16.584 5.84971C17.5414 5.64601 18.5802 5.94392 19.283 6.72307C19.9858 7.50222 20.1742 8.56655 19.8737 9.49847C19.7511 9.87865 19.3409 10.089 18.9596 9.96443C18.5777 9.83967 18.3714 9.43227 18.4962 9.04779C18.6464 8.59201 18.5522 8.07258 18.2085 7.69064C17.8622 7.31125 17.3555 7.16611 16.887 7.26542C16.4949 7.35199 16.1104 7.09991 16.0263 6.71034C15.9423 6.31822 16.1917 5.93316 16.584 5.84971Z"></path></svg>'
  },
  {
    id: 3116,
    name: '抖音',
    english: 'TikTok',
    category: 'social',
    source: 'Remix Icons',
    tags: ['tiktok', 'social', 'video', '抖音', '社交', '视频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" fill="currentColor"/></svg>'
  },
  {
    id: 3117,
    name: '知乎',
    english: 'Zhihu',
    category: 'social',
    source: 'Remix Icons',
    tags: ['zhihu', 'social', 'qa', '知乎', '社交', '问答'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.373 18.897h1.452l.478 1.637 2.605-1.637h3.07V5.395h-7.605v13.502zM14.918 6.86h4.515v10.57h-1.732l-1.73 1.087-.314-1.084-.739-.003V6.861zm-2.83 4.712H8.846a70.3 70.3 0 0 0 .136-4.56h3.172s.122-1.4-.532-1.384H6.135c.216-.814.488-1.655.813-2.524 0 0-1.493 0-2 1.339-.211.552-.82 2.677-1.904 4.848.365-.04 1.573-.073 2.284-1.378.131-.366.156-.413.318-.902h1.79c0 .651-.074 4.151-.104 4.558h-3.24c-.729 0-.965 1.466-.965 1.466h4.066C6.92 16.131 5.456 18.74 2.8 20.8c1.27.363 2.536-.057 3.162-.614 0 0 1.425-1.297 2.206-4.298l3.346 4.03s.49-1.668-.077-2.481c-.47-.554-1.74-2.052-2.281-2.595l-.907.72c.27-.867.433-1.71.488-2.524h3.822s-.005-1.466-.47-1.466z" fill="currentColor"/></svg>'
  },
  {
    id: 3118,
    name: '晴天',
    english: 'Sunny',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['sunny', 'weather', 'sun', '晴天', '天气', '太阳'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-2a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" fill="currentColor"/></svg>'
  },
  {
    id: 3119,
    name: '多云',
    english: 'Cloudy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['cloudy', 'weather', 'cloud', '多云', '天气', '云'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.5 6a6.5 6.5 0 0 0 0 13h7a4.5 4.5 0 1 0-.957-8.898A6.502 6.502 0 0 0 9.5 6zm7 15h-7a8.5 8.5 0 1 1 7.215-13.024 6.5 6.5 0 0 1 .785 13.024z" fill="currentColor"/></svg>'
  },
  {
    id: 3120,
    name: '雨天',
    english: 'Rainy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['rainy', 'weather', 'rain', '雨天', '天气', '雨'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16 18v-2h1a4 4 0 1 0-2.157-7.37A6 6 0 1 0 8 15.917v2.022A8.001 8.001 0 0 1 9 2a7.998 7.998 0 0 1 6.98 4.087A6 6 0 1 1 17 18h-1zm-5.768.732L12 16.964l1.768 1.768a2.5 2.5 0 1 1-3.536 0z" fill="currentColor"/></svg>'
  },
  {
    id: 3121,
    name: '雪天',
    english: 'Snowy',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['snowy', 'weather', 'snow', '雪天', '天气', '雪'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 16.268l1.964-1.134 1 1.732L14 18l1.964 1.134-1 1.732L13 19.732V22h-2v-2.268l-1.964 1.134-1-1.732L10 18l-1.964-1.134 1-1.732L11 16.268V14h2v2.268zM17 18v-2h.5a3.5 3.5 0 1 0-2.5-5.95V10a6 6 0 1 0-8 5.659v2.089a8 8 0 1 1 9.458-10.65A5.5 5.5 0 1 1 17.5 18l-.5-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3122,
    name: '闪电',
    english: 'Lightning',
    category: 'weather',
    source: 'Remix Icons',
    tags: ['lightning', 'weather', 'thunder', '闪电', '天气', '雷电'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 9h9l-5 7h4l-8 8 2-8h-4l2-7zm-2 15L7 19h-4l6-7H2l5-7h9L9 15h4l-2 9z" fill="currentColor"/></svg>'
  },
  {
    id: 3123,
    name: '笑脸',
    english: 'Smile',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['smile', 'emoji', 'happy', '笑脸', '表情', '开心'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-4 6h2v2H8v-2zm8 0h2v2h-2v-2zm-5 6h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3124,
    name: '哭脸',
    english: 'Cry',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['cry', 'emoji', 'sad', '哭脸', '表情', '伤心'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm-4 13a6 6 0 1 1 8 0h-8zm-1-8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/></svg>'
  },
  {
    id: 3125,
    name: '生气',
    english: 'Angry',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['angry', 'emoji', 'mad', '生气', '表情', '愤怒'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-4-5h8a4 4 0 1 1-8 0zm-1-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/></svg>'
  },
  {
    id: 3126,
    name: '惊讶',
    english: 'Surprised',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['surprised', 'emoji', 'shocked', '惊讶', '表情', '震惊'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM7 13h2a3 3 0 0 0 6 0h2a5 5 0 0 1-10 0zm1-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/></svg>'
  },
  {
    id: 3127,
    name: '疑惑',
    english: 'Confused',
    category: 'emoji',
    source: 'Remix Icons',
    tags: ['confused', 'emoji', 'puzzled', '疑惑', '表情', '困惑'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-4-7h8v2H8v-2zm0-3a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" fill="currentColor"/></svg>'
  },
  {
    id: 3128,
    name: '系统',
    english: 'System',
    category: 'system',
    source: 'Remix Icons',
    tags: ['system', 'settings', 'control', '系统', '设置', '控制'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-7h2v2h-2v-2zm2-1.645V12h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 11.355z" fill="currentColor"/></svg>'
  },
  {
    id: 3129,
    name: '通知',
    english: 'Notification',
    category: 'system',
    source: 'Remix Icons',
    tags: ['notification', 'alert', 'bell', '通知', '提醒', '铃铛'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 18h14v-6.969C19 7.148 15.866 4 12 4s-7 3.148-7 7.031V18zm7-16c4.97 0 9 4.043 9 9.031V20H3v-8.969C3 6.043 7.03 2 12 2zM9.5 21h5a2.5 2.5 0 1 1-5 0z" fill="currentColor"/></svg>'
  },
  {
    id: 3130,
    name: '安全',
    english: 'Security',
    category: 'system',
    source: 'Remix Icons',
    tags: ['security', 'shield', 'protect', '安全', '防护', '保护'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 1l9.5 5.5v11L12 23l-9.5-5.5v-11L12 1zm0 2.311L4.5 7.653v8.694l7.5 4.342 7.5-4.342V7.653L12 3.311zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3131,
    name: '帮助',
    english: 'Help',
    category: 'system',
    source: 'Remix Icons',
    tags: ['help', 'question', 'support', '帮助', '问题', '支持'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 13.355z" fill="currentColor"/></svg>'
  },
  {
    id: 3132,
    name: '信息',
    english: 'Info',
    category: 'system',
    source: 'Remix Icons',
    tags: ['info', 'information', 'about', '信息', '关于', '说明'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z" fill="currentColor"/></svg>'
  },
  {
    id: 3133,
    name: '向上箭头',
    english: 'Arrow Up',
    category: 'arrow',
    source: 'Remix Icons',
    tags: ['arrow', 'up', 'direction', '箭头', '向上', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.0001 7.82843V20h-2V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"/></svg>'
  },
  {
    id: 3134,
    name: '向下箭头',
    english: 'Arrow Down',
    category: 'arrow',
    source: 'Remix Icons',
    tags: ['arrow', 'down', 'direction', '箭头', '向下', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.0001 16.1716V4H11.0001V16.1716L5.63614 10.8076L4.22192 12.2218L12.0001 20L19.7783 12.2218L18.3641 10.8076L13.0001 16.1716Z"/></svg>'
  },
  {
    id: 3135,
    name: '向左箭头',
    english: 'Arrow Left',
    category: 'arrow',
    source: 'Remix Icons',
    tags: ['arrow', 'left', 'direction', '箭头', '向左', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.82843 13.0001H20V11.0001H7.82843L13.1924 5.63614L11.7782 4.22192L4 12.0001L11.7782 19.7783L13.1924 18.3641L7.82843 13.0001Z"/></svg>'
  },
  {
    id: 3136,
    name: '向右箭头',
    english: 'Arrow Right',
    category: 'arrow',
    source: 'Remix Icons',
    tags: ['arrow', 'right', 'direction', '箭头', '向右', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.1716 13.0001H4V11.0001H16.1716L10.8076 5.63614L12.2218 4.22192L20 12.0001L12.2218 19.7783L10.8076 18.3641L16.1716 13.0001Z"/></svg>'
  },
  {
    id: 3137,
    name: '双向箭头',
    english: 'Arrow Both',
    category: 'arrow',
    source: 'Remix Icons',
    tags: ['arrow', 'both', 'direction', '箭头', '双向', '方向'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.05 12.05L21 17l-4.95 4.95-1.414-1.414L17.172 18H6.828l2.536 2.536L7.95 21.95 3 17l4.95-4.95 1.414 1.414L6.828 16h10.344l-2.536-2.536 1.414-1.414zm-8.1-10l1.414 1.414L6.828 6h10.344l-2.536-2.536L16.05 2.05 21 7l-4.95 4.95-1.414-1.414L17.172 8H6.828l2.536 2.536L7.95 11.95 3 7l4.95-4.95z" fill="currentColor"/></svg>'
  },
  {
    id: 3138,
    name: '撤销',
    english: 'Undo',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['undo', 'back', 'revert', '撤销', '返回', '恢复'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5.828 7l2.536 2.536L6.95 10.95 2 6l4.95-4.95 1.414 1.414L5.828 5H13a8 8 0 1 1 0 16H4v-2h9a6 6 0 1 0 0-12H5.828z" fill="currentColor"/></svg>'
  },
  {
    id: 3139,
    name: '重做',
    english: 'Redo',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['redo', 'forward', 'repeat', '重做', '前进', '重复'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.172 7H11a6 6 0 1 0 0 12h9v2h-9a8 8 0 1 1 0-16h7.172l-2.536-2.536L17.05 1.05 22 6l-4.95 4.95-1.414-1.414L18.172 7z" fill="currentColor"/></svg>'
  },
  {
    id: 3140,
    name: '复制',
    english: 'Copy',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['copy', 'duplicate', 'clone', '复制', '副本', '克隆'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 6V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7zM5.003 8L5 20h10V8H5.003zM9 6h8v10h2V4H9v2z" fill="currentColor"/></svg>'
  },
  {
    id: 3141,
    name: '粘贴',
    english: 'Paste',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['paste', 'clipboard', 'copy', '粘贴', '剪贴板', '复制'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 4v4h12V4h2.007c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 21.007V4.993C3 4.445 3.445 4 3.993 4H6zm2-2h8v4H8V2z" fill="currentColor"/></svg>'
  },
  {
    id: 3142,
    name: '剪切',
    english: 'Cut',
    category: 'edit',
    source: 'Remix Icons',
    tags: ['cut', 'scissors', 'clip', '剪切', '剪刀', '裁剪'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.879 12L7.562 9.683a4 4 0 1 1 2.121-2.121L12 9.88l6.374-6.375a2 2 0 0 1 2.829 0l.707.707L9.683 16.438a4 4 0 1 1-2.121-2.121L9.88 12zM6 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm9.535-6.587l6.375 6.376-.707.707a2 2 0 0 1-2.829 0l-4.96-4.961 2.12-2.122z" fill="currentColor"/></svg>'
  },
  {
    id: 3143,
    name: '购物车',
    english: 'Shopping Cart',
    category: 'business',
    source: 'Remix Icons',
    tags: ['shopping', 'cart', 'buy', '购物车', '购买', '商店'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 16V4H2V2h3a1 1 0 0 1 1 1v12h12.438l2-8H8V5h13.72a1 1 0 0 1 .97 1.243l-2.5 10a1 1 0 0 1-.97.757H5a1 1 0 0 1-1-1zm2 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" fill="currentColor"/></svg>'
  },
  {
    id: 3144,
    name: '商店',
    english: 'Store',
    category: 'business',
    source: 'Remix Icons',
    tags: ['store', 'shop', 'market', '商店', '店铺', '市场'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M21 11.646V21a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9.354A3.985 3.985 0 0 1 2 9V3a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v6c0 1.014-.378 1.94-1 2.646zm-2 1.228a4.007 4.007 0 0 1-4-1.228A3.99 3.99 0 0 1 12 13a3.99 3.99 0 0 1-3-1.354 3.99 3.99 0 0 1-4 1.228V20h14v-7.126zM14 9a1 1 0 0 1 2 0 2 2 0 1 0 4 0V4H4v5a2 2 0 1 0 4 0 1 1 0 1 1 2 0 2 2 0 1 0 4 0z" fill="currentColor"/></svg>'
  },
  {
    id: 3145,
    name: '订单',
    english: 'Order',
    category: 'business',
    source: 'Remix Icons',
    tags: ['order', 'list', 'bill', '订单', '清单', '账单'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19 22H5a3 3 0 0 1-3-3V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v12h4v4a3 3 0 0 1-3 3zm-1-5v2a1 1 0 0 0 2 0v-2h-2zm-2 3V4H4v15a1 1 0 0 0 1 1h11zM6 7h8v2H6V7zm0 4h8v2H6v-2zm0 4h8v2H6v-2zm0 4h8v2H6v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3146,
    name: '礼物',
    english: 'Gift',
    category: 'business',
    source: 'Remix Icons',
    tags: ['gift', 'present', 'box', '礼物', '礼品', '礼盒'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M15 2a4 4 0 0 1 3.464 6.001L23 8v2h-2v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10H1V8l4.536.001A4 4 0 0 1 12 3.355 3.983 3.983 0 0 1 15 2zm-4 8H5v9h6v-9zm8 0h-6v9h6v-9zM9 4a2 2 0 0 0-.15 3.995L9 8h2V6a2 2 0 0 0-1.697-1.977l-.154-.018L9 4zm6 0a2 2 0 0 0-1.995 1.85L13 6v2h2a2 2 0 0 0 1.995-1.85L17 6a2 2 0 0 0-2-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3147,
    name: '优惠券',
    english: 'Coupon',
    category: 'business',
    source: 'Remix Icons',
    tags: ['coupon', 'discount', 'ticket', '优惠券', '折扣', '票券'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 9.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v5.5a2.5 2.5 0 1 0 0 5V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-5.5a2.5 2.5 0 1 0 0-5zm2-1.532a4.5 4.5 0 0 1 0 8.064V19h16v-2.968a4.5 4.5 0 0 1 0-8.064V5H4v2.968zM9 9h6v2H9V9zm0 4h6v2H9v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3146,
    name: '钱包',
    english: 'Wallet',
    category: 'finance',
    source: 'Remix Icons',
    tags: ['wallet', 'money', 'payment', '钱包', '金钱', '支付'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18 7h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h15v4zM4 9v10h16V9H4zm0-4v2h12V5H4zm11 8h3v2h-3v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3147,
    name: '银行卡',
    english: 'Bank Card',
    category: 'finance',
    source: 'Remix Icons',
    tags: ['card', 'credit', 'bank', '银行卡', '信用卡', '储蓄卡'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M22 10v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V10h20zm0-2H2V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v4zm-7 8v2h4v-2h-4z" fill="currentColor"/></svg>'
  },
  {
    id: 3148,
    name: '红包',
    english: 'Red Packet',
    category: 'finance',
    source: 'Remix Icons',
    tags: ['red packet', 'money', 'gift', '红包', '压岁钱', '礼金'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M21 3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm-1 2H4v14h16V5zM9.399 8.399a1.5 1.5 0 1 1 2.121-2.121 1.5 1.5 0 0 1-2.121 2.121zM14.601 8.399a1.5 1.5 0 1 1 2.121-2.121 1.5 1.5 0 0 1-2.121 2.121zM12 13.191l6.646 3.823-1.291 2.248L12 15.66l-5.354 3.602-1.291-2.248L12 13.19z" fill="currentColor"/></svg>'
  },
  {
    id: 3149,
    name: '账单',
    english: 'Bill',
    category: 'finance',
    source: 'Remix Icons',
    tags: ['bill', 'invoice', 'receipt', '账单', '发票', '收据'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM8 9h8v2H8V9zm0 4h8v2H8v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3150,
    name: '金币',
    english: 'Coin',
    category: 'finance',
    source: 'Remix Icons',
    tags: ['coin', 'money', 'currency', '金币', '钱币', '货币'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 4c6.075 0 11 2.686 11 6v4c0 3.314-4.925 6-11 6-5.967 0-10.824-2.591-10.995-5.823L1 14v-4c0-3.314 4.925-6 11-6zm0 12c-3.72 0-7.01-1.007-9-2.55V14c0 1.882 3.883 4 9 4 5.01 0 8.838-2.03 8.995-3.882L21 14l.001-.55C19.011 14.992 15.721 16 12 16zm0-10c-5.117 0-9 2.118-9 4 0 1.882 3.883 4 9 4s9-2.118 9-4c0-1.882-3.883-4-9-4z" fill="currentColor"/></svg>'
  },
  {
    id: 3151,
    name: '支付',
    english: 'Payment',
    category: 'finance',
    source: 'Remix Icons',
    tags: ['payment', 'pay', 'money', '支付', '付款', '金钱'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm17 8H4v8h16v-8zm0-2V5H4v4h16zm-6 6h4v2h-4v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3152,
    name: '电脑',
    english: 'Computer',
    category: 'device',
    source: 'Remix Icons',
    tags: ['computer', 'laptop', 'pc', '电脑', '笔记本', '个人电脑'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 16h16V5H4v11zm9 2v2h4v2H7v-2h4v-2H2.992A.998.998 0 0 1 2 16.993V4.007C2 3.451 2.455 3 2.992 3h18.016c.548 0 .992.449.992 1.007v12.986c0 .556-.455 1.007-.992 1.007H13z" fill="currentColor"/></svg>'
  },
  {
    id: 3153,
    name: '手机',
    english: 'Mobile',
    category: 'device',
    source: 'Remix Icons',
    tags: ['mobile', 'phone', 'smartphone', '手机', '电话', '智能手机'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 4v16h10V4H7zM6 2h12a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zm6 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3154,
    name: '平板',
    english: 'Tablet',
    category: 'device',
    source: 'Remix Icons',
    tags: ['tablet', 'ipad', 'device', '平板', '平板电脑', '设备'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 4v16h12V4H6zM5 2h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm7 15a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3155,
    name: '打印机',
    english: 'Printer',
    category: 'device',
    source: 'Remix Icons',
    tags: ['printer', 'print', 'device', '打印机', '打印', '设备'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 17h10v-4H7v4zm12 3v-2h-1v-5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v5H5v2h14zM7 4v5h10V4H7zM6 2h12a1 1 0 0 1 1 1v3H5V3a1 1 0 0 1 1-1zm1 11h10v1H7v-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3156,
    name: '相机',
    english: 'Camera',
    category: 'device',
    source: 'Remix Icons',
    tags: ['camera', 'photo', 'picture', '相机', '照片', '图片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9.828 5l-2 2H4v12h16V7h-3.828l-2-2H9.828zM9 3h6l2 2h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4l2-2zm3 15a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zm0-2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" fill="currentColor"/></svg>'
  },
  {
    id: 3157,
    name: '耳机',
    english: 'Headphone',
    category: 'device',
    source: 'Remix Icons',
    tags: ['headphone', 'headset', 'audio', '耳机', '听筒', '音频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 4a8 8 0 0 0-8 8h3a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7C2 6.477 6.477 2 12 2s10 4.477 10 10v7a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h3a8 8 0 0 0-8-8zM4 14v5h3v-5H4zm13 0v5h3v-5h-3z" fill="currentColor"/></svg>'
  },
  {
    id: 3158,
    name: '键盘',
    english: 'Keyboard',
    category: 'device',
    source: 'Remix Icons',
    tags: ['keyboard', 'input', 'device', '键盘', '输入', '设备'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 17h18v2H3v-2zm0-6h3v3H3v-3zm5 0h3v3H8v-3zm5 0h3v3h-3v-3zm5 0h3v3h-3v-3zM3 5h3v3H3V5zm5 0h3v3H8V5zm5 0h3v3h-3V5zm5 0h3v3h-3V5z" fill="currentColor"/></svg>'
  },
  {
    id: 3159,
    name: '鼠标',
    english: 'Mouse',
    category: 'device',
    source: 'Remix Icons',
    tags: ['mouse', 'cursor', 'device', '鼠标', '光标', '设备'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M11.141 4c-1.582 0-2.872 1.308-2.872 2.909v11.182c0 1.601 1.29 2.909 2.872 2.909h1.718c1.582 0 2.872-1.308 2.872-2.909V6.909C15.731 5.308 14.441 4 12.859 4h-1.718zM12 7a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V8a1 1 0 0 1 1-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3160,
    name: '显示器',
    english: 'Monitor',
    category: 'device',
    source: 'Remix Icons',
    tags: ['monitor', 'screen', 'display', '显示器', '屏幕', '显示屏'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M20 3H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4v2H7a1 1 0 0 0 0 2h10a1 1 0 0 0 0-2h-1v-2h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 11H5V5h14v9z" fill="currentColor"/></svg>'
  },
  {
    id: 3161,
    name: '摄像头',
    english: 'Webcam',
    category: 'device',
    source: 'Remix Icons',
    tags: ['webcam', 'camera', 'video', '摄像头', '相机', '视频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="currentColor"/></svg>'
  },
  {
    id: 3162,
    name: '麦克风',
    english: 'Microphone',
    category: 'device',
    source: 'Remix Icons',
    tags: ['microphone', 'mic', 'audio', '麦克风', '话筒', '音频'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zm0-2a5 5 0 0 1 5 5v4a5 5 0 0 1-10 0V6a5 5 0 0 1 5-5zM3.055 11H5.07a7.002 7.002 0 0 0 13.858 0h2.016A9.004 9.004 0 0 1 13 18.945V23h-2v-4.055A9.004 9.004 0 0 1 3.055 11z" fill="currentColor"/></svg>'
  },
  {
    id: 3163,
    name: '路由器',
    english: 'Router',
    category: 'device',
    source: 'Remix Icons',
    tags: ['router', 'wifi', 'network', '路由器', '无线', '网络'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M11 14v-3h7v3h-7zm-1 1h9v-5h-9v5zM4 14v-3h7v3H4zm-1 1h9v-5H3v5zm10-9v3h7V6h-7zm-1-1h9V0h-9v5zM4 2v3h7V2H4zM3 1h9V-4H3v5z" fill="currentColor"/></svg>'
  },
  {
    id: 3164,
    name: '电池',
    english: 'Battery',
    category: 'device',
    source: 'Remix Icons',
    tags: ['battery', 'power', 'energy', '电池', '电量', '能源'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 7v10h14V7H4zM3 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm18 4h2v6h-2V9z" fill="currentColor"/></svg>'
  },
  {
    id: 3165,
    name: '充电器',
    english: 'Charger',
    category: 'device',
    source: 'Remix Icons',
    tags: ['charger', 'power', 'plug', '充电器', '电源', '插头'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 12h3l-5 7v-5H8l5-7v5zm-2-6H7v14h10V6h-4V4h-2v2zM9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zm1 11h10v1H7v-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3166,
    name: 'U盘',
    english: 'USB Drive',
    category: 'device',
    source: 'Remix Icons',
    tags: ['usb', 'drive', 'storage', 'U盘', '优盘', '存储'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 1l3 5h-2v7.381l3-1.499-.001-.882H15V7h4v4h-1.001L18 13.118l-5 2.5v1.764l3.001 1.755.002-1.137H17v4h-4v-3h-2v3H7v-4h.999l.001 1.137 3-1.755v-1.764l-5-2.5-.001-2.118H5V7h4v4h-1v.882l3 1.499V6H9l3-5zm-1 13.618l-2 1V18.5l2 1.168 2-1.168v-2.882l-2-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3167,
    name: '硬盘',
    english: 'Hard Drive',
    category: 'device',
    source: 'Remix Icons',
    tags: ['hard drive', 'disk', 'storage', '硬盘', '磁盘', '存储'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M5 10.938A8.004 8.004 0 0 0 11.938 4H5v6.938zm0 2.013V20h14V4h-6.938A8.004 8.004 0 0 0 5 12.95zM4 2h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zm11 14h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3168,
    name: '内存',
    english: 'Memory',
    category: 'device',
    source: 'Remix Icons',
    tags: ['memory', 'ram', 'chip', '内存', '芯片', '存储'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 7h2v10H3V7zm4 0h2v10H7V7zm4 0h2v10h-2V7zm4 0h2v10h-2V7zm4 0h2v10h-2V7zM2 5h20v14H2V5zm2-2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm18 4h2v6h-2V9z" fill="currentColor"/></svg>'
  },
  {
    id: 3169,
    name: 'CPU',
    english: 'CPU',
    category: 'device',
    source: 'Remix Icons',
    tags: ['cpu', 'processor', 'chip', 'cpu', '处理器', '芯片'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M6 18h12V6H6v12zm-2 2V4h16v16H4zM8 8h8v8H8V8zm1 1v6h6V9H9zm2 2h2v2h-2v-2z" fill="currentColor"/></svg>'
  },
  {
    id: 3170,
    name: '打印',
    english: 'Print',
    category: 'device',
    source: 'Remix Icons',
    tags: ['print', 'printer', 'paper', '打印', '打印机', '纸张'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7 17h10v-4H7v4zm12 3v-2h-1v-5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v5H5v2h14zM7 4v5h10V4H7zM6 2h12a1 1 0 0 1 1 1v3H5V3a1 1 0 0 1 1-1zm1 11h10v1H7v-1z" fill="currentColor"/></svg>'
  },
  {
    id: 3171,
    name: '扫描',
    english: 'Scan',
    category: 'device',
    source: 'Remix Icons',
    tags: ['scan', 'scanner', 'qr', '扫描', '扫码', '二维码'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M4.257 5.671L12 13.414 13.414 12 5.671 4.257A9.959 9.959 0 0 1 12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12c0-2.401.846-4.605 2.257-6.329z" fill="currentColor"/></svg>'
  },
  {
    id: 3172,
    name: '投影',
    english: 'Projector',
    category: 'device',
    source: 'Remix Icons',
    tags: ['projector', 'presentation', 'screen', '投影', '投影仪', '屏幕'],
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm8.126 9H4v7h16v-7h-7.126zM4 5v4h16V5H4zm8 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="currentColor"/></svg>'
  },
  {
    id: 3173,
    name: '向上箭头',
    english: 'Arrow Up',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'up', 'direction', '箭头', '向上', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.0001 7.82843V20h-2V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"/></svg>'
  },
  {
    id: 3174,
    name: '向下箭头',
    english: 'Arrow Down',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'down', 'direction', '箭头', '向下', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.0001 16.1716V4H11.0001V16.1716L5.63614 10.8076L4.22192 12.2218L12.0001 20L19.7783 12.2218L18.3641 10.8076L13.0001 16.1716Z"/></svg>'
  },
  {
    id: 3175,
    name: '向左箭头',
    english: 'Arrow Left',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'left', 'direction', '箭头', '向左', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M7.82843 13.0001H20V11.0001H7.82843L13.1924 5.63614L11.7782 4.22192L4 12.0001L11.7782 19.7783L13.1924 18.3641L7.82843 13.0001Z"/></svg>'
  },
  {
    id: 3176,
    name: '向右箭头',
    english: 'Arrow Right',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'right', 'direction', '箭头', '向右', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.1716 13.0001H4V11.0001H16.1716L10.8076 5.63614L12.2218 4.22192L20 12.0001L12.2218 19.7783L10.8076 18.3641L16.1716 13.0001Z"/></svg>'
  },
  {
    id: 3177,
    name: '圆形向上箭头',
    english: 'Arrow Up Circle',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'up', 'circle', 'direction', '箭头', '向上', '圆形', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 13.5l-4.243-4.242 1.415-1.414L12 12.67l2.828-2.828 1.415 1.414L12 15.5z"/></svg>'
  },
  {
    id: 3178,
    name: '圆形向下箭头',
    english: 'Arrow Down Circle',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'down', 'circle', 'direction', '箭头', '向下', '圆形', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 6.5l-4.243 4.242 1.415 1.414L12 11.33l2.828 2.828 1.415-1.414L12 8.5z"/></svg>'
  },
  {
    id: 3179,
    name: '圆形向左箭头',
    english: 'Arrow Left Circle',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'left', 'circle', 'direction', '箭头', '向左', '圆形', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm3.5 10l-4.242-4.243-1.414 1.415L12.67 12l-2.828 2.828 1.414 1.415L15.5 12z"/></svg>'
  },
  {
    id: 3180,
    name: '圆形向右箭头',
    english: 'Arrow Right Circle',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'right', 'circle', 'direction', '箭头', '向右', '圆形', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-3.5 10l4.242-4.243 1.414 1.415L11.33 12l2.828 2.828-1.414 1.415L8.5 12z"/></svg>'
  },
  {
    id: 3181,
    name: '方框向上箭头',
    english: 'Arrow Up Box',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'up', 'box', 'direction', '箭头', '向上', '方框', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9 13.5l4.243-4.242-1.415-1.414L13 12.67V8h-2v4.67l-1.828-1.828-1.415 1.414L12 16.5z"/></svg>'
  },
  {
    id: 3182,
    name: '方框向下箭头',
    english: 'Arrow Down Box',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'down', 'box', 'direction', '箭头', '向下', '方框', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9 7.5l-4.243 4.242 1.415 1.414L11 14.33V19h2v-4.67l1.828 1.828 1.415-1.414L12 10.5z"/></svg>'
  },
  {
    id: 3183,
    name: '方框向左箭头',
    english: 'Arrow Left Box',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'left', 'box', 'direction', '箭头', '向左', '方框', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9.5 11l4.242-4.242-1.414-1.414L12.5 11.172V8h-2v3.172L7.672 8.344 6.258 9.758 10.5 14z" transform="rotate(-90 12 12)"/></svg>'
  },
  {
    id: 3184,
    name: '方框向右箭头',
    english: 'Arrow Right Box',
    category: 'navigation',
    source: 'Remix Icons',
    tags: ['arrow', 'right', 'box', 'direction', '箭头', '向右', '方框', '方向'],
    svg: '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9.5 11l4.242-4.242-1.414-1.414L12.5 11.172V8h-2v3.172L7.672 8.344 6.258 9.758 10.5 14z" transform="rotate(90 12 12)"/></svg>'
  },
  // LinkedIn (线框)
{
  id: 3185,
  name: 'LinkedIn',
  english: 'LinkedIn',
  category: 'social',
  source: 'Remix Icons',
  tags: ['linkedin', 'social', 'professional', 'linkedin', '社交', '职场'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>'
},

// LinkedIn (填充)
{
  id: 3186,
  name: 'LinkedIn 填充',
  english: 'LinkedIn Fill',
  category: 'social',
  source: 'Remix Icons',
  tags: ['linkedin', 'social', 'professional', 'linkedin', '社交', '职场', '填充'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M18.3362 18.339H15.6707V14.1622C15.6707 13.1662 15.6505 11.8845 14.2817 11.8845C12.892 11.8845 12.6797 12.9683 12.6797 14.0887V18.339H10.0142V9.75H12.5747V10.9207H12.6092C12.967 10.2457 13.837 9.53325 15.1367 9.53325C17.8375 9.53325 18.337 11.3108 18.337 13.6245V18.339H18.3362ZM7.00373 8.57475C6.14573 8.57475 5.45648 7.88025 5.45648 7.026C5.45648 6.1725 6.14648 5.47875 7.00373 5.47875C7.85873 5.47875 8.55173 6.1725 8.55173 7.026C8.55173 7.88025 7.85798 8.57475 7.00373 8.57475ZM8.34023 18.339H5.66723V9.75H8.34023V18.339ZM19.6697 3H4.32923C3.59498 3 3.00098 3.5805 3.00098 4.29675V19.7033C3.00098 20.4202 3.59498 21 4.32923 21H19.6697C20.404 21 21.001 20.4202 21.001 19.7033V4.29675C21.001 3.5805 20.404 3 19.6697 3Z"></path></svg>'
},

// YouTube (线框)
{
  id: 3187,
  name: 'YouTube',
  english: 'YouTube',
  category: 'social',
  source: 'Remix Icons',
  tags: ['youtube', 'video', 'social', 'youtube', '视频', '社交'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>'
},

// YouTube (填充)
{
  id: 3188,
  name: 'YouTube 填充',
  english: 'YouTube Fill',
  category: 'social',
  source: 'Remix Icons',
  tags: ['youtube', 'video', 'social', 'youtube', '视频', '社交', '填充'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12.244 4C12.162 4 8.272 4 6.406 4.432C5.216 4.752 4.432 5.528 4.108 6.72C3.676 8.576 3.676 12 3.676 12C3.676 12 3.676 15.424 4.108 17.28C4.432 18.472 5.216 19.248 6.406 19.568C8.272 20 12.162 20 12.244 20C12.326 20 16.216 20 18.082 19.568C19.272 19.248 20.056 18.472 20.38 17.28C20.812 15.424 20.812 12 20.812 12C20.812 12 20.812 8.576 20.38 6.72C20.056 5.528 19.272 4.752 18.082 4.432C16.216 4 12.326 4 12.244 4ZM10.028 8.272L15.892 12L10.028 15.728V8.272Z"></path></svg>'
},

// Discord (线框)
{
  id: 3189,
  name: 'Discord',
  english: 'Discord',
  category: 'social',
  source: 'Remix Icons',
  tags: ['discord', 'chat', 'social', 'discord', '聊天', '社交'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.317 4.492C18.787 3.802 17.147 3.292 15.432 3C15.23 3.367 14.992 3.876 14.821 4.285C13.009 4.012 11.215 4.012 9.426 4.285C9.255 3.876 9.009 3.367 8.807 3C7.091 3.292 5.45 3.802 3.921 4.492C0.668 9.293 -0.216 13.972 0.225 18.578C2.145 20.01 4.001 20.863 5.83 21.439C6.246 20.872 6.616 20.271 6.936 19.638C6.293 19.388 5.676 19.077 5.091 18.719C5.262 18.592 5.429 18.459 5.591 18.323C9.266 20.013 13.271 20.013 16.898 18.323C17.061 18.459 17.228 18.592 17.398 18.719C16.813 19.077 16.195 19.388 15.553 19.638C15.873 20.271 16.242 20.872 16.659 21.439C18.488 20.863 20.345 20.01 22.264 18.578C22.78 13.276 21.436 8.644 20.317 4.492ZM7.544 15.906C6.462 15.906 5.579 14.917 5.579 13.716C5.579 12.515 6.445 11.526 7.544 11.526C8.644 11.526 9.527 12.515 9.51 13.716C9.51 14.917 8.644 15.906 7.544 15.906ZM15.845 15.906C14.763 15.906 13.88 14.917 13.88 13.716C13.88 12.515 14.746 11.526 15.845 11.526C16.945 11.526 17.828 12.515 17.811 13.716C17.811 14.917 16.945 15.906 15.845 15.906Z"></path></svg>'
},

// Discord (填充)
{
  id: 3190,
  name: 'Discord 填充',
  english: 'Discord Fill',
  category: 'social',
  source: 'Remix Icons',
  tags: ['discord', 'chat', 'social', 'discord', '聊天', '社交', '填充'],
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.492C18.787 3.802 17.147 3.292 15.432 3C15.23 3.367 14.992 3.876 14.821 4.285C13.009 4.012 11.215 4.012 9.426 4.285C9.255 3.876 9.009 3.367 8.807 3C7.091 3.292 5.45 3.802 3.921 4.492C0.668 9.293 -0.216 13.972 0.225 18.578C2.145 20.01 4.001 20.863 5.83 21.439C6.246 20.872 6.616 20.271 6.936 19.638C6.293 19.388 5.676 19.077 5.091 18.719C5.262 18.592 5.429 18.459 5.591 18.323C9.266 20.013 13.271 20.013 16.898 18.323C17.061 18.459 17.228 18.592 17.398 18.719C16.813 19.077 16.195 19.388 15.553 19.638C15.873 20.271 16.242 20.872 16.659 21.439C18.488 20.863 20.345 20.01 22.264 18.578C22.78 13.276 21.436 8.644 20.317 4.492ZM7.544 15.906C6.462 15.906 5.579 14.917 5.579 13.716C5.579 12.515 6.445 11.526 7.544 11.526C8.644 11.526 9.527 12.515 9.51 13.716C9.51 14.917 8.644 15.906 7.544 15.906ZM15.845 15.906C14.763 15.906 13.88 14.917 13.88 13.716C13.88 12.515 14.746 11.526 15.845 11.526C16.945 11.526 17.828 12.515 17.811 13.716C17.811 14.917 16.945 15.906 15.845 15.906Z"></path></svg>'
}


]

// 合并所有图标
export const allIcons = [...featherIcons, ...remixIcons]

// 根据分类获取图标
export const getIconsByCategory = (category: string): IconItem[] => {
  if (category === 'all') {
    return allIcons;
  }
  return allIcons.filter(icon => icon.category === category);
}

// 获取所有图标数量
export const getTotalIconCount = (): number => {
  return allIcons.length;
}

// 根据关键词搜索图标
export const searchIcons = (keyword: string): IconItem[] => {
  const lowerKeyword = keyword.toLowerCase();
  return allIcons.filter(icon =>
    icon.name.toLowerCase().includes(lowerKeyword) ||
    icon.english.toLowerCase().includes(lowerKeyword) ||
    icon.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}

// 获取分类下的图标数量
export const getCategoryCount = (category: string): number => {
  if (category === 'all') {
    return allIcons.length;
  }
  return allIcons.filter(icon => icon.category === category).length;
}
