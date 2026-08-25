-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-03-30
--
-- 函数说明：补齐会员字段与登录会员配置，支撑“会员等级/到期时间/试用天数”基础能力。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

SET @member_level_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'member_level'
);

SET @member_level_sql := IF(
    @member_level_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `member_level` varchar(20) NOT NULL DEFAULT ''free'' COMMENT ''会员等级'' AFTER `points_total_consumed`;',
    'SELECT 1;'
);

PREPARE stmt_member_level FROM @member_level_sql;
EXECUTE stmt_member_level;
DEALLOCATE PREPARE stmt_member_level;

SET @member_expire_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'member_expire_time'
);

SET @member_expire_sql := IF(
    @member_expire_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `member_expire_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''会员到期时间'' AFTER `member_level`;',
    'SELECT 1;'
);

PREPARE stmt_member_expire FROM @member_expire_sql;
EXECUTE stmt_member_expire;
DEALLOCATE PREPARE stmt_member_expire;

INSERT INTO `la_system_config` (`id`, `type`, `name`, `value`, `create_time`, `update_time`)
SELECT
    (SELECT COALESCE(MAX(id), 0) + 1 FROM `la_system_config`) AS next_id,
    'login',
    'memberEnabled',
    '0',
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1
    FROM `la_system_config`
    WHERE `type` = 'login' AND `name` = 'memberEnabled'
);

INSERT INTO `la_system_config` (`id`, `type`, `name`, `value`, `create_time`, `update_time`)
SELECT
    (SELECT COALESCE(MAX(id), 0) + 1 FROM `la_system_config`) AS next_id,
    'login',
    'memberTrialDays',
    '0',
    UNIX_TIMESTAMP(),
    UNIX_TIMESTAMP()
WHERE NOT EXISTS (
    SELECT 1
    FROM `la_system_config`
    WHERE `type` = 'login' AND `name` = 'memberTrialDays'
);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
