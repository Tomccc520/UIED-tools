# 四个文案工具改用站内内容库（2026-11-12）

| 工具 | 当前内容 | 页面 |
| --- | --- | --- |
| 疯狂星期四 | 两路网络文案轮换，100 条原创段子及配套英文兜底 | `/tools/copywriting/kfc` |
| 今日诗词 | 366 首完整诗词，附篇名、作者、朝代和出处 | `/tools/copywriting/daily-poem` |
| 舔狗日记 | 夏柔 API 随机日记，100 篇原创虚构日记兜底 | `/tools/copywriting/dog-diary` |
| 朋友圈文案 | 200 条原创文案，日常、出游、工作、松弛各 50 条 | `/tools/copywriting/moments` |

改动前从生产入口各探测一次，四个接口当时均为 HTTP 200；疯狂星期四和舔狗日记返回 `source=fallback`，今日诗词和朋友圈文案返回 `source=upstream`。这是一次采样，不能据此判断各上游长期可用性。

## 如何维护

前后端共用 [copywriting_library](../backend/likeadmin-go/server/admin/service/common/copywriting_library/) 下的四个文件。每页只随自身构建产物加载对应的内容库。增补或修正时编辑对应文件的 `items`，保持 `id` 唯一、正文不重复，并更新 `updatedAt`（北京时间 `YYYY-MM-DD`）。同一条内容的常规修订可保留原 ID。

- `kfc`：中文 `text` 与英文 `english` 成对维护。仅收录原创玩梗内容，不写未经验证的价格、优惠或活动。
- `daily-poem`：完整正文用 `\n` 分行，保留 `title`、`author`、`dynasty`、`from`。新增 240 首唐诗采用古登堡计划第 52323 号《唐诗三百首》转录本，102 首宋词采用朱孝臧编《宋词三百首》的维基文库转录本。正文统一简体并保留分行，选录时按正文和同作者异题排除重复。[《唐诗三百首》](https://www.gutenberg.org/ebooks/52323) · [《宋词三百首》底本转录](https://zh.wikisource.org/w/index.php?title=%E5%AE%8B%E8%A9%9E%E4%B8%89%E7%99%BE%E9%A6%96&oldid=12723602)
- `dog-diary`：使用原创虚构段子，不引用真实私聊和可识别个人信息。
- `moments`：保留场景 `topic`，每个场景至少两条，方便用户继续换内容。

发布新版 Go 服务后，四页在下次打开时从 `GET /api/common/copywriting/library/:kind` 同步站内内容，接口成功响应可缓存 5 分钟。重建前端会更新内置库，接口超时或遇到同日旧版接口时仍能使用已随页面加载的完整内容。当天精选由北京时间日序决定，当前诗词库 366 天轮换一遍。

疯狂星期四首屏使用站内精选。「换一条」经 `GET /api/common/copywriting/kfc` 获取内容。网关在 v50 和 60s API 间交替选择首个请求，每路最多等待 2 秒。请求失败后跳过该来源 30 秒，两路不可用时返回 `source=editorial`，前端继续沿站内库顺序切换。网络文案在用户查看英文时按需翻译，站内文案直接使用配套英文。[v50 文档](https://api.aa1.cn/doc/v50.html) · [60s API](https://github.com/vikiboss/60s)

舔狗日记首屏使用站内精选。「换一篇」经 `GET /api/common/copywriting/random/dog-diary` 请求夏柔 API。网关使用 `aa1=json` 获取正文，同时兼容文档中的 `newslist[].content`。接口超时、返回错误或无正文时，从站内内容库切换下一篇。[夏柔 API 文档](https://api.aa1.cn/doc/tiangou.html)

2026-11-12 核对的两条文档分别指向 `api.pearktrue.cn` 和 `api.52starxi.cn`。两域的 DNS 查询均返回 `NXDOMAIN`，前述轮换使用同日实测能返回不同文案的来源。[PearAPI 文档](https://api.aa1.cn/doc/kfcvme50.html) · [星速 API 文档](https://api.aa1.cn/doc/kdj-w4.html)

## 验证

- Go 测试覆盖疯狂星期四的双源轮换、超时切换和故障兜底，也覆盖夏柔日记的两种响应格式。通过同域接口实测两路星期四文案和四篇不同的夏柔日记。
- TypeScript、生产构建和 907 项前端单测通过。单测还验证网络日记来源和复制内容，以及快速换条后迟到的翻译不会覆盖当前文案。
- 四个页面通过 320、375、768、1440px 浏览器回归。实测各页只加载对应内容库，回车可换内容，复制长篇《桃源行》会保留全文、作者与出处。模拟内容库接口 HTTP 503 时，四个页面仍可浏览完整内容。
