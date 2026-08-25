-- @copyright Tomda (https://www.tomda.top)
-- @copyright UIED技术团队 (https://fsuied.com)
-- @author UIED技术团队
-- @createDate 2026-04-08
--
-- 函数说明：为素材中心补齐附件元信息字段，支持后台按 WP 媒体库展示与编辑图片参数。

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

START TRANSACTION;

SET @mime_type_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'mime_type'
);
SET @mime_type_sql := IF(
    @mime_type_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `mime_type` varchar(64) NOT NULL DEFAULT '''' COMMENT ''MIME类型'' AFTER `ext`;',
    'SELECT 1;'
);
PREPARE stmt_mime_type FROM @mime_type_sql;
EXECUTE stmt_mime_type;
DEALLOCATE PREPARE stmt_mime_type;

SET @width_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'width'
);
SET @width_sql := IF(
    @width_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `width` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''媒体宽度'' AFTER `mime_type`;',
    'SELECT 1;'
);
PREPARE stmt_width FROM @width_sql;
EXECUTE stmt_width;
DEALLOCATE PREPARE stmt_width;

SET @height_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'height'
);
SET @height_sql := IF(
    @height_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `height` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''媒体高度'' AFTER `width`;',
    'SELECT 1;'
);
PREPARE stmt_height FROM @height_sql;
EXECUTE stmt_height;
DEALLOCATE PREPARE stmt_height;

SET @title_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'title'
);
SET @title_sql := IF(
    @title_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `title` varchar(150) NOT NULL DEFAULT '''' COMMENT ''附件标题'' AFTER `height`;',
    'SELECT 1;'
);
PREPARE stmt_title FROM @title_sql;
EXECUTE stmt_title;
DEALLOCATE PREPARE stmt_title;

SET @alt_text_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'alt_text'
);
SET @alt_text_sql := IF(
    @alt_text_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `alt_text` varchar(255) NOT NULL DEFAULT '''' COMMENT ''替代文本'' AFTER `title`;',
    'SELECT 1;'
);
PREPARE stmt_alt_text FROM @alt_text_sql;
EXECUTE stmt_alt_text;
DEALLOCATE PREPARE stmt_alt_text;

SET @caption_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'caption'
);
SET @caption_sql := IF(
    @caption_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `caption` varchar(255) NOT NULL DEFAULT '''' COMMENT ''说明文字'' AFTER `alt_text`;',
    'SELECT 1;'
);
PREPARE stmt_caption FROM @caption_sql;
EXECUTE stmt_caption;
DEALLOCATE PREPARE stmt_caption;

SET @description_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'description'
);
SET @description_sql := IF(
    @description_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `description` text COMMENT ''附件描述'' AFTER `caption`;',
    'SELECT 1;'
);
PREPARE stmt_description FROM @description_sql;
EXECUTE stmt_description;
DEALLOCATE PREPARE stmt_description;

SET @bind_type_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'bind_type'
);
SET @bind_type_sql := IF(
    @bind_type_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `bind_type` varchar(40) NOT NULL DEFAULT '''' COMMENT ''业务对象类型'' AFTER `description`;',
    'SELECT 1;'
);
PREPARE stmt_bind_type FROM @bind_type_sql;
EXECUTE stmt_bind_type;
DEALLOCATE PREPARE stmt_bind_type;

SET @bind_id_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'bind_id'
);
SET @bind_id_sql := IF(
    @bind_id_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `bind_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT ''业务对象ID'' AFTER `bind_type`;',
    'SELECT 1;'
);
PREPARE stmt_bind_id FROM @bind_id_sql;
EXECUTE stmt_bind_id;
DEALLOCATE PREPARE stmt_bind_id;

SET @bind_title_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'bind_title'
);
SET @bind_title_sql := IF(
    @bind_title_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `bind_title` varchar(255) NOT NULL DEFAULT '''' COMMENT ''业务对象标题'' AFTER `bind_id`;',
    'SELECT 1;'
);
PREPARE stmt_bind_title FROM @bind_title_sql;
EXECUTE stmt_bind_title;
DEALLOCATE PREPARE stmt_bind_title;

SET @bind_url_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'la_album'
      AND COLUMN_NAME = 'bind_url'
);
SET @bind_url_sql := IF(
    @bind_url_exists = 0,
    'ALTER TABLE `la_album` ADD COLUMN `bind_url` varchar(500) NOT NULL DEFAULT '''' COMMENT ''业务对象链接'' AFTER `bind_title`;',
    'SELECT 1;'
);
PREPARE stmt_bind_url FROM @bind_url_sql;
EXECUTE stmt_bind_url;
DEALLOCATE PREPARE stmt_bind_url;

UPDATE `la_album`
SET `title` = `name`
WHERE TRIM(IFNULL(`title`, '')) = ''
  AND TRIM(IFNULL(`name`, '')) <> '';

INSERT INTO `la_system_config` (`type`, `name`, `value`)
SELECT 'material', 'imageCompressEnabled', '1'
WHERE NOT EXISTS (
    SELECT 1 FROM `la_system_config` WHERE `type` = 'material' AND `name` = 'imageCompressEnabled'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`)
SELECT 'material', 'imageCompressMinSizeKB', '300'
WHERE NOT EXISTS (
    SELECT 1 FROM `la_system_config` WHERE `type` = 'material' AND `name` = 'imageCompressMinSizeKB'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`)
SELECT 'material', 'imageCompressJpegQuality', '82'
WHERE NOT EXISTS (
    SELECT 1 FROM `la_system_config` WHERE `type` = 'material' AND `name` = 'imageCompressJpegQuality'
);

INSERT INTO `la_system_config` (`type`, `name`, `value`)
SELECT 'material', 'imageCompressPngCompressionLevel', 'default'
WHERE NOT EXISTS (
    SELECT 1 FROM `la_system_config` WHERE `type` = 'material' AND `name` = 'imageCompressPngCompressionLevel'
);

COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
