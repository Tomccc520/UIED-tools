-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-23
-- 修复官网品牌文案缺失时错误继承后台管理名称的问题。

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

UPDATE `la_system_config`
SET `value` = 'UIED-Tools', `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'name'
  AND TRIM(IFNULL(`value`, '')) IN ('', 'UIEDTool 管理后台', 'UIED-Tools 管理后台');

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarBrandText', 'UIED-Tools', @now_ts, @now_ts FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM `la_system_config`
    WHERE `type` = 'website' AND `name` = 'toolsSidebarBrandText'
);

UPDATE `la_system_config`
SET `value` = 'UIED-Tools', `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'toolsSidebarBrandText'
  AND TRIM(IFNULL(`value`, '')) IN ('', 'UIEDTool 管理后台', 'UIED-Tools 管理后台');

COMMIT;
