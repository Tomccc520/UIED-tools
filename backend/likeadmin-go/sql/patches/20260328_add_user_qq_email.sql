-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-03-28
--
-- 函数说明：为 la_user 增加 QQ 邮箱持久化字段，支撑前台个人中心“QQ邮箱绑定”后端存储。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

SET @qq_email_column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_user'
      AND COLUMN_NAME = 'qq_email'
);

SET @qq_email_alter_sql := IF(
    @qq_email_column_exists = 0,
    'ALTER TABLE `la_user` ADD COLUMN `qq_email` varchar(64) NOT NULL DEFAULT '''' COMMENT ''QQ邮箱'' AFTER `mobile`;',
    'SELECT 1;'
);

PREPARE stmt_qq_email FROM @qq_email_alter_sql;
EXECUTE stmt_qq_email;
DEALLOCATE PREPARE stmt_qq_email;

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
