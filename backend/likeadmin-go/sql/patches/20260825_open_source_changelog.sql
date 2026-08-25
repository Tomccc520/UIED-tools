-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-25
-- 将既有更新记录配置从商业版分岔策略切换为 3.0.1 全栈开源说明；仅迁移旧默认值，不覆盖运营自定义内容。

SET NAMES utf8mb4;
SET SESSION sql_mode = CONCAT(@@sql_mode, ',NO_BACKSLASH_ESCAPES');

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

UPDATE `la_system_config`
SET `value` = 'UIED-Tools 现已开放主站、Go API 与管理后台源码，持续以免费工具、内容与社区共建获取长期流量。',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogIntroText'
  AND `value` = '由 Tomda 开发（AI协助）并记录 UIED-Tools 的开发历程和功能更新。公众号：Tomda';

UPDATE `la_system_config`
SET `value` = '[{"name":"GitHub 源码仓库","link":"https://github.com/Tomccc520/UIED-tools"},{"name":"提交问题","link":"https://github.com/Tomccc520/UIED-tools/issues"},{"name":"CSDN 博客","link":"https://blog.csdn.net/Tomdac?spm=1000.2115.3001.5343"},{"name":"UIED技术团队","link":"https://fsuied.com/"}]',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogMetaLinks'
  AND `value` LIKE '%Gitee（闭源版）%';

UPDATE `la_system_config`
SET `value` = '3.0.1 全栈开源说明',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogSplitTitle'
  AND `value` = '工具箱 3.0.0 版本分岔提醒';

UPDATE `la_system_config`
SET `value` = '本版本新增 Go API、Arco Pro 管理后台、数据库脚本与部署工具，并与 Vue 3 主站一起按 MIT 协议开放源码。项目优先服务免费使用、SEO 内容和社区贡献，非必要商业化入口默认不展示。',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogSplitDesc'
  AND (
    `value` LIKE '%后台运营、会员与模型管理能力的版本为商业源码版%'
    OR `value` = '本版本新增 Go API、Arco Pro 管理后台、数据库脚本与部署工具，并与 Vue 3 主站一起按 MIT 协议开放源码。商业授权默认关闭，项目优先服务免费使用、SEO 内容和社区贡献。'
  );

UPDATE `la_system_config`
SET `value` = 'https://github.com/Tomccc520/UIED-tools',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogSplitLink'
  AND `value` = 'https://fsuied.com/';

UPDATE `la_system_config`
SET `value` = '查看完整源码与部署说明',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogSplitLinkText'
  AND `value` = '购买源码与服务支持（fsuied.com）';

UPDATE `la_system_config`
SET `value` = '当前版本：3.0.1 全栈开源版 | 当前工具总数：334个 | 最后更新：2026-08-25 14:17',
    `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogStatsText'
  AND `value` = '当前工具总数：334个 | 最后更新：2026-07-29 23:31';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '2026-07-29 23:31', '2026-08-25 14:17'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline'
  AND `value` LIKE '%商业化能力、前后台体验与部署链路全面收口%';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '部署候选', '全栈开源'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline'
  AND `value` LIKE '%商业化能力、前后台体验与部署链路全面收口%';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '商业化能力、前后台体验与部署链路全面收口', '主站、Go API 与 Arco Pro 管理后台全面开源'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '会员与工具商业化', '开源策略升级'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '完成 20 个会员核心工具的统一策略接入，停用、登录、扣费、外链和内部跳转统一由运行入口校验。', 'Vue 3 主站、Go API、Arco Pro 管理后台、数据库脚本和部署工具统一在 GitHub 开放源码。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '登录功能支持后台开启或关闭；关闭时工具可免登录使用，积分与会员信息集中在用户中心展示。', '项目继续采用 MIT 许可，允许学习、修改、部署和二次开发；第三方组件保留各自许可证与版权声明。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '订单状态统一为待支付、已支付和已关闭，后台支持订单筛选、补单、关闭与导出。', '取消纯前端开源版与后台商业版的分岔策略，当前重点转向免费工具、SEO 内容与社区流量。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '取消纯前端开源版与后台商业版的分岔策略，商业授权默认关闭，当前重点转向免费工具、SEO 内容与社区流量。', '取消纯前端开源版与后台商业版的分岔策略，当前重点转向免费工具、SEO 内容与社区流量。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '前台体验与内容运营', '新增 Go 后台与运营能力'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '首页移动端工具卡调整为双列并收紧左右间距，热榜、随机工具、登录弹窗和头部操作区完成视觉重构。', '新增基于 likeadmin-go 的 Go API 与 Arco Pro 管理端，统一提供菜单权限、站点配置、SEO、工具主数据、用户和系统运维入口。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '每日学习改为 RSS 动态内容源，支持按分类别名、分类 ID 和多分类组合配置。', '前端布局、头部、侧栏、页脚、更新记录、每日学习与工具策略均可由后台配置，并增加保存回读校验和明确的成功/失败提示。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '视频压缩与 GIF 压缩补齐格式说明、进度、结果对比、失败兜底和下载体验。', '生产部署统一为主站 <code>/</code>、管理端 <code>/admin/</code> 与 API <code>/api/</code> 同域运行，附带数据库补丁和宝塔更新脚本。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '后台 Arco Pro 收口', '前台体验与内容运营'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'Workbench、权限、组织、日志、缓存、渠道、工具主数据和前端布局等 P0 页面统一操作区与信息层级。', '首页移动端工具卡调整为双列并收紧左右间距，热榜、随机工具、登录弹窗和头部操作区完成视觉重构。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '前端布局、头部、页脚和 SEO 配置页将说明及统计收进折叠区，核心运营表单与保存操作常驻。', '每日学习改为 RSS 动态内容源，支持按分类别名、分类 ID 和多分类组合配置。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '工具主数据补齐同步高频工具、策略同步、一键体检、缺失策略提示和前端预览。', '视频压缩、GIF 压缩与 20 个高价值工具补齐结果反馈、失败兜底、复制/下载和移动端体验。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '抠图服务改为 API 提供商', '工具与 AI 能力'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '移除本地 ModelScope 抠图模型及其大体积运行依赖，服务端保留统一安全代理。', '新增拼豆图纸生成器，支持图片转色号图纸、用量统计、手动编辑与下载，第三方 Apache-2.0 声明随源码保留。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '后台可配置阿里云抠图 API 或抠抠图 API 的密钥与地址，前台不暴露第三方密钥。', '抠图移除大体积本地模型，改为后端安全代理第三方 API；密钥仅在后台配置，不暴露给浏览器。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '未配置可用提供商时返回明确提示，不再静默调用效果不稳定的本地模型。', 'AI 简历源码保留独立构建能力，正式环境可按需启用，不影响主站与 Go 后台部署。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'AI 简历开发预告', '后台 Arco Pro 收口'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'AI 简历已完成主流程开发与主站适配，本期正式版本暂缓开放入口，后续完成静态化与 Go 接口迁移后上线。', 'Workbench、权限、组织、日志、缓存、渠道、工具主数据和前端布局等 P0 页面统一操作区与信息层级。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '编辑器补齐专业模板、移动端全屏编辑、AI 内容对比/应用/撤销闭环，并保留独立构建和发布能力。', '工具主数据补齐同步高频工具、策略同步、一键体检、缺失策略提示和前端预览。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '现有代码与测试完整保留，不影响本期主站、管理后台及其他工具部署。', '自用模式默认隐藏非必要商业化入口；会员、订单和支付模块保留为可选能力，不影响免费工具运行。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '自用模式默认隐藏授权入口并关闭强制授权校验；会员、订单和支付模块保留为可选能力，不影响免费工具运行。', '自用模式默认隐藏非必要商业化入口；会员、订单和支付模块保留为可选能力，不影响免费工具运行。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '版本继续保持 <strong>3.0.1</strong>，本轮不扩工具数量，优先保证部署、运营和续费链路稳定。', '版本继续保持 <strong>3.0.1</strong>，本轮优先保证开源可运行、配置可回环、部署可复现和核心工具稳定。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '版本分岔', '架构演进'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline'
  AND `value` LIKE '%纯前端开源版与后台商业版正式分离%';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '纯前端开源版与后台商业版正式分离', '从纯前端工具箱开始建设后台运营能力'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '版本策略调整', '阶段性策略'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '纯前端开源版在 3.0.0 作为分岔节点，后续仅做稳定维护与安全修复。', '3.0.0 开始验证前后台分离、站点配置和模型管理能力，为全栈运营奠定基础。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '后台运营配置、模型管理、会员支付等能力归入商业源码版。', '该阶段曾计划拆分开源版与商业版；3.0.1 已取消分岔，并将新增后台能力一并开源。'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '商业版获取与服务支持统一入口：', '历史版本策略已结束，3.0.1 起统一开源：'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, 'https://fsuied.com/', 'https://github.com/Tomccc520/UIED-tools'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline'
  AND `value` LIKE '%历史版本策略已结束，3.0.1 起统一开源%';

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '>fsuied.com</a>', '>GitHub 源码仓库</a>'),
    `update_time` = @now_ts
WHERE `type` = 'website' AND `name` = 'toolsChangelogTimeline'
  AND `value` LIKE '%历史版本策略已结束，3.0.1 起统一开源%';

COMMIT;
