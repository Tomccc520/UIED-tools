-- UIED-Tools 3.0.1：新增 Android Nine-patch 工具并同步工具统计。
-- 兼容 MySQL 5.6：仅使用 SET、REPLACE、CONCAT 和 LIKE，不依赖 JSON 函数。

SET NAMES utf8mb4;

SET @nine_patch_tool = '{"id":5181,"title":"免费在线 .9 图生成器","logo":{"type":"svg","name":"imageProcess"},"desc":"Android Nine-patch 可视化制作工具，支持拉伸区、内容区、实时预览和标准 .9.png 导出","url":"/tools/nine-patch","cate":"图片工具","releaseDate":"2026/8/28 00:00:00","isNew":true,"tags":["免费","新品","Android"],"toolKey":"nine-patch","consumePoints":0,"memberFree":true,"status":1,"sort":2185,"remark":"免费引流工具：无需登录扣分","needLogin":false,"allowAnonymousPreview":true,"anonymousQuota":0,"commercialTier":"free","memberCore":false,"policyVersion":"2026-04-commercial-v1"}';

-- 在图片切割与图片拼接之间插入 .9 图工具，避免覆盖后台已维护的其他工具配置。
UPDATE `la_system_config`
SET `value` = REPLACE(
  `value`,
  '},{"id":520,"title"',
  CONCAT('},', @nine_patch_tool, ',{"id":520,"title"')
),
`update_time` = UNIX_TIMESTAMP()
WHERE `type` = 'website'
  AND `name` = 'toolsCategoryTree'
  AND `value` LIKE '%"url":"/tools/img-cut"%'
  AND `value` LIKE '%},{"id":520,"title"%'
  AND `value` NOT LIKE '%"url":"/tools/nine-patch"%';

-- 新增一个正式工具后，站点统计由 333 更新为 334。
UPDATE `la_system_config`
SET `value` = REPLACE(
      REPLACE(`value`, '当前工具总数：333个', '当前工具总数：334个'),
      '最后更新：2026-08-25 14:17',
      '最后更新：2026-08-28 18:00'
    ),
    `update_time` = UNIX_TIMESTAMP()
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogStatsText'
  AND (
    `value` LIKE '%当前工具总数：333个%'
    OR `value` LIKE '%最后更新：2026-08-25 14:17%'
  );

-- 已部署站点的 3.0.1 更新记录补充 Nine-patch 工具说明。
SET @nine_patch_changelog_point = '新增 <strong>免费在线 .9 图生成器</strong>，支持 Android Nine-patch 拉伸区、内容安全区可视化标记、透明边缘修剪、实时预览与标准 <code>.9.png</code> 导出。';

UPDATE `la_system_config`
SET `value` = REPLACE(
  `value`,
  '"新增拼豆图纸生成器，支持图片转色号图纸、用量统计、手动编辑与下载，第三方 Apache-2.0 声明随源码保留。",',
  CONCAT('"新增拼豆图纸生成器，支持图片转色号图纸、用量统计、手动编辑与下载，第三方 Apache-2.0 声明随源码保留。","', @nine_patch_changelog_point, '",')
),
`update_time` = UNIX_TIMESTAMP()
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogTimeline'
  AND `value` LIKE '%新增拼豆图纸生成器%'
  AND `value` NOT LIKE '%免费在线 .9 图生成器%';
