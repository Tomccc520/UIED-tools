import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

interface RSSSourceConfig {
  id: string;
  name: string;
  category: string;
  isAI?: boolean;
}

interface NewsFeedItem {
  title: string;
  url: string;
  publishedAt: string;
  description?: string;
}

const RSS_SOURCES: RSSSourceConfig[] = [
  { id: '36kr', name: '36氪', category: '36氪' },
  { id: 'ithome', name: 'IT之家', category: 'IT之家' },
  { id: 'sspai', name: '少数派', category: '少数派' },
  { id: 'uied', name: 'UIED', category: 'UIED', isAI: true },
  { id: 'qbitai', name: '量子位', category: '量子位', isAI: true }
];

const NEWS_FEED_TIMEOUT = 9_000;

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

  /** 读取同域资讯接口，超时覆盖响应头和 JSON 正文。 */
  private async fetchFeed(sourceId: string): Promise<NewsFeedItem[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), NEWS_FEED_TIMEOUT);
    try {
      const endpoint = '/api/common/index/news-rss?source=' + encodeURIComponent(sourceId);
      const response = await fetch(endpoint, {
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      if (!response.ok) throw new Error('资讯请求失败');
      const payload = await response.json();
      if (payload?.code !== 200 || !Array.isArray(payload.data?.items)) {
        throw new Error('资讯来源暂时不可用');
      }
      return payload.data.items;
    } catch (error) {
      if (controller.signal.aborted) throw new Error('请求超时');
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /** 将标准化条目转换为时间线数据，跳过缺少原文地址或有效发布时间的条目。 */
  private async fetchRSS(source: RSSSourceConfig): Promise<NewsItem[]> {
    const items = await this.fetchFeed(source.id);
    const news: NewsItem[] = [];
    for (const item of items) {
      if (!item?.title || typeof item.url !== 'string' || !/^https?:\/\//i.test(item.url)) continue;
      const date = Date.parse(item.publishedAt);
      if (!Number.isFinite(date)) continue;
      news.push({
        title: item.title,
        description: this.cleanDescription(typeof item.description === 'string' ? item.description : ''),
        url: item.url,
        date,
        source: source.name,
        category: source.category,
        time: dayjs(date).format('HH:mm')
      });
    }
    return news;
  }

  /** 清理资讯摘要中的 HTML，并保留时间线所需的简短预览。 */
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
    return cleanText.length > 150 ? cleanText.slice(0, 150) + '…' : cleanText;
  }

  /** 汇总分类来源，允许部分成功及真实空列表；全部来源失败时保留缓存并抛出明确错误。 */
  public async getNews(
    category?: NewsCategory,
    page: number = 1,
    pageSize: number = 50,
    forceRefresh: boolean = false
  ): Promise<NewsItem[]> {
    this.lastError = null;
    const cacheKey = `${category || 'all'}_${page}_${pageSize}`;

    if (this.shouldUseCache(cacheKey, forceRefresh)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.data;
      }
    }

    try {
      let sources = RSS_SOURCES;
      if (category && category !== '全部') {
        if (category === 'AI资讯') {
          sources = sources.filter(source => source.isAI);
        } else {
          sources = sources.filter(source => source.category === category);
        }
      }

      if (sources.length === 0) throw new Error('该资讯源尚未接入');
      const newsPromises = sources.map(source => this.fetchRSS(source));
      const results = await Promise.allSettled(newsPromises);

      if (results.length > 0 && results.every(result => result.status === 'rejected')) {
        throw new Error('资讯加载失败，请稍后重试');
      }

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
      this.lastError = error instanceof Error ? error : new Error('资讯加载失败');
      if (import.meta.env.DEV) {
        console.error('获取新闻失败:', error);
      }
      throw error;
    }
  }
}

export const rssNewsService = new RSSNewsService();
