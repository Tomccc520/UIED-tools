-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-08-25
-- 自用模式收口：隐藏并禁用授权管理菜单，保留接口、数据结构和页面代码供后续恢复。
-- 后续恢复入口时执行：UPDATE la_system_auth_menu SET is_show = 1, is_disable = 0 WHERE perms = 'setting:license:detail' OR component = 'setting/website/license';

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO `la_system_config` (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'license', 'enforce', '0', @now_ts, @now_ts FROM DUAL
WHERE NOT EXISTS (
    SELECT 1
    FROM `la_system_config`
    WHERE `type` = 'license' AND `name` = 'enforce'
);

UPDATE `la_system_auth_menu`
SET `is_show` = 0, `is_disable` = 1, `update_time` = @now_ts
WHERE `perms` = 'setting:license:detail'
   OR `component` = 'setting/website/license';

COMMIT;
