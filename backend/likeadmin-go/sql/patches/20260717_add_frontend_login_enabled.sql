-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-07-17
--
-- 函数说明：新增前台登录总开关，默认关闭并启用官网工具免登录模式。

SET NAMES utf8mb4;

START TRANSACTION;

SET @now_ts = UNIX_TIMESTAMP();

INSERT INTO la_system_config (`type`, `name`, `value`, `create_time`, `update_time`)
SELECT 'login', 'frontendLoginEnabled', '0', @now_ts, @now_ts
WHERE NOT EXISTS (
    SELECT 1 FROM la_system_config WHERE `type` = 'login' AND `name` = 'frontendLoginEnabled'
);

COMMIT;
