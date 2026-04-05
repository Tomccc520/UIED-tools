/**
 * @copyright Tomda (https://www.tomda.top)
 * @copyright UIED技术团队 (https://fsuied.com)
 * @author UIED技术团队
 * @createDate 2026-04-05
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { spawnSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

const CURRENT_FILE = fileURLToPath(import.meta.url)
const ROOT_DIR = path.resolve(path.dirname(CURRENT_FILE), '../..')
const RUNTIME_DIR = path.join(ROOT_DIR, '.runtime')
const TMP_DIR = path.join(RUNTIME_DIR, 'tmp')
const COMPOSE_ENV_FILE = path.join(RUNTIME_DIR, 'compose.env')
const PORTS_ENV_FILE = path.join(RUNTIME_DIR, 'ports.env')
const BACKEND_COMPOSE_FILE = path.join(ROOT_DIR, 'backend', 'docker-compose.yml')
const TOOLS_SOURCE_FILE = path.join(ROOT_DIR, 'src', 'components', 'Tools', 'tools.ts')
const LEFT_LAYOUT_FILE = path.join(ROOT_DIR, 'src', 'components', 'Layout', 'Left', 'Left.vue')
const TEMP_TOOLS_MODULE_FILE = path.join(TMP_DIR, 'tools.catalog.runtime.mjs')

const DEFAULT_COMPOSE_PROJECT = 'uiedtool_stack'
const DEFAULT_DB_NAME = 'uiedtool'
const DEFAULT_MYSQL_ROOT_PASSWORD = 'root123456'
const SYSTEM_CONFIG_LONGTEXT_SQL =
  "ALTER TABLE `la_system_config` MODIFY COLUMN `value` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '值';"

const DEFAULT_SIDEBAR_RECOMMEND_LINKS = [
  { name: '热门工具', link: '#recommend-hot' },
  { name: '随机推荐', link: '/tools/random-tools' },
  { name: '每日热榜', link: '/tools/hot-ranking' },
  { name: '每日文章', link: 'https://hot.uied.cn/' },
  { name: '实时资讯', link: '/tools/ai-news' },
  { name: 'AI产品榜', link: 'https://hao.uied.cn/' }
]

const DEFAULT_SITE_SLOGAN = '免费在线工具集'
const DEFAULT_SIDEBAR_BRAND_TEXT = 'UIED-Tools'
const DEFAULT_SIDEBAR_RECOMMEND_TITLE = '推荐工具'

const DEFAULT_SIDEBAR_MENU_ICON_MAP = {
  ai: '/icons/sidebar/ai.svg',
  design: '/icons/sidebar/design.svg',
  image: '/icons/sidebar/image.svg',
  office: '/icons/sidebar/office.svg',
  daily: '/icons/sidebar/daily.svg',
  copywriting: '/icons/sidebar/copywriting.svg',
  psychology: '/icons/sidebar/psychology.svg',
  video: '/icons/sidebar/video.svg',
  dev: '/icons/sidebar/dev.svg',
  slacking: '/icons/sidebar/slacking.svg',
  efficiency: '/icons/sidebar/efficiency.svg'
}

const DEFAULT_SIDEBAR_CATEGORY_MENUS = [
  { key: 'ai', title: 'AI工具箱', cateTitle: 'AI工具箱', link: '/tools/ai/toolbox', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.ai },
  { key: 'design', title: '设计工具', cateTitle: '设计工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.design },
  { key: 'image', title: '图片处理', cateTitle: '图片处理', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.image },
  { key: 'office', title: '办公工具', cateTitle: '办公工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.office },
  { key: 'daily', title: '生活常用', cateTitle: '生活常用', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.daily },
  { key: 'copywriting', title: '文案工具', cateTitle: '文案工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.copywriting },
  { key: 'psychology', title: '潜能测试', cateTitle: '潜能测试', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.psychology },
  { key: 'video', title: '剪辑工具', cateTitle: '剪辑工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.video },
  { key: 'dev', title: '开发工具', cateTitle: '开发工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.dev },
  { key: 'slacking', title: '摸鱼工具', cateTitle: '摸鱼工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.slacking },
  { key: 'efficiency', title: '效率工具', cateTitle: '效率工具', icon: DEFAULT_SIDEBAR_MENU_ICON_MAP.efficiency }
]

const DEFAULT_SIDEBAR_BOTTOM_LINKS = [
  { name: '更新记录', link: '/changelog' },
  { name: '意见反馈', link: 'https://uiedtool.com/' },
  { name: '关于我们', link: '/about' }
]

const DEFAULT_AI_TOOLBOX_SIDEBAR_MENUS = [
  { name: 'AI精选工具', link: '#ai-highlight' },
  { name: 'AI分组总览', link: '#ai-groups' }
]

const DEFAULT_SIDEBAR_BRAND_LOGO = ''

/**
 * 函数说明：输出统一日志，便于终端观察同步进度。
 */
const logInfo = (message) => {
  console.log(`[INFO] ${message}`)
}

/**
 * 函数说明：输出错误日志并以失败状态退出。
 */
const logErrorAndExit = (message) => {
  console.error(`[ERROR] ${message}`)
  process.exit(1)
}

/**
 * 函数说明：解析命令行参数，支持是否强制覆盖已有配置。
 */
const parseArgs = () => {
  const args = new Set(process.argv.slice(2))
  return {
    force: args.has('--force')
  }
}

/**
 * 函数说明：解析 env 文件，兼容简单 KEY=VALUE 结构。
 */
const parseEnvFile = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    return content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .reduce((accumulator, line) => {
        const separatorIndex = line.indexOf('=')
        const key = line.slice(0, separatorIndex).trim()
        const value = line.slice(separatorIndex + 1).trim()
        accumulator[key] = value
        return accumulator
      }, {})
  } catch {
    return {}
  }
}

/**
 * 函数说明：读取当前本地全栈运行配置，未启动时回退到默认库名和 compose 项目名。
 */
const loadRuntimeConfig = async () => {
  const composeEnv = await parseEnvFile(COMPOSE_ENV_FILE)
  const portsEnv = await parseEnvFile(PORTS_ENV_FILE)

  return {
    composeProject: process.env.COMPOSE_PROJECT || composeEnv.COMPOSE_PROJECT || DEFAULT_COMPOSE_PROJECT,
    dbName: process.env.DB_NAME || composeEnv.DB_NAME || portsEnv.DB_NAME || DEFAULT_DB_NAME,
    mysqlRootPassword:
      process.env.MYSQL_ROOT_PASSWORD ||
      composeEnv.MYSQL_ROOT_PASSWORD ||
      portsEnv.MYSQL_ROOT_PASSWORD ||
      DEFAULT_MYSQL_ROOT_PASSWORD
  }
}

/**
 * 函数说明：将前端 tools.ts 转译为可执行模块，并读取完整工具分类树。
 */
const loadFrontendToolCategories = async () => {
  await fs.mkdir(TMP_DIR, { recursive: true })
  const sourceCode = await fs.readFile(TOOLS_SOURCE_FILE, 'utf8')
  const transpiled = ts.transpileModule(sourceCode, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020
    }
  })

  await fs.writeFile(TEMP_TOOLS_MODULE_FILE, transpiled.outputText, 'utf8')
  const moduleUrl = `${pathToFileURL(TEMP_TOOLS_MODULE_FILE).href}?t=${Date.now()}`
  const toolsModule = await import(moduleUrl)

  if (typeof toolsModule.getToolsCate !== 'function') {
    throw new Error('无法从 tools.ts 读取 getToolsCate 导出')
  }

  const categories = toolsModule.getToolsCate()
  if (!Array.isArray(categories) || categories.length === 0) {
    throw new Error('前端工具分类树为空，无法同步到后台')
  }

  return categories
}

/**
 * 函数说明：将 JSON 文本转为 MySQL 可安全写入的十六进制 UTF-8 字符串。
 */
const toMysqlUtf8Hex = (input) => Buffer.from(String(input), 'utf8').toString('hex')

/**
 * 函数说明：生成单个配置项的 upsert SQL，默认只补缺失/空值/乱码，force 模式可直接覆盖。
 */
const buildConfigUpsertSql = (configName, jsonValue, force = false, repairGarbled = false) => {
  const hexValue = toMysqlUtf8Hex(jsonValue)
  const conditions = [
    "TRIM(IFNULL(`value`, '')) = ''",
    "TRIM(`value`) = '[]'"
  ]

  if (repairGarbled) {
    conditions.push("`value` REGEXP '\\\\?{3,}'")
    conditions.push("`value` LIKE '%�%'")
  }

  const updateCondition = force ? '1=1' : conditions.join(' OR ')

  return [
    `UPDATE la_system_config`,
    `SET \`value\` = CONVERT(0x${hexValue} USING utf8mb4), \`update_time\` = @now_ts`,
    `WHERE \`type\` = 'website' AND \`name\` = '${configName}' AND (${updateCondition});`,
    `INSERT INTO la_system_config (\`type\`, \`name\`, \`value\`, \`create_time\`, \`update_time\`)`,
    `SELECT 'website', '${configName}', CONVERT(0x${hexValue} USING utf8mb4), @now_ts, @now_ts`,
    `WHERE NOT EXISTS (`,
    `  SELECT 1 FROM la_system_config WHERE \`type\` = 'website' AND \`name\` = '${configName}'`,
    `);`
  ].join('\n')
}

/**
 * 函数说明：组装本次同步要写入后台的前端菜单与工具分类配置。
 */
const buildSyncPayloads = async () => {
  const toolCategories = await loadFrontendToolCategories()
  const sidebarBrandLogo = (await loadFrontendDefaultSidebarBrandLogo()) || DEFAULT_SIDEBAR_BRAND_LOGO

  return [
    {
      name: 'toolsSiteSlogan',
      json: DEFAULT_SITE_SLOGAN,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarBrandLogo',
      json: sidebarBrandLogo,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarBrandText',
      json: DEFAULT_SIDEBAR_BRAND_TEXT,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarRecommendTitle',
      json: DEFAULT_SIDEBAR_RECOMMEND_TITLE,
      repairGarbled: true
    },
    {
      name: 'toolsSidebarRecommend',
      json: JSON.stringify(DEFAULT_SIDEBAR_RECOMMEND_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsSidebarCategoryMenus',
      json: JSON.stringify(DEFAULT_SIDEBAR_CATEGORY_MENUS),
      repairGarbled: true
    },
    {
      name: 'toolsSidebarMenuBlocks',
      json: JSON.stringify([]),
      repairGarbled: true
    },
    {
      name: 'toolsSidebarBottomLinks',
      json: JSON.stringify(DEFAULT_SIDEBAR_BOTTOM_LINKS),
      repairGarbled: true
    },
    {
      name: 'toolsAiToolboxSidebarMenus',
      json: JSON.stringify(DEFAULT_AI_TOOLBOX_SIDEBAR_MENUS),
      repairGarbled: true
    },
    {
      name: 'toolsCategoryTree',
      json: JSON.stringify(toolCategories),
      repairGarbled: false
    }
  ]
}

/**
 * 函数说明：执行 MySQL 同步脚本，将前端菜单与工具树写入后台配置表。
 */
const runMysqlSync = (runtimeConfig, sql) => {
  const commandArgs = [
    'compose',
    '-p',
    runtimeConfig.composeProject,
    '--env-file',
    COMPOSE_ENV_FILE,
    '-f',
    BACKEND_COMPOSE_FILE,
    'exec',
    '-T',
    '-e',
    `MYSQL_PWD=${runtimeConfig.mysqlRootPassword}`,
    'mysql',
    'mysql',
    '--default-character-set=utf8mb4',
    '-uroot',
    runtimeConfig.dbName
  ]

  return spawnSync('docker', commandArgs, {
    cwd: ROOT_DIR,
    input: sql,
    encoding: 'utf8'
  })
}

/**
 * 函数说明：从前端 Left.vue 提取默认品牌 SVG，确保后台导入的是前端同款 Logo。
 */
const loadFrontendDefaultSidebarBrandLogo = async () => {
  const sourceCode = await fs.readFile(LEFT_LAYOUT_FILE, 'utf8')
  const matched = sourceCode.match(/<svg\s+v-else[\s\S]*?<\/svg>/i)
  if (!matched?.[0]) {
    return ''
  }
  return matched[0].replace(/\s+v-else(?=[\s>])/i, '').trim()
}

/**
 * 函数说明：查询 la_system_config.value 字段类型，必要时自动扩容为 LONGTEXT。
 */
const ensureSystemConfigValueSupportsLargeJson = (runtimeConfig) => {
  const querySql = [
    'SELECT DATA_TYPE',
    'FROM information_schema.COLUMNS',
    `WHERE TABLE_SCHEMA = '${runtimeConfig.dbName}'`,
    "AND TABLE_NAME = 'la_system_config'",
    "AND COLUMN_NAME = 'value';"
  ].join(' ')

  const queryResult = runMysqlSync(runtimeConfig, `${querySql}\n`)
  if (queryResult.status !== 0) {
    logErrorAndExit(queryResult.stderr || queryResult.stdout || '查询 la_system_config.value 字段类型失败')
  }

  const dataType = String(queryResult.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .pop() || ''
  if (dataType === 'longtext') {
    return
  }

  logInfo(`检测到 la_system_config.value 当前为 ${dataType || 'unknown'}，自动扩容为 LONGTEXT...`)
  const alterResult = runMysqlSync(runtimeConfig, `${SYSTEM_CONFIG_LONGTEXT_SQL}\n`)
  if (alterResult.status !== 0) {
    logErrorAndExit(alterResult.stderr || alterResult.stdout || '扩容 la_system_config.value 失败')
  }
}

/**
 * 函数说明：主流程，读取前端菜单数据并同步到后台 website 配置。
 */
const main = async () => {
  const { force } = parseArgs()
  const runtimeConfig = await loadRuntimeConfig()
  ensureSystemConfigValueSupportsLargeJson(runtimeConfig)
  const payloads = await buildSyncPayloads()

  let sql = 'SET NAMES utf8mb4;\nSET @now_ts = UNIX_TIMESTAMP();\n'
  payloads.forEach((payload) => {
    sql += `${buildConfigUpsertSql(payload.name, payload.json, force, payload.repairGarbled)}\n`
  })

  logInfo(`准备同步 ${payloads.length} 项前端菜单配置到后台（db=${runtimeConfig.dbName}，force=${force ? '1' : '0'}）...`)
  const result = runMysqlSync(runtimeConfig, sql)
  if (result.status !== 0) {
    logErrorAndExit(result.stderr || result.stdout || '同步前端菜单配置失败')
  }

  logInfo('前端菜单与工具分类树已同步到后台 website 配置。')
  payloads.forEach((payload) => {
    logInfo(`已处理配置项：${payload.name}`)
  })
}

main().catch((error) => {
  logErrorAndExit(error instanceof Error ? error.message : String(error))
})
