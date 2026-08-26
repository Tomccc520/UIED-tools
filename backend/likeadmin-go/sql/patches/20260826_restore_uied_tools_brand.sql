-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-26
-- 修复历史重复配置行中的 Tools/TTools 品牌漂移，统一恢复 UIED-Tools 品牌。

SET NAMES utf8mb4;
START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

UPDATE `la_system_config`
SET `value` = 'UIED-Tools', `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` IN ('name', 'toolsSidebarBrandText');

UPDATE `la_system_config`
SET `value` = 'uiedtool.com', `update_time` = @now_ts
WHERE `type` = 'website'
  AND `name` = 'shopName';

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'name', 'UIED-Tools', @now_ts, @now_ts FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'website' AND `name` = 'name'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'toolsSidebarBrandText', 'UIED-Tools', @now_ts, @now_ts FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'website' AND `name` = 'toolsSidebarBrandText'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'website', 'shopName', 'uiedtool.com', @now_ts, @now_ts FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM `la_system_config` WHERE `type` = 'website' AND `name` = 'shopName'
);

COMMIT;
