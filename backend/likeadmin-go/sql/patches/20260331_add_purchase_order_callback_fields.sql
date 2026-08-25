SET NAMES utf8mb4;

-- 订单回调状态机字段（兼容历史已上线库）
SET @db_name = DATABASE();

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'trade_no'
);
SET @sql = IF(
  @col_exists = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `trade_no` varchar(64) NOT NULL DEFAULT '' COMMENT '第三方交易号' AFTER `pay_channel`",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'callback_status'
);
SET @sql = IF(
  @col_exists = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `callback_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调状态: 0=未回调,1=回调成功,2=回调失败' AFTER `trade_no`",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'callback_time'
);
SET @sql = IF(
  @col_exists = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `callback_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '回调时间' AFTER `callback_status`",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND COLUMN_NAME = 'callback_error'
);
SET @sql = IF(
  @col_exists = 0,
  "ALTER TABLE `la_user_purchase_order` ADD COLUMN `callback_error` varchar(255) NOT NULL DEFAULT '' COMMENT '回调错误信息' AFTER `callback_time`",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND INDEX_NAME = 'idx_callback_status'
);
SET @sql = IF(
  @idx_exists = 0,
  "ALTER TABLE `la_user_purchase_order` ADD INDEX `idx_callback_status` (`callback_status`)",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'la_user_purchase_order' AND INDEX_NAME = 'idx_trade_no'
);
SET @sql = IF(
  @idx_exists = 0,
  "ALTER TABLE `la_user_purchase_order` ADD INDEX `idx_trade_no` (`trade_no`)",
  "SELECT 1"
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
