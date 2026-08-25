-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-25
-- 将已部署站点更新记录中的旧工具统计从 334 修正为 333，不覆盖其他运营自定义文案。

SET NAMES utf8mb4;

START TRANSACTION;

UPDATE `la_system_config`
SET `value` = REPLACE(`value`, '当前工具总数：334个', '当前工具总数：333个'),
    `update_time` = UNIX_TIMESTAMP()
WHERE `type` = 'website'
  AND `name` = 'toolsChangelogStatsText'
  AND `value` LIKE '%当前工具总数：334个%';

COMMIT;
