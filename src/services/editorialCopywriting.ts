/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-11-12
 */
import bundledLibrary from '../../backend/likeadmin-go/server/admin/service/common/copywriting_library.json'

export type EditorialCopywritingKind = keyof typeof bundledLibrary.entries

export interface EditorialCopywritingEntry {
  id: string
  text: string
  english?: string
  title?: string
  author?: string
  dynasty?: string
  from?: string
  topic?: string
}

export interface EditorialCopywritingLibrary {
  updatedAt: string
  items: readonly EditorialCopywritingEntry[]
}

const DAY_MS = 24 * 60 * 60 * 1000
const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000
const SYNC_TIMEOUT_MS = 1800
const entryFields = ['english', 'title', 'author', 'dynasty', 'from', 'topic'] as const
const requiredFields: Record<EditorialCopywritingKind, ReadonlyArray<typeof entryFields[number]>> = {
  kfc: ['english'],
  'daily-poem': ['title', 'author', 'dynasty', 'from'],
  'dog-diary': [],
  moments: ['topic']
}

/** 从随工具页面加载的同一份站内内容库取值，首屏不需要等接口。 */
export function getBundledEditorialLibrary(kind: EditorialCopywritingKind): EditorialCopywritingLibrary {
  return { updatedAt: bundledLibrary.updatedAt, items: bundledLibrary.entries[kind] }
}

/** 把当前时刻转换为北京时间的日序、日期和下一次换日时间，所有设备按同一口径切换。 */
export function getEditorialDay(now = Date.now()) {
  const index = Math.floor((now + BEIJING_OFFSET_MS) / DAY_MS)
  return {
    index,
    date: new Date(index * DAY_MS).toISOString().slice(0, 10),
    nextAt: (index + 1) * DAY_MS - BEIJING_OFFSET_MS
  }
}

/** 按日序轮换，每天首条固定，相邻两天不会随机选中同一条。 */
export function getDailyEditorialEntry(items: readonly EditorialCopywritingEntry[], day: number) {
  return items[((day % items.length) + items.length) % items.length]
}

/** 沿库顺序浏览，当前场景内看完一轮才回到第一条。 */
export function getNextEditorialEntry(items: readonly EditorialCopywritingEntry[], currentId: string) {
  return items[(items.findIndex(item => item.id === currentId) + 1) % items.length]
}

/** 识别接口返回的对象，旧网关回退的 HTML、空数据和错误包均不覆盖内置库。 */
function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
}

/** 校验内容日期、重复项和必需字段，拒绝会丢掉译文、诗词出处或场景筛选的错误更新。 */
function readEditorialLibrary(payload: unknown, kind: EditorialCopywritingKind): EditorialCopywritingLibrary | null {
  const envelope = asRecord(payload)
  const data = envelope?.code === 200 ? asRecord(envelope.data) : null
  if (!data || typeof data.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt)
    || !Array.isArray(data.items) || data.items.length < 2) return null

  const items: EditorialCopywritingEntry[] = []
  const ids = new Set<string>()
  const texts = new Set<string>()
  const topicCounts = new Map<string, number>()
  for (const candidate of data.items) {
    const row = asRecord(candidate)
    if (!row || typeof row.id !== 'string' || !row.id.trim() || typeof row.text !== 'string' || !row.text.trim()) return null
    const id = row.id.trim()
    const text = row.text.trim()
    if (ids.has(id) || texts.has(text)) return null
    const item: EditorialCopywritingEntry = { id, text }
    for (const key of entryFields) {
      const value = row[key]
      if (typeof value === 'string' && value.trim()) item[key] = value.trim()
    }
    if (requiredFields[kind].some(key => !item[key])) return null
    if (item.topic) topicCounts.set(item.topic, (topicCounts.get(item.topic) ?? 0) + 1)
    ids.add(id)
    texts.add(text)
    items.push(item)
  }
  if ([...topicCounts.values()].some(count => count < 2)) return null
  return { updatedAt: data.updatedAt, items }
}

/** 进入页面后尝试同步同域内容，失败、超时和离页时保持可用的内置库。 */
export async function fetchEditorialLibrary(kind: EditorialCopywritingKind, signal?: AbortSignal): Promise<EditorialCopywritingLibrary | null> {
  if (signal?.aborted) return null
  const controller = new AbortController()
  /** 同步外部取消，避免切走工具后仍等待响应。 */
  const abort = () => controller.abort()
  signal?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, SYNC_TIMEOUT_MS)
  try {
    const response = await fetch(`/api/common/copywriting/library/${kind}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    })
    return response.ok ? readEditorialLibrary(await response.json(), kind) : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}
