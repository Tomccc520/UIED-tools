/**
 * @file useSiteHeaderLinks.ts
 * @description 站点页面顶部链接配置读取组合式函数，统一对接后台可运营链接
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-03-23
 */

import { ref } from 'vue'
import { getSitePublicConfig, type SiteLinkItem, type SitePublicConfig } from '@/services/siteConfig'

type SiteHeaderLinksField = 'changelogHeaderLinks' | 'changelogMetaLinks' | 'aiChatHeaderLinks' | 'aiCommonHeaderLinks'

/**
 * 函数说明：判断站点链接是否为外部链接，便于页面决定是否新开标签页
 */
export const isExternalSiteLink = (link: string): boolean => {
  return /^https?:\/\//i.test(String(link || '').trim())
}

/**
 * 函数说明：创建站点顶部链接状态，并按指定字段读取后台公共配置中的运营链接
 */
export const useSiteHeaderLinks = (field: SiteHeaderLinksField, fallbackLinks: SiteLinkItem[]) => {
  const headerLinks = ref<SiteLinkItem[]>(fallbackLinks.map((item) => ({ ...item })))

  /**
   * 函数说明：读取后台公共配置中的链接列表，若后台未配置则保留页面内置默认值
   */
  const loadHeaderLinks = async () => {
    const siteConfig = await getSitePublicConfig({ forceRefresh: true })
    const remoteLinks = siteConfig[field] as SitePublicConfig[SiteHeaderLinksField]
    if (Array.isArray(remoteLinks) && remoteLinks.length) {
      headerLinks.value = remoteLinks.map((item) => ({ ...item }))
    }
  }

  return {
    headerLinks,
    loadHeaderLinks
  }
}
