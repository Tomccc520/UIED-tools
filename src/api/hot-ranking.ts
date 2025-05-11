import type { HotItem, PlatformAPI } from './platforms';
import { officialAPIs, categories, Category } from './platforms';

// 环境配置
const isProd = process.env.NODE_ENV === 'production'
const BASE_API = isProd ? 'https://api.pearktrue.cn' : ''

export class HotRankingAPI {
  private static instance: HotRankingAPI;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  private RETRY_TIMES = 2; // 重试次数
  private RETRY_DELAY = 1000; // 重试延迟（毫秒）

  static getInstance() {
    if (!this.instance) {
      this.instance = new HotRankingAPI();
    }
    return this.instance;
  }

  private async fetchWithRetry(platform: PlatformAPI, retryCount = 0): Promise<HotItem[]> {
    try {
      // 根据不同的数据源使用不同的请求配置
      const isUiedData = platform.category === '设计热榜';
      const requestConfig: RequestInit = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      };

      if (import.meta.env.DEV) {
        console.log(`正在获取 ${platform.name} 数据，URL: ${platform.endpoint}`);
      }
      const finalEndpoint = isProd ? `${BASE_API}${platform.endpoint}` : platform.endpoint
      const response = await fetch(finalEndpoint, requestConfig);

      if (!response.ok) {
        throw new Error(`获取数据失败: HTTP ${response.status} - ${response.statusText}`);
      }

      // 检查响应的 Content-Type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // 获取响应文本以便调试
        const text = await response.text();
        const headerObj: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headerObj[key] = value;
        });

        if (import.meta.env.DEV) {
          console.error(`响应不是 JSON 格式 (${platform.name}):`, {
            contentType,
            text: text.substring(0, 200), // 只显示前200个字符
            url: platform.endpoint,
            headers: headerObj,
            status: response.status,
            statusText: response.statusText
          });
        }
        throw new Error(`API返回格式错误: ${contentType || '未知类型'} (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log(`成功获取 ${data.title} 数据: `, data)
      }

      // 根据不同的数据源处理数据
      if (isUiedData) {
        return this.transformUiedData(data);
      } else {
        return this.transformPearktrueData(data);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`获取 ${platform.name} 数据失败:`, error);
      }

      // 重试逻辑
      if (retryCount < this.RETRY_TIMES) {
        if (import.meta.env.DEV) {
          console.log(`正在重试 ${platform.name} (${retryCount + 1}/${this.RETRY_TIMES})...`);
        }
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * (retryCount + 1)));
        return this.fetchWithRetry(platform, retryCount + 1);
      }

      throw error;
    }
  }

  // 转换 UIED 数据格式
  private transformUiedData(data: any[]): HotItem[] {
    return data.map(item => ({
      title: item.title.rendered || '',
      url: item.link || '',
      hot: item.date || '',
      mobileUrl: item.link || ''
    }));
  }

  // 转换 pearktrue API 数据格式
  private transformPearktrueData(data: any): HotItem[] {
    if (!data || !Array.isArray(data.data)) {
      throw new Error('数据格式错误');
    }

    return data.data.map((item: any) => ({
      title: item.title || '',
      url: item.url || '',
      hot: item.hot || '',
      mobileUrl: item.mobileUrl || item.url || ''
    }));
  }

  // 解码 HTML 实体
  private decodeHtmlEntities(text: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  }

  async fetchPlatformData(platform: PlatformAPI): Promise<HotItem[]> {
    try {
      // 检查缓存
      const cached = this.cache.get(platform.name);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        if (import.meta.env.DEV) {
          console.log(`使用缓存的${platform.name}数据，缓存时间:`, new Date(cached.timestamp).toLocaleString());
        }
        return cached.data;
      }

      const data = await this.fetchWithRetry(platform);

      // 更新缓存
      this.cache.set(platform.name, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`获取${platform.name}数据失败:`, error);
      }
      // 如果缓存存在，在发生错误时返回缓存的数据
      const cached = this.cache.get(platform.name);
      if (cached) {
        if (import.meta.env.DEV) {
          console.log(`使用缓存的${platform.name}数据（发生错误），缓存时间:`, new Date(cached.timestamp).toLocaleString());
        }
        return cached.data;
      }
      return [];
    }
  }

  // 按分类获取数据
  async getDataByCategory(category: string) {
    const platformsInCategory = officialAPIs.filter(api => api.category === category);
    const results = await Promise.allSettled(
      platformsInCategory.map(async platform => {
        try {
          const data = await this.fetchPlatformData(platform);
          return {
            name: platform.name,
            type: platform.type,
            icon: platform.icon,
            id: platform.id,
            data: data
          };
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`获取${platform.name}数据失败:`, error);
          }
          return null;
        }
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }

  // 获取所有分类的数据
  async getAllCategorizedData() {
    const result: Record<string, any[]> = {};

    await Promise.all(
      categories.map(async (category: Category) => {
        result[category.name] = await this.getDataByCategory(category.name);
      })
    );

    return result;
  }

  // 获取所有平台数据（不分类）
  async getAllPlatformsData() {
    const results = await Promise.allSettled(
      officialAPIs.map(async platform => {
        try {
          const data = await this.fetchPlatformData(platform);
          if (!data || data.length === 0) {
            return null;
          }
          return {
            name: platform.name,
            type: platform.type,
            icon: platform.icon,
            id: platform.id,
            category: platform.category,
            data: data
          };
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error(`获取${platform.name}数据失败:`, error);
          }
          return null;
        }
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<any> =>
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value);
  }
}
