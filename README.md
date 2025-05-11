# UIED Tools - 免费在线工具集合

> 最近更新：修改了文档说明，优化了项目结构介绍

这是一个功能丰富的在线工具集合网站，集成了多种实用工具，包括 AI 工具、设计工具、开发工具、等。
部分参考的这个@https://github.com/naroat/tools-web

## 功能特点

### AI 工具
- 🤖 AI 图标生成器：自动生成精美的图标
- 🎨 AI 封面设计：智能生成各类封面图片
- 📝 AI 文案助手：智能生成营销文案
- 🖼️ AI 图片增强：提升图片质量
- 💬 DeepSeek 对话：智能对话助手

### 设计工具
- 🎯 设计规范生成器：快速生成设计规范文档
- 🌈 调色板工具：配色方案生成
- ✂️ 图片裁剪工具：灵活的图片裁剪功能
- 🖼️ 图片格式转换：支持多种格式转换
- 💧 图片水印：添加自定义水印

### 开发工具
- 🔍 正则测试工具：在线测试正则表达式
- 🎨 CSS 格式化：美化 CSS 代码
- 📝 JSON 格式化：格式化 JSON 数据
- 🔒 MD5 加密：在线 MD5 加密工具
- 🎯 Base64 转换：文本和图片的 Base64 转换

## 快速开始

### 环境要求
- Node.js 版本: >= 16.0.0
- npm 版本: >= 8.0.0

### 安装步骤

1. 克隆项目到本地
```bash
# 解压下载的源码包
tar -xzf tools-web-source.tar.gz
cd tools-web
```

2. 安装依赖
```bash
# 使用 npm 安装依赖
npm install
```

3. 启动开发服务器
```bash
# 启动开发服务器
npm run dev
```

4. 构建生产版本
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 项目结构说明

```
tools-web/
├── src/                    # 源代码目录
│   ├── components/        # 组件目录
│   │   ├── Home/         # 首页相关组件
│   │   ├── Tools/        # 工具组件
│   │   │   ├── AI/      # AI 相关工具
│   │   │   ├── Design/  # 设计相关工具
│   │   │   └── Dev/     # 开发相关工具
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── assets/           # 静态资源
│   └── App.vue           # 根组件
├── public/               # 公共资源目录
├── dist/                 # 构建输出目录
└── package.json         # 项目配置文件
```

## 开发指南

### 添加新工具

1. 在 `src/components/Tools` 对应目录下创建新的组件文件
```vue
<!-- 示例：创建新工具组件 -->
<template>
  <div class="tool-container">
    <!-- 工具内容 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>

<style scoped>
/* 组件样式 */
</style>
```

2. 在 `src/router/router.ts` 中添加路由配置
```typescript
{
  path: '/tools/new-tool',
  name: 'NewTool',
  component: () => import('@/components/Tools/NewTool.vue')
}
```

3. 在 `src/components/Tools/tools.ts` 中添加工具信息
```typescript
{
  id: 'new-tool',
  name: '新工具',
  description: '工具描述',
  icon: 'tool-icon',
  category: 'development'
}
```

### 使用组件

```vue
<!-- 示例：使用 Element Plus 组件 -->
<template>
  <el-card class="tool-card">
    <el-form>
      <el-form-item label="输入内容">
        <el-input v-model="input" />
      </el-form-item>
      <el-button type="primary" @click="handleProcess">
        处理
      </el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 定义响应式数据
const input = ref('')

// 处理函数
const handleProcess = () => {
  // 处理逻辑
}
</script>
```

## 注意事项

1. 环境变量
- 开发环境使用 `.env.development`
- 生产环境使用 `.env.production`
- 本地配置使用 `.env.local`（不提交到代码库）

2. 代码规范
- 使用 TypeScript 编写代码
- 遵循 Vue 3 组合式 API 风格
- 使用 Element Plus 组件库的设计规范

3. 性能优化
- 使用异步组件加载
- 合理使用缓存
- 图片资源优化

## 常见问题

1. 安装依赖失败
```bash
# 清除 npm 缓存
npm cache clean --force
# 重新安装依赖
npm install
```

2. 开发服务器启动失败
- 检查端口是否被占用
- 确认 Node.js 版本是否符合要求

3. 构建失败
- 检查是否有语法错误
- 确认依赖是否完整安装

## 技术栈

- Vue 3：前端框架
- TypeScript：开发语言
- Element Plus：UI 组件库
- Vite：构建工具
- Pinia：状态管理
- Vue Router：路由管理

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

MIT License

<div align="center">
  <pre>
    _______          _         __          __  _
 |__   __|        | |        \ \        / / | |
    | | ___   ___ | |___ _____\ \  /\  / /__| |__
    | |/ _ \ / _ \| / __|______\ \/  \/ / _ \ '_ \
    | | (_) | (_) | \__ \       \  /\  /  __/ |_) |
    |_|\___/ \___/|_|___/        \/  \/ \___|_.__/

  </pre>
  <p> 只需简单几步，即可快速搭建属于自己的在线工具箱。</p>

[![node](https://img.shields.io/badge/any_text-18.14.2-red?label=node)](node)
[![vue](https://img.shields.io/badge/any_text-3.3.10-origin?label=vue)](vue)
[![tailwindcss](https://img.shields.io/badge/any_text-3.3.5-yellow?label=tailwindcss)](tailwindcss)
[![elementplus](https://img.shields.io/badge/any_text-2.7-blue?label=element-plus)](elementplus)
[![license](https://img.shields.io/github/license/naroat/tools-web)](LICENSE)

</div>

## 目录

- [功能展览](#功能展览)
- [开始使用](#开始使用)
  - [Docker部署](#Docker部署)
  - [手动部署](#手动部署)
- [工具列表](#工具列表)
- [其他](#其他)

## 功能展示

在线站点：<a href="https://tools.ranblogs.com" target="_blank">Tools-Web</a>

## 开始使用

### Docker部署

```
docker run -d --name tools-web --restart unless-stopped -p 8080:80 docker0796/tools-web:latest
```

访问：`http://127.0.0.1:8080`


### 手动部署

安装依赖
```bash
npm install
```

克隆
```bash
git clone --depth=1 https://github.com/naroat/tools-web.git
```

安装
```bash
# 进入项目
cd tools-web

# 复制配置文件
cp .env.example .env.development

# 安装依赖
npm install
```

启动
```bash
npm run dev
```

打包
```bash
npm run build
```

打包seo静态页面:复制`.env.development`文件，并将文件名修改为`.env.production`,将里面的`NODE_ENV`的值改为`production`,然后运行下面打包命令
```bash
npm run build:pro
```

## 工具列表

- 开发运维
  - 随机密码生成
  - URL编码/解码
  - UUID生成器
  - 时间戳转换
  - MD5在线加密
  - Json在线转换
  - 正则测试工具
  - Unicode转中文
  - HTTP状态码
  - JWT解析
  - html实体转义
  - js代码格式化/压缩
  - Html代码格式化
  - Css代码格式化/压缩

- 文本处理
  - 文本对比
  - markdown编辑器
  - ASCII字形生成器
  - 文本去重
  - 在线文本编辑/HTML获取
  - 字数统计
  - 随机搞笑文案
  - 情感一言
  - 今日诗词
  - 励志一言
  - 舔狗日记

- 教育学术
  - 单位换算
  - 摩斯电码
  - 常用进制转换
  - ASCII码表
  - 长度单位转换
  - 面积单位转换
  - 重量单位转换
  - 时间单位转换
  - 温度单位转换
  - 压力单位转换
  - 热量单位转换
  - 功率单位转换

- 图片处理
  - 二维码生成
  - 在线图片处理
  - 文本转图片
  - 图片分割
  - 动漫头像转换
  - 随机头像
  - 摸头GIF生成器 [新]

- 数据图表
  - 柱状图
  - 折线图
  - 饼图
  - 散点图

- 选择随机
  - 生成随机数
  - 帮我决定
  - 抛硬币
  - 投骰子

- 其他工具
  - 数字转金额大写
  - 手持弹幕
  - 色板
  - Color选择器

## 其他

Q: 我应该如何添加新功能？

A:
  - 在`components/Tools/tools.ts`文件中添加工具信息
  - 在`router/router.ts`中添加路由
  - 拷贝示例目录`components/Tools/Example`修改名称，在这个拷贝出来的目录中开发工具即可
  - 在README.md中的工具列表中添加新功能的介绍

Q: 如何使用工具推荐组件？

A: 工具推荐组件(`ToolsRecommend.vue`)是一个展示相关工具的公共组件,使用步骤如下:

1. 在你的页面中引入组件:
```vue
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'  // 别忘了引入路由
```

2. 在setup中获取路由:
```vue
const route = useRoute()
```

3. 在模板中使用组件:
```vue
<template>
  <!-- 其他内容 -->
  <ToolsRecommend :currentPath="route.path" />
</template>
```

4. 组件功能说明:
   - 相关工具区域: 自动展示6个相同类别的工具和2个其他类别的工具
   - 热门工具区域: 展示8个固定的外部推荐工具(支持跳转到外部网站)
   - 新品上线区域: 随机展示8个最新添加的工具
   - 实用工具区域: 随机展示8个常用工具

5. 重要提示:
   - 每个区域必须展示8个工具,这是固定的
   - 只有热门工具区域支持外部链接,其他区域都是站内跳转
   - 组件会自动根据当前页面路径(currentPath)来获取相关工具
   - 在移动端会自动变为单列布局
   - 所有工具数据来自 `@/components/Tools/tools.ts`

6. 完整示例:
```vue
<template>
  <div class="your-page">
    <!-- 你的页面主要内容 -->
    <div class="main-content">
      ...
    </div>

    <!-- 底部推荐工具区域 -->
    <ToolsRecommend :currentPath="route.path" />
  </div>
</template>

<script setup lang="ts">
import ToolsRecommend from '@/components/Common/ToolsRecommend.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>
```

<br/>

Q: 我可以参与开发 `Tools-Web` 吗？

A: 当然可以，随时欢迎提交 `PR`

## 更新日志

### 2025-01-11 23:01
- 随机工具推荐功能优化
  - 分类功能增强
    - 新增热门工具分类
    - 支持按分类随机推荐工具
    - 优化了分类标签的视觉效果
    - 添加了标签切换的动画效果
  - 交互体验提升
    - 优化了工具卡片的展示效果
    - 添加了加载动画效果
    - 改进了工具卡片的点击响应
    - 优化了移动端适配
  - 性能优化
    - 优化了工具加载逻辑
    - 改进了随机算法
    - 提升了页面渲染性能
  - 热门工具展示
    - 新增热门工具分类展示
    - 支持外部链接跳转
    - 优化了工具推荐逻辑

### 2025-01-10
- 首页组件重构
  - 优化了首页布局和样式
  - 添加了版权信息
  - 统一使用 SVG 图标替换 PNG 图标
  - 优化了工具卡片的展示效果
  - 改进了响应式布局

### 2025-01-09
- 工具推荐组件优化
  - 新增相关工具推荐功能
  - 新增热门工具展示
  - 新增新品上线展示
  - 优化了移动端适配

### 2025-01-10
- 性能优化
  - 优化图标加载性能
  - 减小了图标文件体积
  - 改进了页面加载速度

### 2025-01-12 01:01
- 新增头像工具
  - 功能特性
    - 动漫头像转换：支持将照片转换为动漫风格头像
    - 随机头像生成：支持生成多种风格的随机头像
    - 图片格式限制：支持JPG/PNG格式，文件大小限制10MB
  - 用户体验
    - 添加温馨提示说明
    - 优化加载状态显示
    - 完善错误提示信息
  - 技术实现
    - 使用base64方式传递图片数据
    - 添加详细的错误处理机制
    - 优化请求响应处理

### 2025-01-12 01:30
- 新增摸头GIF生成器
  - 功能特性
    - 支持上传图片或输入QQ号生成摸头GIF
    - 支持JPG/PNG格式，文件大小限制10MB
    - 提供拖拽上传和一键下载功能
  - 用户体验
    - 双模式切换：图片上传/QQ号输入
    - 实时预览效果
    - 优化加载状态显示
  - 技术实现
    - 集成摸头GIF生成API
    - 支持多种输入方式
    - 完善的错误处理机制

### 2025-01-12 02:07
- 摸头GIF生成工具上线
  - 功能特性
    - 支持上传图片生成摸头GIF
    - 实时预览功能
    - 一键下载生成的GIF
    - 优雅的加载动画和交互效果
  - 用户体验优化
    - 优化图片上传和预览功能
    - 添加实时预览和加载动画
    - 完善错误提示信息
  - 界面美化
    - 采用新的界面设计
    - 优化布局和交互效果
    - 完善移动端响应式布局
  - 技术实现
    - 使用FormData方式上传图片
    - 集成摸头GIF生成API
    - 完善的错误处理机制

Q: 如何在首页使用 SVG 图标？

A: 在首页使用 SVG 图标非常简单，主要有以下几个步骤：

1. SVG 图标定义方式：
```typescript
// 在 components/Tools/tools.ts 中定义工具时
{
  id: 1,
  title: "工具名称",
  // 方式一：使用 SVG 图标
  logo: {
    type: 'svg',
    name: 'password' // 这里的 name 对应 assets/icons 目录下的 SVG 文件名
  },
  // 方式二：使用图片链接（不推荐）
  // logo: 'https://example.com/icon.png',
  desc: "工具描述",
  url: "/tools/example"
}
```

2. 在组件中使用 `ToolIcon` 组件显示图标：
```vue
<template>
  <ToolIcon :icon="item.logo" />
</template>

<script setup lang="ts">
import ToolIcon from '@/components/Tools/ToolIcon.vue'
</script>
```

3. SVG 图标存放规则：
   - 所有 SVG 图标文件都放在 `src/assets/icons` 目录下
   - 图标文件名使用小写字母，例如：`password.svg`
   - 建议图标尺寸保持一致，推荐 24x24 像素
   - SVG 文件内容需要移除宽高属性，以便于自适应

4. 添加新的 SVG 图标：
   - 准备好 SVG 文件（可以从 iconfont 等图标库下载）
   - 将 SVG 文件放入 `src/assets/icons` 目录
   - 在 `tools.ts` 中通过 `{ type: 'svg', name: '文件名' }` 引用

5. 使用建议：
   - 优先使用 SVG 图标，可以自适应大小且清晰度高
   - 图标颜色会自动继承父元素的文本颜色
   - 如果需要多色图标，确保 SVG 文件中的 fill 属性使用 currentColor

# UIED-Tools 在线工具集

## 🚀 新增功能

### 1. 随机工具推荐
- 位置：左侧菜单栏顶部
- 功能：随机推荐各种实用工具，帮助用户发现更多好用的功能
- 使用方法：点击"随机工具"即可跳转到随机推荐页面
- 技术实现：
  - 路由：`/tools/random-tools`
  - 组件：`RandomTools.vue`
  - 数据来源：从工具库中随机筛选

### 2. 图标动画优化
- SVG 图标交互效果增强
- 鼠标悬停时触发动画效果
- 动画持续时间：1.5秒
- 实现方式：CSS 动画，无需额外 JavaScript

### 3. 界面优化
- 左侧菜单布局优化
  - Logo 区域：展示应用名称和描述
  - 菜单分类：清晰的工具分类导航
  - 图标样式：统一的线性图标 + 绿点装饰

### 4. 路由优化
- 移除了不存在的路由（如 jsformat、base64）
- 优化了路由配置，提高加载性能
- 添加了新的随机工具路由配置

## 🔧 技术栈

- Vue 3 + TypeScript
- Vue Router
- Pinia 状态管理
- Element Plus UI
- Tailwind CSS

## 📦 项目结构

```
src/
├── components/
│   ├── Layout/
│   │   └── Left/           # 左侧菜单组件
│   │   └── Tools/              # 工具组件
│   ├── router/                 # 路由配置
│   ├── store/                 # 状态管理
│   └── assets/                # 静态资源
```

## 🚀 快速开始

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 📝 开发指南

### 添加新工具

1. 在 `src/components/Tools` 下创建新的工具组件
2. 在 `src/router/router.ts` 中添加路由配置
3. 在 `src/components/Tools/tools.ts` 中添加工具信息
4. 在 `src/components/Layout/Left/Left.vue` 中添加菜单项

### 组件开发规范

1. 使用 TypeScript 进行类型检查
2. 使用 `<script setup>` 语法
3. 组件命名采用大驼峰命名法
4. 添加必要的注释和文档

### 图标开发规范

1. 使用 SVG 格式的图标
2. 统一使用线性风格
3. 添加绿点装饰效果
4. 实现悬停动画效果

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 版权信息

Copyright © 2024 UIED技术团队 (https://fsuied.com)

## 新手开发指南

### 随机工具推荐功能实现

#### 1. 组件结构
```vue
<!-- RandomTools.vue 的基本结构 -->
<template>
  <div class="random-tools-container">
    <!-- 1. 顶部操作区 -->
    <div class="header-section">
      <!-- 标题和描述 -->
      <!-- "换一批"按钮 -->
    </div>

    <!-- 2. 分类筛选区 -->
    <div class="categories-section">
      <!-- 分类标签列表 -->
    </div>

    <!-- 3. 工具卡片网格 -->
    <TransitionGroup>
      <!-- 工具卡片列表 -->
    </TransitionGroup>
  </div>
</template>
```

#### 2. 核心功能实现
```typescript
// 1. 状态管理
const loading = ref(false)          // 加载状态
const selectedCategory = ref(0)     // 当前选中的分类
const randomTools = ref<Tool[]>([]) // 随机工具列表
const categories = ref<ToolCategory[]>([]) // 分类列表

// 2. 刷新工具列表
const refreshTools = async () => {
  loading.value = true
  try {
    // 获取工具分类
    await store.getToolCate()
    categories.value = store.cates

    // 获取所有工具
    const allTools = store.toolsList()

    // 根据分类筛选
    const filteredTools = selectedCategory.value === 0
      ? allTools
      : allTools.filter(tool => tool.cateId === selectedCategory.value)

    // 随机选择6个工具
    randomTools.value = shuffleArray(filteredTools).slice(0, 6)
  } finally {
    loading.value = false
  }
}

// 3. 工具随机算法
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
```

#### 3. 样式实现
```css
/* 1. 卡片基础样式 */
.tool-card {
  height: 280px;
  background: white;
  border-radius: 1rem;
  transition: all 0.3s;
}

/* 2. 渐变背景效果 */
.gradient-bg {
  background: linear-gradient(to right, #3b82f6, #6366f1);
}

/* 3. 动画效果 */
.tools-grid-enter-active,
.tools-grid-leave-active {
  transition: all 0.5s ease;
}

.tools-grid-enter-from,
.tools-grid-leave-to {
  opacity: 0;
  transform: translateY(20pxza
}
```

#### 4. 使用说明
1. 组件位置：`src/components/Tools/RandomTools/RandomTools.vue`
2. 路由配置：在 `router.ts` 中添加 `/tools/random-tools` 路由
3. 数据来源：工具数据从 `tools.ts` 中获取
4. 状态管理：使用 Pinia store 管理工具数据

#### 5. 开发建议
- 使用 TypeScript 进行类型检查
- 遵循组件命名规范
- 保持代码整洁，添加必要注释
- 优先使用 CSS 动画提升性能
- 注意移动端适配
- 定期测试功能完整性

#### 6. 常见问题
1. 类型报错：确保正确导入 Tool 和 ToolCategory 类型
2. 动画卡顿：检查 transition 性能
3. 数据加载失败：检查 store 和 API 调用
4. 样式异常：检查 CSS 权重和响应式布局

#### 7. 性能优化建议
- 使用 v-show 替代频繁的 v-if
- 合理使用 computed 属性
- 避免不必要的深层监听
- 优化图片和资源加载
- 使用骨架屏提升体验


