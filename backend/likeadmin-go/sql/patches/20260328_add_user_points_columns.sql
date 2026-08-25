-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-03-28
--
-- 函数说明：为 la_user 增加积分体系字段，支撑“每日赠送积分 + 工具按次扣积分”。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

SET @points_balance_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'points_balance'
);

SET @points_balance_sql := IF(
    @points_balance_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `points_balance` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''积分余额'' AFTER `qq_email`;',
    'SELECT 1;'
);

PREPARE stmt_points_balance FROM @points_balance_sql;
EXECUTE stmt_points_balance;
DEALLOCATE PREPARE stmt_points_balance;

SET @points_daily_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'points_daily_grant_date'
);

SET @points_daily_sql := IF(
    @points_daily_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `points_daily_grant_date` varchar(10) NOT NULL DEFAULT '''' COMMENT ''积分每日赠送日期'' AFTER `points_balance`;',
    'SELECT 1;'
);

PREPARE stmt_points_daily FROM @points_daily_sql;
EXECUTE stmt_points_daily;
DEALLOCATE PREPARE stmt_points_daily;

SET @points_earned_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'points_total_earned'
);

SET @points_earned_sql := IF(
    @points_earned_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `points_total_earned` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''累计获得积分'' AFTER `points_daily_grant_date`;',
    'SELECT 1;'
);

PREPARE stmt_points_earned FROM @points_earned_sql;
EXECUTE stmt_points_earned;
DEALLOCATE PREPARE stmt_points_earned;

SET @points_consumed_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'points_total_consumed'
);

SET @points_consumed_sql := IF(
    @points_consumed_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `points_total_consumed` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''累计消耗积分'' AFTER `points_total_earned`;',
    'SELECT 1;'
);

PREPARE stmt_points_consumed FROM @points_consumed_sql;
EXECUTE stmt_points_consumed;
DEALLOCATE PREPARE stmt_points_consumed;

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
