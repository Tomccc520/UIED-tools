import Parser from 'rss-parser';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

// 代理服务配置
const PROXY_SERVICES = [] as const; // 移除外部代理，使用本地代理

// RSS源配置类型定义
interface RSSSourceConfig {
  url: string;
  name: string;
  category: string;
  useProxy: boolean;
  retryCount: number;
  retryDelay: number;
  isWordPress?: boolean;
  isAI?: boolean;  // 添加AI资讯标识
}

// RSS源配置
const RSS_SOURCES: Record<string, RSSSourceConfig> = {
  KR36: {
    url: '/36kr-proxy/feed',  // 36氪RSS地址
    name: '36氪',
    category: '36氪',
    useProxy: false,
    retryCount: 3,
    retryDelay: 1000,
    isAI: false
  },
  ITHOME: {
    url: '/rss-proxy/rss',  // IT之家RSS地址
    name: 'IT之家',
    category: 'IT之家',
    useProxy: false,
    retryCount: 3,
    retryDelay: 1000,
    isAI: false
  },
  SSPAI: {
    url: '/sspai-proxy/feed',  // 少数派RSS地址
    name: '少数派',
    category: '少数派',
    useProxy: false,
    retryCount: 3,
    retryDelay: 1000,
    isAI: false
  },
  JIQIZHIXIN: {
    url: '/jqzx-proxy/rss',  // 使用官方 RSS 地址
    name: '机器之心',
    category: '机器之心',
    useProxy: false,
    retryCount: 3,
    retryDelay: 1000,
    isAI: true  // 机器之心是AI资讯
  },
  UIED: {
    url: '/uied-proxy/wp-json/wp/v2/posts?per_page=10&_embed=true',
    name: 'UIED',
    category: 'UIED',
    useProxy: false,
    retryCount: 2,
    retryDelay: 1500,
    isWordPress: true,
    isAI: true
  },
  QUANTUMU: {
    url: '/quantumu-proxy/feed',  // 量子位RSS地址
    name: '量子位',
    category: '量子位',
    useProxy: false,
    retryCount: 3,
    retryDelay: 1000,
    isAI: true  // 量子位是AI资讯
  }
};

// 新闻分类 - 使用数组直接定义避免Set的类型错误
export const NEWS_CATEGORIES = ['全部', 'AI资讯', '36氪', 'IT之家', '少数派', '机器之心', 'UIED', '量子位'] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];

export interface NewsItem {
  time: string;
  date: number;
  title: string;
  url: string;
  source: string;
  description?: string;
  category: string;
  cover?: string;
}

interface RSSCacheEntry {
  data: NewsItem[];
  timestamp: number;
}

class RSSNewsService {
  private parser: Parser;
  private cache: Map<string, RSSCacheEntry>;
  private CACHE_DURATION = 15 * 60 * 1000; // 15分钟缓存，降低频繁拉取
  private FORCE_REFRESH_COOLDOWN = 30 * 1000; // 手动强刷冷却30秒
  private MIN_CACHE_ITEMS = 5;
  private AUTO_REFRESH_INTERVAL = 15 * 60 * 1000; // 15分钟自动刷新
  private STORAGE_KEY = 'rss_news_cache_v2';
  private MAX_PERSIST_ITEMS = 20;
  private refreshTimer: number | null = null;
  private lastError: Error | null = null;

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'media'],
          ['description', 'description'],
          ['category', 'categories'],
          ['pubDate', 'pubDate']
        ]
      }
    });
    this.cache = new Map();
    this.restoreCacheFromStorage();
    this.setupAutoRefresh();
  }

  /**
   * 设置自动刷新
   * 仅在页面可见且网络可用时执行，避免后台标签页频繁请求
   */
  private setupAutoRefresh() {
    if (typeof window === 'undefined') return;

    this.refreshTimer = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return;
      }

      this.refreshAll();
    }, this.AUTO_REFRESH_INTERVAL);
  }

  /**
   * 刷新所有缓存数据
   * 仅刷新已经访问过并缓存的分类，避免无意义全量请求
   */
  private async refreshAll() {
    if (this.cache.size === 0) return;

    const refreshPromises = Array.from(this.cache.keys()).map(async (cacheKey) => {
      try {
        const [category, page, pageSize] = cacheKey.split('_');
        await this.getNews(
          category === 'all' ? undefined : category as NewsCategory,
          Number(page),
          Number(pageSize),
          true
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(`自动刷新失败 (${cacheKey}):`, error);
        }
      }
    });

    await Promise.allSettled(refreshPromises);
  }

  // 获取最后一次错误
  public getLastError(): Error | null {
    return this.lastError;
  }

  // 清除最后一次错误
  public clearLastError() {
    this.lastError = null;
  }

  // 清除缓存的方法
  public clearCache() {
    this.cache.clear();
    this.persistCacheToStorage();
  }

  /**
   * 判断是否使用缓存
   * @param cacheKey 缓存键
   * @param forceRefresh 是否强制刷新
   * @returns 是否命中缓存
   */
  private shouldUseCache(cacheKey: string, forceRefresh: boolean): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    const age = now - cached.timestamp;

    if (forceRefresh) {
      // 避免连续点击强刷导致高频请求
      return age < this.FORCE_REFRESH_COOLDOWN;
    }

    // 如果缓存时间未过期且有足够的数据，使用缓存
    if (age < this.CACHE_DURATION && cached.data.length >= this.MIN_CACHE_ITEMS) {
      return true;
    }

    return false;
  }

  /**
   * 更新内存缓存并持久化
   * @param cacheKey 缓存键
   * @param data 新闻列表
   */
  private updateCache(cacheKey: string, data: NewsItem[]) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    this.persistCacheToStorage();
  }

  /**
   * 将缓存落盘到 localStorage
   */
  private persistCacheToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, this.MAX_PERSIST_ITEMS);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('持久化新闻缓存失败:', error);
      }
    }
  }

  /**
   * 从 localStorage 恢复缓存
   */
  private restoreCacheFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as [string, RSSCacheEntry][];
      if (!Array.isArray(parsed)) return;

      const now = Date.now();
      parsed.forEach((entry) => {
        const [key, value] = entry;
        if (!key || !value || !Array.isArray(value.data)) return;

        // 允许恢复最多2倍TTL内的缓存，超时后自动丢弃
        if (now - value.timestamp <= this.CACHE_DURATION * 2) {
          this.cache.set(key, value);
        }
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('恢复新闻缓存失败:', error);
      }
    }
  }

  private async fetchWithRetry(url: string, options: any = {}, retries = 3, delay = 1000): Promise<string> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        // 添加超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 15000); // 增加超时时间到15秒

        try {
          const response = await fetch(url, {
            ...options,
            mode: 'cors',
            credentials: 'omit',
            signal: controller.signal,
            // 添加额外的请求头
            headers: {
              ...options.headers,
              'Connection': 'keep-alive',
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache',
              'Accept': 'application/json, application/xml, text/xml, application/rss+xml, */*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
          }

          const text = await response.text();
          if (!text || text.trim().length === 0) {
            throw new Error('空响应');
          }

          return text;
        } catch (error) {
          lastError = error as Error;
          if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('请求超时');
          }
          throw error;
        }
      } catch (error) {
        if (i === retries - 1) {
          throw lastError || error;
        }
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }

    throw lastError || new Error('请求失败');
  }

  private async fetchRSS(source: typeof RSS_SOURCES[keyof typeof RSS_SOURCES]): Promise<NewsItem[]> {
    try {
      const content = await this.fetchWithRetry(
        source.url,
        {
          headers: {
            'Accept': 'application/xml, text/xml, application/rss+xml, application/json, */*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        },
        source.retryCount,
        source.retryDelay
      );

      let items: any[] = [];

      if (source.isWordPress) {
        const data = JSON.parse(content);
        items = data.map((post: any) => ({
          title: post.title.rendered,
          link: post.link,
          pubDate: post.date,
          content: post.content.rendered,
          description: post.excerpt.rendered,
          categories: post.categories
        }));
      } else {
        const feed = await this.parser.parseString(content);
        items = feed.items;
      }

      const processedItems = this.processFeedItems(items, source);
      return processedItems;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`获取 ${source.name} 的内容失败:`, error);
      }
      throw error;
    }
  }

  private processFeedItems(items: any[], source: typeof RSS_SOURCES[keyof typeof RSS_SOURCES]): NewsItem[] {
    return items.map(item => ({
      title: item.title,
      description: this.cleanDescription(item.description || ''),
      url: item.link,
      date: new Date(item.pubDate || item.updated || Date.now()).getTime(),
      source: source.name,
      category: source.category,
      time: dayjs(item.pubDate || item.updated).format('HH:mm')
    }));
  }

  private cleanDescription(description: string): string {
    // 优化描述清理
    const cleanText = description
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除脚本
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // 移除样式
      .replace(/<[^>]+>/g, ' ')  // 将标签替换为空格
      .replace(/&[^;]+;/g, ' ')  // 将HTML实体替换为空格
      .replace(/\s+/g, ' ')      // 合并多个空格
      .trim();

    // 如果文本太短，尝试保留更多内容
    if (cleanText.length < 50) {
      return cleanText;
    }

    return cleanText.slice(0, 150) + '...';  // 增加描述长度到150字符
  }

  public async getNews(
    category?: NewsCategory,
    page: number = 1,
    pageSize: number = 50,
    forceRefresh: boolean = false
  ): Promise<NewsItem[]> {
    const cacheKey = `${category || 'all'}_${page}_${pageSize}`;

    if (this.shouldUseCache(cacheKey, forceRefresh)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.data;
      }
    }

    try {
      let sources = Object.values(RSS_SOURCES);
      if (category && category !== '全部') {
        if (category === 'AI资讯') {
          sources = sources.filter(source => source.isAI);
        } else {
          sources = sources.filter(source => source.category === category);
        }
      }

      const newsPromises = sources.map(source => this.fetchRSS(source));
      const results = await Promise.allSettled(newsPromises);

      let allNews: NewsItem[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allNews = allNews.concat(result.value);
        } else if (import.meta.env.DEV) {
          console.error(`获取 ${sources[index].name} 的内容失败:`, result.reason);
        }
      });

      // 按时间排序
      allNews.sort((a, b) => b.date - a.date);

      // 分页
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pagedNews = allNews.slice(start, end);

      this.updateCache(cacheKey, pagedNews);
      return pagedNews;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('获取新闻失败:', error);
      }
      throw error;
    }
  }
}

export const rssNewsService = new RSSNewsService();
