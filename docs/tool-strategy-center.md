<!--
@copyright Tomda (https://www.tomda.top)
@copyright UIED技术团队 (https://fsuied.com)
@author UIED技术团队
@createDate 2026-04-28
-->

# 工具主数据中心 / 策略中心说明

适用于 `tools-web` 商业版的工具运营、会员计费、热榜统计与 SEO 统一维护。

## 1. 目标

工具主数据中心与策略中心的收口目标是：

1. 同一个工具只认一份主数据
2. 同一个工具的登录、扣分、会员减免、停用状态只认一套策略口径
3. 后台保存后，前台列表、工具页、热榜、用户扣分链路同步生效
4. 发布前可以自动审计是否存在 `toolKey` 冲突、孤儿规则、内部死链接

## 2. 当前 V1 契约

当前项目已经落地并建议统一维护的字段如下：

- `toolKey`：工具唯一标识
- `title`：工具标题
- `url`：工具访问路径或外链
- `desc`：工具简介
- `status`：工具状态，`1=启用`，`0=停用`
- `consumePoints`：单次消耗积分
- `memberFree`：会员是否免扣
- `sort`：排序值
- `remark`：运营备注
- `needLogin`：是否必须登录后使用
- `allowAnonymousPreview`：是否允许匿名预览
- `anonymousQuota`：匿名额度
- `commercialTier`：商业分层，`free / standard / premium`
- `memberCore`：是否为会员核心卖点工具
- `policyVersion`：策略版本号
- `seoTitle`
- `seoKeywords`
- `seoDescription`
- `seoImage`

说明：

- `toolKey / status / consumePoints / memberFree` 是策略中心最核心的四个字段。
- `needLogin` 已收口到工具主数据与运行时策略：免费工具可匿名使用，标准/会员核心工具默认要求登录。

## 3. 数据来源与生效顺序

### 3.1 工具主数据

后台入口：

- `官网设置 -> 工具主数据`

配置项来源：

- `toolsCategoryTree`

前台消费位置：

- `src/services/siteConfig.ts`
- `src/components/Home/Home.vue`
- `src/components/Tools/ToolList.vue`
- `src/components/Tools/AI/AIToolboxHub.vue`
- 各工具详情页与热榜入口

### 3.2 工具执行策略

后台入口：

- `系统设置 -> 登录与积分策略`
- `官网设置 -> 工具主数据 -> 同步执行策略`

配置项来源：

- `login.toolConsumeRules`
- `login.consumeRiskRules`

前台消费位置：

- `src/composables/useToolConsume.ts`
- `src/services/siteConfig.ts`

### 3.3 生效优先级

前台执行策略按以下顺序读取：

1. `loginToolConsumeRules` 中按 `toolKey` 精确匹配
2. 若未命中，则回退到 `toolCategories` 中工具项自带的 `consumePoints / memberFree / status`
3. 若仍未命中，则使用全局默认积分策略

这意味着：

- 登录与积分策略是“显式覆盖层”
- 工具主数据中的策略字段是“兜底层”
- 两层都没有时，才走默认值

## 4. 当前运营建议

建议日常维护按这个顺序进行：

1. 先在“工具主数据”维护分类、标题、链接、SEO
2. 为关键工具补显式 `toolKey`
3. 对需要差异化扣分的工具，补 `consumePoints / memberFree / status`
4. 如需统一重建登录策略，再执行“同步执行策略”
5. 最后跑自动审计，确认无冲突、无死链接、无孤儿规则

## 5. 自动审计命令

执行：

```bash
npm run audit:tool-strategy
```

该脚本会检查：

- `toolKey` 是否冲突
- `toolKey` 格式是否合法
- 工具主数据中的内部链接是否存在于前端路由
- 登录扣分策略是否存在孤儿 `toolKey`
- 当前有多少工具仍依赖“链接推导 toolKey”
- 当前有多少工具显式配置了 `status / consumePoints / memberFree`

阻断项：

- `toolKey` 冲突
- 内部工具链接未命中路由
- `toolKey` 格式非法

提示项：

- 孤儿规则
- 未显式填写 `toolKey`
- 还没有显式策略字段的工具

## 6. 商业分层建议

当前策略分三层：

- `free`：免费引流工具，`consumePoints=0`，默认无需登录。
- `standard`：标准高价值工具，`consumePoints=1`，登录后使用，会员免扣。
- `premium`：会员核心工具，`consumePoints>=2`，登录后使用，会员免扣，作为会员售卖主卖点。

### 6.1 会员核心 20 个工具

当前会员核心工具固定为 20 个：

1. 证件照换底色
2. 证件照免冠处理
3. 证件照尺寸裁剪
4. 证件照排版打印
5. DeepSeek R1 对话
6. DeepSeek AI 对话
7. AI OCR 识别
8. AI 图片变清晰
9. AI 智能去水印
10. 工作总结
11. 年度工作总结
12. 自定义总结
13. 简历制作
14. 润色会议纪要
15. 研究报告
16. 商业计划书写作
17. AI 文章生成
18. 小红书笔记生成
19. 视频压缩
20. 视频格式转换

### 6.2 工具策略版本化

策略版本化适用于商业售卖后多客户并行升级：

- 每次工具策略变更有版本号
- 升级补丁可感知策略 schema 是否变更
- 客户环境可判断是否需要同步重建 `toolConsumeRules`

## 7. 发布前检查

发布前至少执行：

```bash
npm run audit:tool-strategy
npm run dev:business:smoke
npm run dev:delivery:check
```

建议顺序：

1. 先检查主数据契约
2. 再跑业务闭环冒烟
3. 最后跑交付自检

这样能同时覆盖：

- 数据结构风险
- 业务链路风险
- 环境与升级风险
