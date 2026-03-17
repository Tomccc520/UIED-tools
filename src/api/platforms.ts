import zhihuIcon from '@/assets/zhihu.svg'
import bilibiliIcon from '@/assets/bilibili.svg'
import juejinIcon from '@/assets/juejin.svg'
import baiduIcon from '@/assets/baidu.svg'
import douyinIcon from '@/assets/douyin.svg'
import tiebaIcon from '@/assets/tieba.svg'
import sspaiIcon from '@/assets/sspai.svg'
import ithomeIcon from '@/assets/ithome.svg'
import thepaperIcon from '@/assets/pengpai.svg'
import toutiaoIcon from '@/assets/toutiao.svg'
import weiboIcon from '@/assets/weibo.svg'
import kr36Icon from '@/assets/36kr.svg'
import qqnewsIcon from '@/assets/qqnews.svg'
import uiedIcon from '@/assets/uiedlogo.png'
import acfunIcon from '@/assets/acfun.svg'
import doubanIcon from '@/assets/douban.svg'
import weixinIcon from '@/assets/weixin.svg'
import jianshuIcon from '@/assets/jianshu.svg'
import weatherIcon from '@/assets/weather.svg'
import historyIcon from '@/assets/history.svg'
import netease163Icon from '@/assets/163.svg'

interface HotItem {
  title: string;
  url: string;
  hot: string | number;
}

// 定义平台 API 接口
interface PlatformAPI {
  name: string;
  id: string;
  type: string;
  icon: string;
  endpoint: string;
  category: string; // 添加分类字段
  transform: (data: any) => HotItem[];
}

// 统一的数据转换函数
const transformData = (data: any): HotItem[] => {
  // 检查返回数据格式
  if (!data) {
    console.warn('API返回数据为空:', data);
    return [];
  }

  // 检查 API 响应状态码
  if (data.code !== 200) {
    console.warn('API返回错误状态码:', data.code, data.msg || '未知错误');
    return [];
  }

  // 获取数据数组
  let responseData = data.data;

  // 如果 data 是字符串，尝试解析
  if (typeof responseData === 'string') {
    try {
      responseData = JSON.parse(responseData);
    } catch (e) {
      console.warn('解析data字符串失败:', e);
      return [];
    }
  }

  // 处理可能的嵌套数据结构
  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    if (responseData.list) {
      responseData = responseData.list;
    } else if (responseData.items) {
      responseData = responseData.items;
    }
  }

  if (!Array.isArray(responseData)) {
    console.warn('API返回数据格式不正确:', data);
    return [];
  }

  return responseData.map((item: any) => {
    // 处理标题
    let title = item.title || item.name || item.desc || '';
    if (typeof title === 'object' && title.text) {
      title = title.text;
    }

    // 处理URL
    let url = item.mobileUrl || item.url || item.link || '';
    if (typeof url === 'object' && url.url) {
      url = url.url;
    }

    // 处理热度值
    let hot = item.hot || item.views || item.score || item.num || item.count || '-';
    if (typeof hot === 'object' && hot.text) {
      hot = hot.text;
    }

    return {
      title: title || '无标题',
      url: url || '#',
      hot: hot
    };
  }).filter((item: HotItem) => item.title && item.title !== '无标题' && item.title.trim() !== '');
};

// 定义分类接口
interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// 定义分类配置
export const categories: Category[] = [
  {
    id: 'uied',
    name: '设计热榜',
    description: '设计社区热门内容',
    icon: 'hot'
  },
  {
    id: 'comprehensive',
    name: '综合热点',
    description: '聚合各大平台热门话题',
    icon: 'hot'
  },
  {
    id: 'news',
    name: '新闻资讯',
    description: '及时获取新闻动态',
    icon: 'news'
  },
  {
    id: 'tech',
    name: '科技资讯',
    description: '了解科技前沿资讯',
    icon: 'tech'
  },
  {
    id: 'developer',
    name: '技术社区',
    description: '发现技术热点话题',
    icon: 'code'
  },
  {
    id: 'interest',
    name: '兴趣社区',
    description: '探索兴趣爱好圈子',
    icon: 'interest'
  },
  {
    id: 'professional',
    name: '专业社区',
    description: '专业领域深度交流',
    icon: 'professional'
  },
  {
    id: 'tools',
    name: '实用工具',
    description: '便捷实用的工具资讯',
    icon: 'tools'
  }
];

// 平台配置
export const officialAPIs: PlatformAPI[] = [
  // 设计热榜 (保持不变)
  {
    name: '每日学习',
    id: 'learn_hot',
    type: '热门',
    icon: uiedIcon,
    endpoint: '/api/uied/posts?_fields=title,link,date&per_page=50&orderby=date&order=desc&categories_exclude=337,388',
    category: '设计热榜',
    transform: transformData
  },
  {
    name: '累了摸鱼',
    id: 'relax_hot',
    type: '热门',
    icon: uiedIcon,
    endpoint: '/api/uied/circle?_fields=title,link,date&per_page=50&orderby=date&order=desc',
    category: '设计热榜',
    transform: transformData
  },
  {
    name: '字体素材',
    id: 'font_hot',
    type: '热门',
    icon: uiedIcon,
    endpoint: '/api/uied/posts?_fields=title,link,date&per_page=50&orderby=date&order=desc&categories=319',
    category: '设计热榜',
    transform: transformData
  },
  {
    name: 'AIGC学习',
    id: 'aigc_hot',
    type: '热门',
    icon: uiedIcon,
    endpoint: '/api/uied/posts?_fields=title,link,date&per_page=50&orderby=date&order=desc&categories=417',
    category: '设计热榜',
    transform: transformData
  },
  {
    name: '设计周刊',
    id: 'design_hot',
    type: '热门',
    icon: uiedIcon,
    endpoint: '/api/uied/posts?_fields=title,link,date&per_page=50&orderby=date&order=desc&tags=452',
    category: '设计热榜',
    transform: transformData
  },

  // 综合热点
  {
    name: '微博热搜',
    id: 'weibo_hot',
    type: '热搜',
    icon: weiboIcon,
    endpoint: '/api/dailyhot/?title=微博',
    category: '综合热点',
    transform: transformData
  },
  {
    name: '百度热搜',
    id: 'baidu_hot',
    type: '热搜',
    icon: baiduIcon,
    endpoint: '/api/dailyhot/?title=百度',
    category: '综合热点',
    transform: transformData
  },
  {
    name: '知乎热榜',
    id: 'zhihu_hot',
    type: '热榜',
    icon: zhihuIcon,
    endpoint: '/api/dailyhot/?title=知乎',
    category: '综合热点',
    transform: transformData
  },
  {
    name: '知乎日报',
    id: 'zhihu_daily',
    type: '日报',
    icon: zhihuIcon,
    endpoint: '/api/dailyhot/?title=知乎日报',
    category: '综合热点',
    transform: transformData
  },
  {
    name: '抖音热榜',
    id: 'douyin_hot',
    type: '热点',
    icon: douyinIcon,
    endpoint: '/api/dailyhot/?title=抖音',
    category: '综合热点',
    transform: transformData
  },

  // 新闻资讯
  {
    name: '今日头条',
    id: 'toutiao_hot',
    type: '热榜',
    icon: toutiaoIcon,
    endpoint: '/api/dailyhot/?title=今日头条',
    category: '新闻资讯',
    transform: transformData
  },
  {
    name: '腾讯新闻',
    id: 'qq_hot',
    type: '热点',
    icon: qqnewsIcon,
    endpoint: '/api/dailyhot/?title=腾讯新闻',
    category: '新闻资讯',
    transform: transformData
  },
  {
    name: '网易新闻',
    id: '163_hot',
    type: '热榜',
    icon: netease163Icon,
    endpoint: '/api/dailyhot/?title=网易新闻',
    category: '新闻资讯',
    transform: transformData
  },
  {
    name: '澎湃新闻',
    id: 'thepaper_hot',
    type: '热榜',
    icon: thepaperIcon,
    endpoint: '/api/dailyhot/?title=澎湃新闻',
    category: '新闻资讯',
    transform: transformData
  },
  {
    name: '新浪新闻',
    id: 'sina_news',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=新浪新闻',
    category: '新闻资讯',
    transform: transformData
  },
  {
    name: '新浪网',
    id: 'sina',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=新浪网',
    category: '新闻资讯',
    transform: transformData
  },

  // 科技资讯
  {
    name: '36氪',
    id: '36kr',
    type: '热榜',
    icon: kr36Icon,
    endpoint: '/api/dailyhot/?title=36氪',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: 'IT之家',
    id: 'ithome_hot',
    type: '热榜',
    icon: ithomeIcon,
    endpoint: '/api/dailyhot/?title=IT之家',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: '酷安',
    id: 'coolapk',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=酷安',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: '数字尾巴',
    id: 'dgtle',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=数字尾巴',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: '极客公园',
    id: 'geekpark',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=极客公园',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: '果壳',
    id: 'guokr',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=果壳',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: '虎嗅',
    id: 'huxiu',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=虎嗅',
    category: '科技资讯',
    transform: transformData
  },
  {
    name: '爱范儿',
    id: 'ifanr',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=爱范儿',
    category: '科技资讯',
    transform: transformData
  },

  // 技术社区
  {
    name: '掘金',
    id: 'juejin_hot',
    type: '热榜',
    icon: juejinIcon,
    endpoint: '/api/dailyhot/?title=稀土掘金',
    category: '技术社区',
    transform: transformData
  },
  {
    name: '51CTO',
    id: '51cto',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=51CTO',
    category: '技术社区',
    transform: transformData
  },
  {
    name: '吾爱破解',
    id: '52pojie',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=吾爱破解',
    category: '技术社区',
    transform: transformData
  },
  {
    name: 'CSDN',
    id: 'csdn',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=CSDN',
    category: '技术社区',
    transform: transformData
  },
  {
    name: 'HelloGitHub',
    id: 'hellogithub',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=HelloGitHub',
    category: '技术社区',
    transform: transformData
  },
  {
    name: '水木社区',
    id: 'newsmth',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=水木社区',
    category: '技术社区',
    transform: transformData
  },

  // 兴趣社区
  {
    name: '哔哩哔哩',
    id: 'bilibili_hot',
    type: '热门',
    icon: bilibiliIcon,
    endpoint: '/api/dailyhot/?title=哔哩哔哩',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: 'AcFun',
    id: 'acfun_hot',
    type: '热榜',
    icon: acfunIcon,
    endpoint: '/api/dailyhot/?title=AcFun',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '豆瓣电影',
    id: 'douban_movie',
    type: '热榜',
    icon: doubanIcon,
    endpoint: '/api/dailyhot/?title=豆瓣电影',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '豆瓣讨论',
    id: 'douban_group',
    type: '热门',
    icon: doubanIcon,
    endpoint: '/api/dailyhot/?title=豆瓣讨论小组',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '百度贴吧',
    id: 'tieba_hot',
    type: '热议',
    icon: tiebaIcon,
    endpoint: '/api/dailyhot/?title=百度贴吧',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '微信读书',
    id: 'weread_hot',
    type: '热榜',
    icon: weixinIcon,
    endpoint: '/api/dailyhot/?title=微信读书',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '原神',
    id: 'genshin',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=原神',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '崩坏3',
    id: 'honkai3',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=崩坏3',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '虎扑',
    id: 'hupu',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=虎扑',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '英雄联盟',
    id: 'lol',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=英雄联盟',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '米游社 · 崩坏3',
    id: 'miyoushe_honkai3',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=米游社 · 崩坏3',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: 'NGA',
    id: 'nga',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=NGA',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '什么值得买',
    id: 'smzdm',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=什么值得买',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '崩坏：星穹铁道',
    id: 'starrail',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=崩坏：星穹铁道',
    category: '兴趣社区',
    transform: transformData
  },
  {
    name: '游研社',
    id: 'yystv',
    type: '热榜',
    icon: uiedIcon,
    endpoint: '/api/dailyhot/?title=游研社',
    category: '兴趣社区',
    transform: transformData
  },

  // 专业社区
  {
    name: '少数派',
    id: 'sspai_hot',
    type: '热门',
    icon: sspaiIcon,
    endpoint: '/api/dailyhot/?title=少数派',
    category: '专业社区',
    transform: transformData
  },
  {
    name: '简书',
    id: 'jianshu_hot',
    type: '热榜',
    icon: jianshuIcon,
    endpoint: '/api/dailyhot/?title=简书',
    category: '专业社区',
    transform: transformData
  },

  // 实用工具
  {
    name: '中央气象台',
    id: 'weather_hot',
    type: '预警',
    icon: weatherIcon,
    endpoint: '/api/dailyhot/?title=中央气象台',
    category: '实用工具',
    transform: transformData
  },
  {
    name: '历史上的今天',
    id: 'history_hot',
    type: '热榜',
    icon: historyIcon,
    endpoint: '/api/dailyhot/?title=历史上的今天',
    category: '实用工具',
    transform: transformData
  },
  {
    name: 'IT之家「喜加一」',
    id: 'ithome_plus',
    type: '喜加一',
    icon: ithomeIcon,
    endpoint: '/api/dailyhot/?title=IT之家「喜加一」',
    category: '实用工具',
    transform: transformData
  }
];

export type { HotItem, PlatformAPI, Category };
