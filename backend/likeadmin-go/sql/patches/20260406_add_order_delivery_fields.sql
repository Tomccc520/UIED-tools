-- 用户订单交付字段补丁（支持重复执行）
-- 执行库：uiedtool

BEGIN;
SET NAMES utf8mb4;

SET @db_name = DATABASE();

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'delivery_status') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `delivery_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交付状态: 0=未交付,1=已交付,2=待补充,3=已失效' AFTER `gift_points`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'license_bound_domain') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `license_bound_domain` varchar(255) NOT NULL DEFAULT '' COMMENT '授权绑定域名' AFTER `delivery_status`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'license_key') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `license_key` varchar(255) NOT NULL DEFAULT '' COMMENT '授权码' AFTER `license_bound_domain`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'download_url') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `download_url` varchar(500) NOT NULL DEFAULT '' COMMENT '源码下载链接' AFTER `license_key`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'download_check_status') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `download_check_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '下载检测状态: 0=未检测,1=链接可访问,2=下载异常' AFTER `download_url`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'download_check_time') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `download_check_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最近下载检测时间' AFTER `download_check_status`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'download_check_message') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `download_check_message` varchar(500) NOT NULL DEFAULT '' COMMENT '最近下载检测结果' AFTER `download_check_time`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'delivery_note') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `delivery_note` varchar(500) NOT NULL DEFAULT '' COMMENT '交付备注' AFTER `download_check_message`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql_stmt = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'delivered_time') = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `delivered_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交付时间' AFTER `delivery_note`",
  "SELECT 1"
);
PREPARE stmt FROM @sql_stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

COMMIT;
